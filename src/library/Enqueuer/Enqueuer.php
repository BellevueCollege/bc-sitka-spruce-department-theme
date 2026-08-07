<?php

namespace BcSitkaSpruce\Library\Enqueuer;

/**
 * An API for loading theme scripts and stylesheets.
 *
 * Supports resource preloading via the optional $preload parameter in addScript()
 * and addStyle(). Pass 'preload' as the last argument:
 *
 * @code
 * $enqueuer->addStyle('theme-style', '/assets/css/main.css', [], '', '1.0.0', 'all', 'preload');
 * $enqueuer->addScript('app-js', '/assets/js/app.js', [], '', '1.0.0', true, 'preload');
 * @endcode
 *
 * Preloaded resources receive:
 * - Versioned URLs from registered assets
 * - crossorigin='anonymous' for external (protocol-relative) resources
 * - Appropriate 'as' and 'type' attributes
 * - HTML <link rel="preload"> tags via wp_preload_resources
 * - HTTP Link headers via wp_headers for Cloudflare Early Hints
 *
 * External scripts and styles also receive crossorigin='anonymous' on their
 * output tags so preload hints and the final resource request use the same
 * credentials mode.
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
		add_filter('wp_headers', [$this, 'addEarlyHintsLinkHeaders'], 10, 1);
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
			$media        = $style['media'] ?? 'all';
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
	 * Merges theme preload resources into WordPress HTML resource hints.
	 *
	 * @param array $preload_resources
	 *   Existing preload resources.
	 *
	 * @return array
	 *   Updated preload resources.
	 */
	public function setupPreloadResources(array $preload_resources): array {
		foreach ($this->getResourceHints() as $hint) {
			$preload_resources[] = $hint['resource'];
		}

		return $preload_resources;
	}

	/**
	 * Callback for the 'wp_headers' filter.
	 *
	 * Emits a Link header so Cloudflare can cache preload hints and serve them
	 * as 103 Early Hints. Footer scripts are omitted: they are not
	 * render-blocking, so a preemptive hint does not help page load.
	 *
	 * @param array<string, string> $headers
	 *   Headers WordPress is about to send.
	 *
	 * @return array<string, string>
	 *   Headers with an appended Link value when applicable.
	 */
	public function addEarlyHintsLinkHeaders(array $headers): array {
		if (
			is_admin()
			|| wp_doing_ajax()
			|| wp_doing_cron()
			|| is_feed()
			|| (defined('REST_REQUEST') && REST_REQUEST)
		) {
			return $headers;
		}

		$link_values = [];
		foreach ($this->getResourceHints() as $hint) {
			// Styles have no footer flag; only script handles are stored on hints.
			if (
				isset($hint['handle'])
				&& ($this->scripts[$hint['handle']]['footer'] ?? true)
			) {
				continue;
			}

			$link_values[] = $this->formatResourceHintAsLinkHeader($hint['resource']);
		}

		if (!$link_values) {
			return $headers;
		}

		$link_header = implode(', ', $link_values);
		if (!empty($headers['Link'])) {
			$headers['Link'] .= ', ' . $link_header;
		} else {
			$headers['Link'] = $link_header;
		}

		return $headers;
	}

	/**
	 * Build the theme preload hints for the current request.
	 *
	 * Uses the enqueuer registration and removal lists rather than WordPress
	 * enqueue state, because wp_headers runs before wp_enqueue_scripts. Script
	 * hints include a handle so callers can inspect footer placement.
	 *
	 * @return array<int, array{resource: array<string, string>, handle?: string}>
	 *   Preload hint entries with attributes and optional script handle.
	 */
	protected function getResourceHints(): array {
		$hints = [];

		foreach ($this->preloadScripts as $handle => $rel) {
			$script = $this->scripts[$handle] ?? null;
			if (!$script || !$this->isHintEnabled($rel, $handle, $this->deregisteredScripts)) {
				continue;
			}

			$hints[] = [
				'handle' => $handle,
				'resource' => $this->buildPreloadArray(
					$script['src'],
					$this->generateVersion($script['version']),
					'script',
					'text/javascript'
				),
			];
		}

		foreach ($this->preloadStyles as $handle => $rel) {
			$style = $this->styles[$handle] ?? null;
			if (!$style || !$style['enqueue'] || !$this->isHintEnabled($rel, $handle, $this->deregisteredStyles)) {
				continue;
			}

			$hints[] = [
				'resource' => $this->buildPreloadArray(
					$style['src'],
					$this->generateVersion($style['version']),
					'style',
					'text/css',
					$style['media'] ?? 'all'
				),
			];
		}

		return $hints;
	}

	/**
	 * Whether a handle should emit a preload hint on this request.
	 *
	 * @param string $rel
	 *   Requested hint type from addScript()/addStyle().
	 * @param string $handle
	 *   Asset handle.
	 * @param string[] $deregistered_handles
	 *   Handles removed from this request.
	 *
	 * @return bool
	 *   True when the asset is marked for preload and is still active.
	 */
	protected function isHintEnabled(string $rel, string $handle, array $deregistered_handles): bool {
		return $rel === 'preload'
			&& !in_array($handle, $deregistered_handles, true);
	}

	/**
	 * Build attribute array for a preload resource hint.
	 *
	 * @param string $src
	 *   Resource URL.
	 * @param string|null $version
	 *   Optional version query value.
	 * @param string $as
	 *   Resource destination (script, style, etc.).
	 * @param string $type
	 *   MIME type.
	 * @param string $media
	 *   Media query for stylesheets.
	 *
	 * @return array<string, string>
	 *   Attributes suitable for wp_preload_resources or Link headers.
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

		if ($as === 'style') {
			$preload['media'] = $media;
		}

		if ($this->isExternalResource($src)) {
			$preload['crossorigin'] = 'anonymous';
		}

		return $preload;
	}

	/**
	 * Convert a preload resource into an RFC 8288 Link header value.
	 *
	 * @param array<string, string> $resource
	 *   Preload attributes from buildPreloadArray().
	 *
	 * @return string
	 *   Example: <https://example.com/style.css>; rel=preload; as=style.
	 */
	protected function formatResourceHintAsLinkHeader(array $resource): string {
		$href = set_url_scheme($resource['href']);
		$parts = [
			'<' . esc_url_raw($href) . '>',
			'rel=preload',
		];

		foreach (['as', 'type', 'media', 'crossorigin'] as $attribute) {
			if (empty($resource[$attribute])) {
				continue;
			}
			if ($attribute === 'media' && $resource[$attribute] === 'all') {
				continue;
			}
			$parts[] = $attribute . '=' . $this->quoteLinkParameter($resource[$attribute]);
		}

		return implode('; ', $parts);
	}

	/**
	 * Quote a Link parameter value unless it is already a bare token.
	 *
	 * Media queries and MIME types contain characters outside the RFC 7230
	 * token set. Left unquoted they produce invalid headers, and an unquoted
	 * comma would split the value into a separate malformed link entry.
	 *
	 * @param string $value
	 *   The parameter value to output.
	 *
	 * @return string
	 *   The value as a token, or as a quoted string.
	 */
	protected function quoteLinkParameter(string $value): string {
		if (preg_match('/^[A-Za-z0-9!#$%&\'*+.^_`|~-]+$/', $value)) {
			return $value;
		}

		return '"' . str_replace(['\\', '"'], ['\\\\', '\\"'], $value) . '"';
	}
}
