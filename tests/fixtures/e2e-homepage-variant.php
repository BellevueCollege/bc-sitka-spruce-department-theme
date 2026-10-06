<?php
/**
 * Point the static front page at an E2E homepage variant.
 *
 * @package BcSitkaSpruce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/e2e-seed-shared.php';

/**
 * @param string $variant dept|div|suppt.
 * @return array{siteType: string, pageUrl: string}
 */
function e2e_apply_homepage_variant( string $variant ): array {
	$titles = array(
		'dept'  => 'E2E Homepage Department',
		'div'   => 'E2E Homepage Division',
		'suppt' => 'E2E Homepage Support',
	);

	if ( ! isset( $titles[ $variant ] ) ) {
		echo wp_json_encode( array( 'error' => 'Unknown homepage variant.' ) );
		exit( 1 );
	}

	e2e_configure_front_page( $variant, $titles[ $variant ] );
	$page = e2e_get_post_by_title( $titles[ $variant ], 'page' );

	return array(
		'siteType' => $variant,
		'pageUrl'  => $page ? get_permalink( $page ) : '',
	);
}
