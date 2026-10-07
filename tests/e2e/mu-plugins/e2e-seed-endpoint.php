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

// Front-end snapshots should match a visitor view; wp-admin still shows the toolbar for editor tests.
add_filter( 'show_admin_bar', '__return_false' );

/**
 * Editor-only a11y border overlays skew @visual baselines when Playwright uses admin cookies.
 */
function bc_sitka_e2e_dequeue_a11y_warnings_on_frontend(): void {
	if ( is_admin() ) {
		return;
	}

	wp_dequeue_script( 'bc-sitka-spruce-a11y-warnings' );
}

add_action( 'wp_enqueue_scripts', 'bc_sitka_e2e_dequeue_a11y_warnings_on_frontend', 100 );

/**
 * Request origin host:port (no path) for loopback vs LambdaTest tunnel.
 */
function bc_sitka_e2e_request_origin(): string {
	$port = BC_SITKA_E2E_WP_PORT;

	// LambdaTest proxy keeps HTTP_HOST on loopback for multisite routing but exposes the browser origin here.
	if ( isset( $_SERVER['HTTP_X_E2E_PUBLIC_ORIGIN'] ) ) {
		$public_origin = trim( (string) $_SERVER['HTTP_X_E2E_PUBLIC_ORIGIN'] );
		if ( $public_origin !== '' ) {
			return $public_origin;
		}
	}

	$host_header = isset( $_SERVER['HTTP_HOST'] ) ? (string) $_SERVER['HTTP_HOST'] : '';
	$host_only   = preg_replace( '/:\d+$/', '', $host_header );

	if ( $host_only === 'host.docker.internal' || $host_only === 'host.containers.internal' ) {
		return $host_only . ':' . $port;
	}

	return '127.0.0.1:' . $port;
}

/**
 * Rewrite loopback host/port in a URL while preserving path and query.
 *
 * @param string $url Generated URL.
 * @return string
 */
function bc_sitka_e2e_rewrite_tunnel_url( $url ) {
	if ( ! is_string( $url ) || $url === '' ) {
		return $url;
	}

	$target_origin = bc_sitka_e2e_request_origin();
	$port          = (string) BC_SITKA_E2E_WP_PORT;
	$loopback      = '127.0.0.1:' . $port;
	$localhost     = 'localhost:' . $port;

	if ( $target_origin === $loopback ) {
		return str_replace(
			array( 'http://' . $localhost, 'https://' . $localhost ),
			array( 'http://' . $loopback, 'https://' . $loopback ),
			$url
		);
	}

	$replacements = array(
		'http://' . $loopback  => 'http://' . $target_origin,
		'https://' . $loopback => 'https://' . $target_origin,
		'http://' . $localhost => 'http://' . $target_origin,
		'https://' . $localhost => 'https://' . $target_origin,
	);

	return str_replace( array_keys( $replacements ), array_values( $replacements ), $url );
}

add_filter( 'site_url', 'bc_sitka_e2e_rewrite_tunnel_url', 1 );
add_filter( 'home_url', 'bc_sitka_e2e_rewrite_tunnel_url', 1 );
add_filter( 'network_site_url', 'bc_sitka_e2e_rewrite_tunnel_url', 1 );
add_filter( 'option_siteurl', 'bc_sitka_e2e_rewrite_tunnel_url', 1 );
add_filter( 'option_home', 'bc_sitka_e2e_rewrite_tunnel_url', 1 );
add_filter( 'wp_redirect', 'bc_sitka_e2e_rewrite_tunnel_url', 1 );
add_filter( 'login_url', 'bc_sitka_e2e_rewrite_tunnel_url', 1 );
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
 * News, identity-support, and organization image fields return an attachment ID.
 * Theme controllers read ['id'] on those post types. Reshape only those fields here
 * so e2e matches that contract without changing theme PHP.
 *
 * @param mixed $value   Formatted ACF value.
 * @param mixed $post_id Post the field belongs to.
 * @return mixed
 */
function bc_sitka_e2e_core_image_field_as_array( $value, $post_id ) {
	if ( ! is_numeric( $value ) ) {
		return $value;
	}

	$post_type = get_post_type( $post_id );
	$core_post_types = array( 'news', 'identity-support', 'organization' );

	if ( ! in_array( $post_type, $core_post_types, true ) ) {
		return $value;
	}

	$attachment_id = (int) $value;

	return array(
		'ID' => $attachment_id,
		'id' => $attachment_id,
	);
}

add_filter( 'acf/format_value/name=image', 'bc_sitka_e2e_core_image_field_as_array', 20, 2 );

/**
 * Skip host canonicalization when the LambdaTest proxy keeps HTTP_HOST on loopback.
 *
 * Without this, WordPress 301s to host.docker.internal while the upstream request
 * still uses 127.0.0.1, which loops in the browser and surfaces as HTTP 503.
 *
 * @param string|false $redirect_url Canonical redirect target.
 * @return string|false
 */
function bc_sitka_e2e_skip_canonical_redirect_for_tunnel( $redirect_url ) {
	if (
		isset( $_SERVER['HTTP_X_E2E_PUBLIC_ORIGIN'] ) &&
		trim( (string) $_SERVER['HTTP_X_E2E_PUBLIC_ORIGIN'] ) !== ''
	) {
		return false;
	}

	return $redirect_url;
}

add_filter( 'redirect_canonical', 'bc_sitka_e2e_skip_canonical_redirect_for_tunnel', 1 );

/**
 * Block editor e2e does not rely on classic meta boxes; the loader fetch races navigation on LambdaTest.
 */
add_action(
	'admin_init',
	static function () {
		remove_action( 'admin_enqueue_scripts', 'wp_enqueue_meta_box_loader' );
	},
	1
);

/**
 * Theme blocks kept registered in e2e (matches tests/e2e specs).
 */
const BC_SITKA_E2E_ALLOWED_THEME_BLOCKS = array(
	'bc-sitka-spruce/accordion-section',
	'bc-sitka-spruce/accordion-section-content',
	'bc-sitka-spruce/announcement-banner',
	'bc-sitka-spruce/application-step-single',
	'bc-sitka-spruce/application-step-single-content',
	'bc-sitka-spruce/application-steps-tabs',
	'bc-sitka-spruce/bio-section',
	'bc-sitka-spruce/bio-section-content',
	'bc-sitka-spruce/body-section',
	'bc-sitka-spruce/body-section-content',
	'bc-sitka-spruce/callout',
	'bc-sitka-spruce/card-section',
	'bc-sitka-spruce/card-section-card',
	'bc-sitka-spruce/checkerboard-section',
	'bc-sitka-spruce/contact-selector',
	'bc-sitka-spruce/content-and-location',
	'bc-sitka-spruce/course-information-section',
	'bc-sitka-spruce/course-information-section-content',
	'bc-sitka-spruce/degrees-certificates-section',
	'bc-sitka-spruce/department-feature',
	'bc-sitka-spruce/differentiator',
	'bc-sitka-spruce/differentiator-section',
	'bc-sitka-spruce/hero-image',
	'bc-sitka-spruce/listing-section',
	'bc-sitka-spruce/listing-section-list-item',
	'bc-sitka-spruce/listing-section-list-item-links',
	'bc-sitka-spruce/media-gallery-section',
	'bc-sitka-spruce/narrow-content',
	'bc-sitka-spruce/news-feature-core',
	'bc-sitka-spruce/posts-feature',
	'bc-sitka-spruce/profiles-section',
	'bc-sitka-spruce/support-feature',
	'bc-sitka-spruce/tabcordion',
	'bc-sitka-spruce/tabcordion-content',
	'bc-sitka-spruce/tabcordion-content-panel',
	'bc-sitka-spruce/tabcordion-list',
	'bc-sitka-spruce/tabcordion-list-tab',
	'bc-sitka-spruce/tabs-section',
	'bc-sitka-spruce/template-homepage',
	'bc-sitka-spruce/template-program-info',
	'bc-sitka-spruce/testimonial-section',
);

add_shortcode(
	'e2e_marker',
	static function (): string {
		return '<span class="e2e-shortcode-marker">E2E shortcode output</span>';
	}
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
