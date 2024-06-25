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
