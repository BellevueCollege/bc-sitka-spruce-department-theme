<?php
/**
 * Return the main-site core seed map without re-running seed-e2e-core-site.php.
 *
 * @package BcSitkaSpruce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/e2e-core-content-helpers.php';

$map = e2e_get_core_seed_map();
if ( ! is_array( $map ) || empty( $map['coreProgramId'] ) ) {
	echo wp_json_encode( array( 'error' => 'Core seed map not found.' ) );
	exit( 1 );
}

echo wp_json_encode( $map );
