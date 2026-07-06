<?php

namespace BcSitkaSpruce\Library\Enqueuer;

/**
 * An API for loading theme scripts and stylesheets.
 *
 * Supports resource preloading via the optional $preload parameter in addScript()
 * and addStyle(). To preload a resource, pass a resource hint type such as 'preload'
 * or 'prefetch' as the last parameter:
 *
 * @code
 * $enqueuer->addStyle('theme-style', '/assets/css/main.css', [], '', '1.0.0', 'all', 'preload');
 * $enqueuer->addScript('app-js', '/assets/js/app.js', [], '', '1.0.0', true, 'preload');
 * @endcode
 *
 * Preloaded resources will automatically include:
 * - Version numbers from registered assets
 * - crossorigin='anonymous' for external resources (protocol-relative URLs)
 * - Appropriate 'as' and 'type' attributes
 *
 * External scripts and styles receive crossorigin='anonymous' on their output
 * tags via the wp_script_attributes and style_loader_tag filters so preload
 * hints match the credentials mode of the final resource request.
 */
class Enqueuer implements EnqueuerInterface {

	protected array $scripts = array();

	protected array $deregisteredScripts = array();

	protected array $styles = array();

	protected array $blockStyles = array();

	protected array $deregisteredStyles = array();

	protected bool $appendVersion = false;

	protected string $currentTime = '';

	protected array $preloadScripts = array();

	protected array $preloadStyles = array();

	public function __construct() {
		add_action( 'wp_enqueue_scripts', array( $this, 'setupEnqueueScripts' ), 10, 0 );
		add_action( 'wp_enqueue_scripts', array( $this, 'setupDeregisterScripts' ), 99, 0 );
		add_action( 'enqueue_block_assets', array( $this, 'setupRegisterStyles' ), 10, 0 ); // Register styles on front end and in block editor
		add_action( 'wp_enqueue_scripts', array( $this, 'setupEnqueueStyles' ), 10, 0 ); // Enqueue registered styles on front end only
		add_action( 'wp_enqueue_scripts', array( $this, 'setupDeregisterStyles' ), 99, 0 );
		add_action( 'init', array( $this, 'setupEnqueueBlockStyles' ), 10, 0 );
		add_filter('wp_preload_resources', [$this, 'setupPreloadResources'], 10, 1);
		add_filter('style_loader_tag', [$this, 'addCrossoriginToExternalStyles'], 10, 2);
		add_filter('wp_script_attributes', [$this, 'addCrossoriginToExternalScripts'], 10, 1);
	}

	/**
	 * @inheritDoc
	 */
	public function addScript(
		string $handle,
		string $src,
		array|null $dependencies = array(),
		$base_path = '',
		$version = null,
		bool $footer = true,
		bool $use_asset_file = false,
		string $preload = ''
	): void {

		if ( $use_asset_file ) {
			$asset        = include get_parent_theme_file_path( ltrim( $src, '/' ) );
			$src          = str_replace( '.asset.php', '.js', $src );
			$version      = $asset['version'];
			$dependencies = array_merge( $dependencies, $asset['dependencies'] ?? array() );
		}

		$this->scripts = array_merge(
			$this->scripts,
			array(
				$handle => array(
					'src'          => $this->convertLocalSrc( $src, $base_path ),
					'dependencies' => $dependencies,
					'version'      => $version,
					'footer'       => $footer,
				),
			)
		);

		if ( $preload ) {
			$this->preloadScripts[$handle] = $preload;
		}
	}

	/**
	 * @inheritDoc
	 */
	public function removeScript( string $handle ): void {
		if ( in_array( $handle, $this->scripts, true ) ) {
			unset( $this->scripts[ $handle ] );
		} elseif ( ! in_array( $handle, $this->deregisteredScripts, true ) ) {
			$this->deregisteredScripts[] = $handle;
		}
	}

	/**
	 * @inheritDoc
	 */
	public function addStyle(
		string $handle,
		string $src,
		array|null $dependencies = array(),
		$base_path = '',
		$version = null,
		string $media = 'all',
		bool $use_asset_file = false,
		bool $enqueue = true,
		string $preload = ''
	): void {
		if ( $use_asset_file ) {
			$asset        = include get_parent_theme_file_path( ltrim( $src, '/' ) );
			$src          = str_replace( '.asset.php', '.css', $src );
			$version      = $asset['version'];
			$dependencies = array_merge( $dependencies, $asset['dependencies'] ?? array() );
		}
		$this->styles = array_merge(
			$this->styles,
			array(
				$handle => array(
					'src'          => $this->convertLocalSrc( $src, $base_path ),
					'dependencies' => $dependencies,
					'version'      => $version,
					'media'        => $media,
					'enqueue'      => $enqueue,
				),
			)
		);

		if ( $preload ) {
			$this->preloadStyles[$handle] = $preload;
		}
	}

	/**
	 * @inheritDoc
	 */
	public function removeStyle( string $handle ): void {
		if ( in_array( $handle, $this->styles, true ) ) {
			unset( $this->styles[ $handle ] );
		} elseif ( ! in_array( $handle, $this->deregisteredStyles, true ) ) {
			$this->deregisteredStyles[] = $handle;
		}
	}

	/**
	 * @inheritDoc
	 */
	public function addBlockStyle(
		string $handle,
		array $blocks,
		array $dependencies = array()
	): void {
		$handle_prefix = 'bc-sitka-spruce-style-';
		$path          = '/assets/dist/css/blocks/';
		$source        = $path . $handle . '.asset.php';
		$full_handle   = $handle_prefix . $handle;

		$this->addStyle(
			handle: $full_handle,
			src: $source,
			dependencies: $dependencies,
			use_asset_file: true,
			enqueue: false
		);

		$this->blockStyles = array_merge(
			$this->blockStyles,
			array(
				$full_handle => $blocks,
			)
		);
	}


	/**
	 * Convert a local source path to the correct base path.
	 *
	 * @param string $src
	 *   The source file.
	 * @param string $base_path
	 *   The base path. Leave empty for the current theme's path.
	 *
	 * @return string
	 *   The converted source path.
	 */
	protected function convertLocalSrc( string $src, string $base_path = '' ): string {
		$path = $base_path ?: get_stylesheet_directory_uri();
		return $this->isExternalResource($src) ? $src : $path . $src;
	}

	/**
	 * Determine whether a resource URL is loaded from an external origin.
	 *
	 * Protocol-relative URLs (//example.com/...) are treated as external so
	 * preload hints and enqueue tags share the same crossorigin credentials mode.
	 */
	protected function isExternalResource(string $src): bool {
		return strpos($src, '//') === 0;
	}

	/**
	 * Callback for the 'wp_enqueue_scripts' action.
	 */
	public function setupEnqueueScripts(): void {
		foreach ( $this->scripts as $handle => $script ) {
			$dependencies = $script['dependencies'] ?? array();
			$footer       = $script['footer'] ?? true;
			wp_enqueue_script( $handle, $script['src'], $dependencies, $this->generateVersion( $script['version'] ), $footer );
		}
	}

	/**
	 * Callback for the 'wp_enqueue_scripts' action.
	 */
	public function setupDeregisterScripts(): void {
		foreach ( $this->deregisteredScripts as $handle ) {
			wp_deregister_script( $handle );
		}
	}

	/**
	 * Callback for the 'enqueue_block_assets' action.
	 */
	public function setupRegisterStyles(): void {
		foreach ( $this->styles as $handle => $style ) {
			$dependencies = $style['dependencies'] ?? array();
			$media        = $script['media'] ?? 'all';
			wp_register_style( $handle, $style['src'], $dependencies, $this->generateVersion( $style['version'] ), $media );
		}
	}

	/**
	 * Callback for the 'ewp_enqueue_scripts' action.
	 */
	public function setupEnqueueStyles(): void {
		foreach ( $this->styles as $handle => $style ) {
			if ( $style['enqueue'] ) {
				wp_enqueue_style( $handle );
			}
		}
	}

	/**
	 * Add crossorigin to external stylesheet link tags.
	 *
	 * WordPress does not output crossorigin from wp_style_add_data(); the
	 * style_loader_tag filter is the supported way to modify enqueued link tags.
	 *
	 * @param string $tag
	 *   The HTML link tag for the enqueued style.
	 * @param string $handle
	 *   The style's registered handle.
	 *
	 * @return string
	 *   The modified link tag.
	 */
	public function addCrossoriginToExternalStyles(string $tag, string $handle): string {
		$style = wp_styles()->registered[$handle] ?? null;

		if (!$style || !$this->isExternalResource($style->src)) {
		return $tag;
		}

		$processor = new \WP_HTML_Tag_Processor($tag);

		if ($processor->next_tag('link')) {
		$processor->set_attribute('crossorigin', 'anonymous');
		}

		return $processor->get_updated_html();
	}

	/**
	 * Add crossorigin to external script tags.
	 *
	 * WordPress does not output crossorigin from wp_script_add_data(); the
	 * wp_script_attributes filter is the supported way to modify script tags.
	 *
	 * @param array<string, string|bool> $attributes
	 *   Key-value pairs representing script tag attributes.
	 *
	 * @return array<string, string|bool>
	 *   The modified script attributes.
	 */
	public function addCrossoriginToExternalScripts(array $attributes): array {
		if (empty($attributes['id']) || !str_ends_with((string) $attributes['id'], '-js')) {
		return $attributes;
		}

		$handle = substr((string) $attributes['id'], 0, -3);
		$script = wp_scripts()->registered[$handle] ?? null;

		if ($script && $this->isExternalResource($script->src)) {
		$attributes['crossorigin'] = 'anonymous';
		}

		return $attributes;
	}

	/**
	 * Callback for the 'wp_enqueue_scripts' action.
	 */
	public function setupDeregisterStyles(): void {
		foreach ( $this->deregisteredStyles as $handle ) {
			wp_deregister_style( $handle );
		}
	}

	/**
	 * Callback to enqueue block styles.
	 */
	public function setupEnqueueBlockStyles(): void {
		foreach ( $this->blockStyles as $handle => $blocks ) {
			foreach ( $blocks as $block ) {
				wp_enqueue_block_style( $block, array( 'handle' => $handle ) );
			}
		}
	}

	/**
	 * Append a version to the asset urls to bust caches.
	 *
	 * A version number based on the access time will be added to all scripts and
	 * styles which have not explicitly opted-out of this behavior by setting a
	 * string version number or passing false in the add*() methods.
	 *
	 * This only seems to be an issue with WP Engine and fast-moving deploys to
	 * their dev environment.
	 */
	public function appendVersion( bool $append ): void {
		$this->appendVersion = $append;
	}

	/**
	 * Generate a version number for scripts based on the current time.
	 *
	 * Version numbers are not generated by default. Set self::appendVersion to
	 * enable version numbers.
	 *
	 * @param string|bool|null
	 *   The version to append. @see wp_enqueue_style() for a description of what
	 *   each option does.
	 *
	 * @return ?string
	 *   The current time in Unix format.
	 */
	protected function generateVersion( $version ): ?string {
		if ( is_string( $version ) ) {
			return $version;
		}

		if ( $version === false || ! $this->appendVersion ) {
			return null;
		}

		if ( ! $this->currentTime ) {
			$this->currentTime = date( 'U' );
		}
		return $this->currentTime;
	}


	/**
	 * Callback for the 'wp_preload_resources' filter.
	 *
	 * Adds preload hints for scripts and styles that have been marked for preloading.
	 *
	 * @param array $preload_resources
	 *   Existing preload resources.
	 *
	 * @return array
	 *   Updated preload resources.
	 */
	public function setupPreloadResources(array $preload_resources): array {
		// Process scripts marked for preloading
		foreach ($this->preloadScripts as $handle => $preload_type) {
		if (wp_script_is($handle, 'enqueued')) {
			$asset = wp_scripts()->registered[$handle] ?? null;
			if ($asset) {
			$preload_resources[] = $this->buildPreloadArray($asset->src, $asset->ver, 'script', 'text/javascript');
			}
		}
		}

		// Process styles marked for preloading
		foreach ($this->preloadStyles as $handle => $preload_type) {
		if (wp_style_is($handle, 'enqueued')) {
			$asset = wp_styles()->registered[$handle] ?? null;
			if ($asset) {
			$media = $asset->args ?? 'all';
			$preload_resources[] = $this->buildPreloadArray($asset->src, $asset->ver, 'style', 'text/css', $media);
			}
		}
		}

		return $preload_resources;
	}

	/**
	 * Build a preload array for a resource.
	 *
	 * @param string $src
	 *   The resource source URL.
	 * @param string|null $version
	 *   The resource version.
	 * @param string $as
	 *   The resource type (script, style, etc.).
	 * @param string $type
	 *   The MIME type of the resource.
	 * @param string $media
	 *   The media query for the resource (for styles).
	 *
	 * @return array
	 *   The preload array.
	 */
	protected function buildPreloadArray(string $src, ?string $version, string $as, string $type, string $media = 'all'): array {
		$href = $src;
		if ($version !== null) {
			$href .= '?ver=' . $version;
		}
		$preload = [
		'href' => $href,
		'as' => $as,
		'type' => $type,
		];

		// Add media for styles
		if ($as === 'style') {
		$preload['media'] = $media;
		}

		if ($this->isExternalResource($src)) {
			$preload['crossorigin'] = 'anonymous';
		}

		return $preload;
	}
}
