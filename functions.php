<?php
namespace bcSitkaSpruce;

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