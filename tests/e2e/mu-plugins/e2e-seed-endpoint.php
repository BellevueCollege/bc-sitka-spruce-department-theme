<?php
/**
 * E2e mu-plugin: LambdaTest URL rewriting and theme block allowlist.
 *
 * @package BcSitkaSpruce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Must match tests/e2e/helpers/e2e-env.js E2E_WP_PORT. */
const BC_SITKA_E2E_WP_PORT = 8889;

/**
 * WordPress URL for the current request (host vs LambdaTest tunnel).
 */
function bc_sitka_e2e_request_base_url(): string {
	$port        = BC_SITKA_E2E_WP_PORT;
	$host_header = isset( $_SERVER['HTTP_HOST'] ) ? (string) $_SERVER['HTTP_HOST'] : '';
	$host_only   = preg_replace( '/:\d+$/', '', $host_header );

	if ( $host_only === 'host.docker.internal' || $host_only === 'host.containers.internal' ) {
		return 'http://' . $host_only . ':' . $port;
	}

	// Match Playwright WP_BASE_URL (127.0.0.1) even when wp-env defaults to localhost.
	return 'http://127.0.0.1:' . $port;
}

add_filter(
	'pre_option_siteurl',
	static function () {
		return bc_sitka_e2e_request_base_url();
	},
	1
);

add_filter(
	'pre_option_home',
	static function () {
		return bc_sitka_e2e_request_base_url();
	},
	1
);

/**
 * @param mixed $value Option value.
 * @return string
 */
function bc_sitka_e2e_filter_site_base_url( $value ) {
	return bc_sitka_e2e_request_base_url();
}

add_filter( 'option_siteurl', 'bc_sitka_e2e_filter_site_base_url', 1 );
add_filter( 'option_home', 'bc_sitka_e2e_filter_site_base_url', 1 );

/**
 * Rewrite loopback URLs so script/style loads match the page origin (LambdaTest CORS).
 *
 * @param string $url Generated URL.
 * @return string
 */
function bc_sitka_e2e_rewrite_tunnel_url( $url ) {
	if ( ! is_string( $url ) ) {
		return $url;
	}

	$request_base = bc_sitka_e2e_request_base_url();
	$port         = (string) BC_SITKA_E2E_WP_PORT;
	$loopback     = 'http://127.0.0.1:' . $port;
	$localhost    = 'http://localhost:' . $port;

	if ( $request_base === $loopback ) {
		$url = str_replace( $localhost, $loopback, $url );
		return $url;
	}

	$url = str_replace( $loopback, $request_base, $url );
	$url = str_replace( $localhost, $request_base, $url );

	return $url;
}

add_filter( 'site_url', 'bc_sitka_e2e_rewrite_tunnel_url', 1 );
add_filter( 'home_url', 'bc_sitka_e2e_rewrite_tunnel_url', 1 );
add_filter( 'plugins_url', 'bc_sitka_e2e_rewrite_tunnel_url', 1 );
add_filter( 'content_url', 'bc_sitka_e2e_rewrite_tunnel_url', 1 );
add_filter( 'includes_url', 'bc_sitka_e2e_rewrite_tunnel_url', 1 );
add_filter( 'admin_url', 'bc_sitka_e2e_rewrite_tunnel_url', 1 );
add_filter( 'script_loader_src', 'bc_sitka_e2e_rewrite_tunnel_url', 1 );
add_filter( 'style_loader_src', 'bc_sitka_e2e_rewrite_tunnel_url', 1 );
add_filter( 'wp_get_attachment_url', 'bc_sitka_e2e_rewrite_tunnel_url', 1 );

/**
 * @param array<int, array<string, mixed>> $sources
 * @return array<int, array<string, mixed>>
 */
function bc_sitka_e2e_rewrite_image_srcset( $sources ) {
	if ( ! is_array( $sources ) ) {
		return $sources;
	}

	foreach ( $sources as $width => $source ) {
		if ( isset( $source['url'] ) && is_string( $source['url'] ) ) {
			$sources[ $width ]['url'] = bc_sitka_e2e_rewrite_tunnel_url( $source['url'] );
		}
	}

	return $sources;
}

add_filter( 'wp_calculate_image_srcset', 'bc_sitka_e2e_rewrite_image_srcset', 1 );

/**
 * Theme blocks kept registered in e2e (matches tests/e2e specs).
 */
const BC_SITKA_E2E_ALLOWED_THEME_BLOCKS = array(
	'bc-sitka-spruce/announcement-banner',
	'bc-sitka-spruce/posts-feature',
);

add_action(
	'init',
	function () {
		$registry = WP_Block_Type_Registry::get_instance();

		foreach ( array_keys( $registry->get_all_registered() ) as $block_name ) {
			if (
				str_starts_with( $block_name, 'bc-sitka-spruce/' ) &&
				! in_array( $block_name, BC_SITKA_E2E_ALLOWED_THEME_BLOCKS, true )
			) {
				unregister_block_type( $block_name );
			}
		}
	},
	1000
);
