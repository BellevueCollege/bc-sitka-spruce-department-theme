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
$menus->addMenu('main-menu', __('Main Menu', 'bc-sitka-spruce'));

/**
 * Register Blocks
 * 
 * Any blocks that are part of the theme should be registered here.
 */
function register_blocks() {
	$blocks = [
		'bc-brand-bar',
		'differentiators',
		'differentiator-group',
		'differentiator',
		'section-heading',
		'content-and-location',
		'template-homepage',
	];

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
$enqueuer->addStyle(handle: 'bc-sitka-spruce-fonts', src: '//use.typekit.net/vln2gpg.css');
// $enqueuer->addStyle('bc-sitka-spruce-icons', '/node_modules/@fortawesome/fontawesome-pro/css/all.css', [], get_template_directory_uri());
$enqueuer->addScript( handle: 'bc-sitka-spruce-main-js', src: '/assets/dist/js/main.asset.php', use_asset_file: true );
$enqueuer->addScript('bootstrap', '//cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js');


/**
 * Pass Multisite Paths to Blocks
 * 
 * Some blocks need to pull data from the root site of the network.
 * 
 */
function pass_multisite_paths_to_blocks() {
	$blocks = [
		'differentiator',
	];
	$namespace = 'bc-sitka-spruce';
	foreach ( $blocks as $block ) {
		$script_handle = "{$namespace}-{$block}-editor-script";
		$data = 'const bc_blog_url = "' . get_bloginfo( 'url' ) . '";';
		$data .= 'const bc_network_url = "' . network_site_url() . '";';
		$position = 'before';
		wp_add_inline_script( $script_handle, $data, $position );
	}
}
add_action( 'admin_enqueue_scripts', __NAMESPACE__ . '\pass_multisite_paths_to_blocks' );


/**
 * Load Block Editor Styles
 */
$block_editor = Theme::blockEditor();
$block_editor->addStylesheet('editor', 'assets/dist/css/editor.css');
$block_editor->useGlobally(true);


/**
 * Register Custom Styles for non-bundled blocks
 */

function enqueue_block_styles() {
    // Add the block name (with namespace) for each style.
    $blocks = array(
		'mayflower-blocks/alert',
		'mayflower-blocks/panel',
    );

    // Loop through each block and enqueue its styles.
    foreach ( $blocks as $block ) {

        // Replace slash with hyphen for filename.
        $slug = str_replace( '/', '-', $block );
		$asset = include get_parent_theme_file_path( 'assets/dist/css/blocks/' . $slug . '.asset.php' );

        wp_enqueue_block_style( $block, array(
            'handle' => "bc-sitka-spruce-block-{$slug}",
            'src'    => get_theme_file_uri( "assets/dist/css/blocks/{$slug}.css" ),
            'path'   => get_theme_file_path( "assets/dist/css/blocks/{$slug}.css" ),
			'deps'   => $asset['dependencies'],
			'ver'    => $asset['version'],
        ) );
    }
}
add_action( 'init', __NAMESPACE__ . '\enqueue_block_styles' );
/**
 * Prevent Unlocking of Locked Blocks by non-Super Admins
 * 
 * Thanks to https://fullsiteediting.com/how-to-lock-blocks-and-templates/
 */
add_filter( 'block_editor_settings_all',  static function ( $settings, $context ) {
	// Allow for the Editor role and above.
	$settings['canLockBlocks'] = current_user_can( 'manage_network' );

	// Only enable for specific user(s).
	// $user = wp_get_current_user();
	// if ( in_array( $user->user_email, array( 'user@example.com' ), true ) ) {
	// 	$settings['canLockBlocks'] = false;
	// }

	// Disable for posts/pages.
	// if ( $context->post && $context->post->post_type === 'page' ) {
	// 	$settings['canLockBlocks'] = false;
	// }

	return $settings;
}, 10, 2 );
