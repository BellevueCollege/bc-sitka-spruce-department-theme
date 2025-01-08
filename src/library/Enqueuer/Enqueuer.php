<?php

namespace BcSitkaSpruce\Library\Enqueuer;

/**
 * An API for loading theme scripts and stylesheets.
 */
class Enqueuer implements EnqueuerInterface {

	protected array $scripts = array();

	protected array $deregisteredScripts = array();

	protected array $styles = array();

	protected array $blockStyles = array();

	protected array $deregisteredStyles = array();

	protected bool $appendVersion = false;

	protected string $currentTime = '';

	public function __construct() {
		add_action( 'wp_enqueue_scripts', array( $this, 'setupEnqueueScripts' ), 10, 0 );
		add_action( 'wp_enqueue_scripts', array( $this, 'setupDeregisterScripts' ), 99, 0 );
		add_action( 'enqueue_block_assets', array( $this, 'setupRegisterStyles' ), 10, 0 ); // Register styles on front end and in block editor
		add_action( 'wp_enqueue_scripts', array( $this, 'setupEnqueueStyles' ), 10, 0 ); // Enqueue registered styles on front end only
		add_action( 'wp_enqueue_scripts', array( $this, 'setupDeregisterStyles' ), 99, 0 );
		add_action( 'init', array( $this, 'setupEnqueueBlockStyles' ), 10, 0 );
	}

	/**
	 * @inheritDoc
	 */
	public function addScript(
		string $handle,
		string $src,
		array $dependencies = array(),
		$base_path = '',
		$version = null,
		bool $footer = true,
		bool $use_asset_file = false
	): void {

		if ( $use_asset_file ) {
			$asset        = include get_parent_theme_file_path( ltrim( $src, '/' ) );
			$src          = str_replace( '.asset.php', '.js', $src );
			$version      = $asset['version'];
			$dependencies = array_merge( $dependencies, $asset['dependencies'] );
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
		array $dependencies = array(),
		$base_path = '',
		$version = null,
		string $media = 'all',
		bool $use_asset_file = false,
		bool $enqueue = true
	): void {
		if ( $use_asset_file ) {
			$asset        = include get_parent_theme_file_path( ltrim( $src, '/' ) );
			$src          = str_replace( '.asset.php', '.css', $src );
			$version      = $asset['version'];
			$dependencies = array_merge( $dependencies, $asset['dependencies'] );
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
		return strpos( $src, '//' ) === 0 ? $src : $path . $src;
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
}
