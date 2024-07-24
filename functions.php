<?php
namespace BcSitkaSpruce;

// Make Timber available.
use Timber;
use BcSitkaSpruce\Library\Theme;

// Load Composer dependencies.
require_once __DIR__ . '/vendor/autoload.php';

// Initialize Timber.
Timber\Timber::init();
/**
 * Register Menus
 */
$menus = Theme::menus();
$menus->addMenu( 'main-menu', __( 'Main Menu', 'bc-sitka-spruce' ) );

/**
 * Register Blocks
 *
 * Any blocks that are part of the theme should be registered here.
 */
function register_blocks() {
	$blocks = array(
		'bc-brand-bar',
		'differentiators',
		'differentiator-group',
		'differentiator',
		'section-heading',
		'content-and-location',
		'template-homepage',
		'hero-image',
	);

	block_registration_helper( $blocks );
}
add_action( 'init', __NAMESPACE__ . '\register_blocks' );

/**
 * Helper Function for Registering Blocks
 *
 * TODO: Move this to a helper function file
 */
function block_registration_helper( array $blocks ) {
	$block_path = get_template_directory() . '/assets/dist/blocks/';
	foreach ( $blocks as $block ) {
		$block = $block_path . $block;
		register_block_type( $block );
	}
}


$enqueuer = Theme::enqueuer();
$enqueuer->addStyle( handle: 'bc-sitka-spruce-main', src: '/assets/dist/css/main.asset.php', use_asset_file: true );
$enqueuer->addStyle( handle: 'bc-sitka-spruce-fonts', src: '//use.typekit.net/vln2gpg.css' );
// $enqueuer->addStyle('bc-sitka-spruce-icons', '/node_modules/@fortawesome/fontawesome-pro/css/all.css', [], get_template_directory_uri());
$enqueuer->addScript( handle: 'bc-sitka-spruce-main-js', src: '/assets/dist/js/main.asset.php', use_asset_file: true );
$enqueuer->addScript( 'bootstrap', '//cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js' );


/**
 * Image Crops
 */
/**
 * Add image sizes.
 */
$image_crops = Theme::imageCrops();

// Homepage Hero Images

// Division Sizing
$image_crops->addImageSize( 'featured-home-div-lg', 2880, 1000, true );
$image_crops->addImageSize( 'featured-home-div-md', 1440, 500, true );

// Department Sizing
$image_crops->addImageSize( 'featured-home-dept-lg', 2720, 1000, true );
$image_crops->addImageSize( 'featured-home-dept-md', 1360, 500, true );

// Support Unit Sizing - no larger size needed, as it is not dependent on the screen size
$image_crops->addImageSize( 'featured-home-suppt', 1160, 500, true );


/**
 * Pass Multisite Paths to Blocks
 *
 * Some blocks need to pull data from the root site of the network.
 *
 */
function pass_multisite_paths_to_blocks() {
	$blocks    = array(
		'differentiator',
	);
	$namespace = 'bc-sitka-spruce';
	foreach ( $blocks as $block ) {
		$script_handle = "{$namespace}-{$block}-editor-script";
		$data          = 'const bc_blog_url = "' . get_bloginfo( 'url' ) . '";';
		$data         .= 'const bc_network_url = "' . network_site_url() . '";';
		$position      = 'before';
		wp_add_inline_script( $script_handle, $data, $position );
	}
}
add_action( 'admin_enqueue_scripts', __NAMESPACE__ . '\pass_multisite_paths_to_blocks' );


/**
 * Load Block Editor Styles
 */
$block_editor = Theme::blockEditor();
$block_editor->addStylesheet( 'editor', 'assets/dist/css/editor.css' );
$block_editor->useGlobally( true );


/**
 * Register Styles for Use in Blocks
 *
 * Register additional stylesheets used by blocks
 */

add_action(
	'init',
	function () {
		$handle_prefix = 'bc-sitka-spruce-style-';

		// List of styles
		$styles = array(
			'card',
		);

		foreach ( $styles as $style ) {
			$asset  = include get_parent_theme_file_path( 'assets/dist/css/blocks/' . $style . '.asset.php' );
			$handle = $handle_prefix . $style;
			wp_register_style(
				$handle,
				get_theme_file_uri( "assets/dist/css/blocks/{$style}.css" ),
				$asset['dependencies'],
				$asset['version'],
			);
		}
	}
);

/**
 * Register Custom Styles for non-bundled blocks
 */
function enqueue_block_styles() {
	enqueue_block_style( 'bc-sitka-spruce-style-card', 'mayflower-blocks/panel', true );
	enqueue_block_style( 'mayflower-blocks/alert' );
}
add_action( 'init', __NAMESPACE__ . '\enqueue_block_styles' );

/**
 * Enqueue Block Style
 *
 * Helper function to enqueue a block style
 *
 * @param string $handle
 * @param string|null $block
 * @param boolean $registered
 */
function enqueue_block_style( string $handle, string|null $block = null, $registered = false ) {
	$block = $block ?? $handle;

	if ( $registered ) {
		wp_enqueue_block_style(
			$block,
			array(
				'handle' => $handle,
			)
		);
		return;
	}

	$slug  = str_replace( '/', '-', $handle );
	$asset = include get_parent_theme_file_path( 'assets/dist/css/blocks/' . $slug . '.asset.php' );
	wp_enqueue_block_style(
		$block,
		array(
			'handle' => "bc-sitka-spruce-block-{$slug}",
			'src'    => get_theme_file_uri( "assets/dist/css/blocks/{$slug}.css" ),
			'path'   => get_theme_file_path( "assets/dist/css/blocks/{$slug}.css" ),
			'deps'   => $asset['dependencies'],
			'ver'    => $asset['version'],
		)
	);
}

/**
 * Prevent Unlocking of Locked Blocks by non-Super Admins
 *
 * Thanks to https://fullsiteediting.com/how-to-lock-blocks-and-templates/
 */
add_filter(
	'block_editor_settings_all',
	static function ( $settings, $context ) {
		// Allow for the Editor role and above.
		$settings['canLockBlocks'] = current_user_can( 'manage_network' );

		// Only enable for specific user(s).
		// $user = wp_get_current_user();
		// if ( in_array( $user->user_email, array( 'user@example.com' ), true ) ) {
		//  $settings['canLockBlocks'] = false;
		// }

		// Disable for posts/pages.
		// if ( $context->post && $context->post->post_type === 'page' ) {
		//  $settings['canLockBlocks'] = false;
		// }

		return $settings;
	},
	10,
	2
);


/**
 * Custom API Endpoints
 *
 * Register custom API endpoints
 */

/**
 * Register /options endpoint
 */
add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			'bc-sitka-spruce/v1',
			'/options',
			array(
				'methods'  => 'GET',
				'callback' => __NAMESPACE__ . '\rest_get_options',
				'permission_callback' => function( ) {
					return current_user_can( 'edit_posts' );
				}
			)
		);
	}
);

/**
 * Get Options Callback
 *
 * Callback for /options endpoint
 *
 * @param WP_REST_Request $request
 * @return WP_REST_Response|WP_Error
 */

function rest_get_options( $request ) {
	if ( ! current_user_can( 'edit_posts' ) ) {
		return new \WP_Error( 'rest_forbidden', 'Sorry, you are not allowed to access this resource.', array( 'status' => rest_authorization_required_code() ) );
	}
	$options = array();
	$options['display_location_card'] = get_field( 'display_location_card', 'option' );
	$options['location_image']        = get_field( 'location_image', 'option' );
	$options['location']              = get_field( 'location', 'option' );
	$options['hours']                 = get_field( 'hours', 'option' );
	$options['contact_page_url']      = get_field( 'contact_page_url', 'option' );
	return new \WP_REST_Response( $options, 200 );
}

/**
 * Filter Body Class to add Site Type
 */
add_filter( 'body_class', function( $classes ) {
	$site_type = get_field( 'site_type', 'option' ) ?? 'dept';
	$classes[] = 'site-type-' . $site_type;
	return $classes;
} );


/**
 * Add Block Wrapper to Root Blocks with Alignment and Width Classes
 * 
 */
add_filter( 'render_block', function( $block_content, $block, $instance ) {

	// Blocks that should not be wrapped. Matches against the beginning of the block name,
	// so partial matches are allowed.
	$allowlisted_blocks = array(
		'bc-sitka-spruce/',
	);

	// Do not wrap non-root blocks, or blocks that are not named.
	if ( ! $block['sitka_is_at_root'] || ! isset( $block['blockName'] ) ) {
		return $block_content;
	}
	
	// Do not wrap blocks that are in the allowlist.
	foreach ( $allowlisted_blocks as $allowlisted_block ) {
		if ( str_starts_with( $block['blockName'], $allowlisted_block ) ) {
			return $block_content;
		}
	}

	// Add alignment and width classes.
	if ( ! isset( $block['attrs']['align'] ) ) {
		$classes = 'alignstandard';
	} elseif ( 'wide' === $block['attrs']['align'] ) {
		$classes = 'alignwide';
	} elseif ( 'full' === $block['attrs']['align'] ) {
		$classes = 'alignfull';
	} elseif ( 'right' === $block['attrs']['align'] ) {
		$classes = 'alignright alignstandard';
	} elseif ( 'center' === $block['attrs']['align'] ) {
		$classes = 'aligncenter';
	} else {
		$classes = 'alignstandard';
	}

	// Debugging helper: Print block data after each block
	// $block_content .= '<pre>' . print_r( $block, true ) . '</pre>';

	// Return wrapped block
    return "<div class=\"block-wrapper $classes\">$block_content</div>";

}, 10, 3 );

/**
 * Allow Root Blocks to be Identified
 * 
 * Add 'sitka_is_at_root' property to block data objects, which will be true or false
 * depending on if the block is at the root of the block editor (not inside another block).
 */
add_filter( 'render_block_data', function( $parsed_block, $source_block, $parent_block ) {
	$parsed_block['sitka_is_at_root'] = $parent_block ? false : true;
	return $parsed_block;
}, 10, 3 );