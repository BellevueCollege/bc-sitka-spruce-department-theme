<?php
/**
 * Return cached integration seed URLs without re-running seed-e2e-integration.php.
 *
 * @package BcSitkaSpruce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$payload = get_option( 'bc_sitka_e2e_integration_seed', array() );
if ( ! is_array( $payload ) || empty( $payload['programUrl'] ) ) {
	echo wp_json_encode( array( 'error' => 'Integration seed cache not found.' ) );
	exit( 1 );
}

echo wp_json_encode( $payload );
