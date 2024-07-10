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
function register_menus() {
	register_nav_menus(
		array(
			'main-menu' => __( 'Main Menu' ),
			'cta-menu' => __( 'Call-to-Action Menu' ),
			'footer-menu' => __( 'Footer Menu' )
		)
	);
}
add_action( 'init', __NAMESPACE__ . '\register_menus' );

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


