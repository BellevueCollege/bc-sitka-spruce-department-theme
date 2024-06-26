<?php
namespace bcSitkaSpruce;

// Make Timber available.
use Timber;

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
	register_block_type( __DIR__ . '/assets/dist/blocks/bc-brand-bar' );
}
add_action( 'init', __NAMESPACE__ . '\register_blocks' );

/**
 * Enqueue Assets
 * 
 * Enqueue CSS and JS assets.
 */
function enqueue_assets() {
	$asset = include get_parent_theme_file_path( 'assets/dist/css/main.asset.php' );

	wp_enqueue_style(
		'bc-sitka-spruce-style',
		get_parent_theme_file_uri( 'assets/dist/css/main.css' ),
		$asset['dependencies'],
		$asset['version']
	);
}
add_action( 'wp_enqueue_scripts', __NAMESPACE__ . '\enqueue_assets' );