<?php
/**
 * Smoke checks for e2e multisite stack (main Bellevue + subsite Sitka).
 *
 * @package BcSitkaSpruce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/e2e-core-content-helpers.php';

$failures = array();

/**
 * @param string $message
 */
function e2e_verify_fail( string $message ): void {
	global $failures;
	$failures[] = $message;
}

$main_stylesheet = get_option( 'stylesheet' );
if ( $main_stylesheet !== 'bellevue-2022' ) {
	e2e_verify_fail(
		sprintf( 'Main site theme should be bellevue-2022; got %s', (string) $main_stylesheet )
	);
}

if ( ! post_type_exists( 'pathway' ) ) {
	e2e_verify_fail( 'Main site missing pathway post type (bellevue-2022-pathway plugin).' );
}

if ( ! function_exists( 'acf_get_field' ) || ! acf_get_field( 'pathways' ) ) {
	e2e_verify_fail( 'ACF pathways field not registered on main site.' );
}

$core_map = e2e_get_core_seed_map();
$core_id  = isset( $core_map['coreProgramId'] ) ? (int) $core_map['coreProgramId'] : 0;
if ( $core_id <= 0 ) {
	e2e_verify_fail( 'Core seed map missing coreProgramId; run seed-e2e-core-site.php.' );
}

if ( function_exists( 'get_field' ) && $core_id > 0 ) {
	$pathways = get_field( 'pathways', $core_id );
	$first    = is_array( $pathways ) && isset( $pathways[0] ) ? $pathways[0] : null;
	if ( ! ( $first instanceof WP_Post ) ) {
		e2e_verify_fail( 'Core program pathways should resolve to WP_Post objects (check e2e mu-plugin normalize).' );
	}
}

if ( is_multisite() ) {
	$subsite_blog_id = 0;
	foreach ( get_sites( array( 'number' => 50 ) ) as $site ) {
		if ( trim( (string) $site->path, '/' ) === 'e2e-dept' ) {
			$subsite_blog_id = (int) $site->blog_id;
			break;
		}
	}

	if ( $subsite_blog_id <= 0 ) {
		e2e_verify_fail( 'Department subsite /e2e-dept/ not found.' );
	} else {
		switch_to_blog( $subsite_blog_id );
		$subsite_theme = get_option( 'stylesheet' );
		if ( $subsite_theme !== 'bc-sitka-spruce-department-theme' ) {
			e2e_verify_fail(
				sprintf(
					'Subsite theme should be bc-sitka-spruce-department-theme; got %s',
					(string) $subsite_theme
				)
			);
		}

		$program = get_page_by_path( 'e2e-program-alpha', OBJECT, 'program' );
		if ( ! ( $program instanceof WP_Post ) ) {
			e2e_verify_fail( 'Subsite program e2e-program-alpha missing; run seed-e2e-integration.php.' );
		}
		restore_current_blog();
	}
}

$payload = array(
	'ok'       => $failures === array(),
	'failures' => $failures,
	'blogId'   => (int) get_current_blog_id(),
);

echo wp_json_encode( $payload );

if ( $failures !== array() ) {
	exit( 1 );
}
