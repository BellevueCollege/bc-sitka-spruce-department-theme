<?php
/**
 * Limit subsite programs to Alpha and Beta for single-related-program slider tests.
 *
 * @package BcSitkaSpruce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/e2e-seed-shared.php';
require_once __DIR__ . '/e2e-core-content-helpers.php';
require_once __DIR__ . '/e2e-program-seed-helpers.php';

foreach ( e2e_extra_program_seed_specs() as $extra_program_spec ) {
	e2e_delete_post_by_title( $extra_program_spec['title'], 'program' );
}

$program_beta = get_page_by_title( 'E2E Program Beta', OBJECT, 'program' );
$program_beta_id = $program_beta instanceof WP_Post ? (int) $program_beta->ID : 0;

echo wp_json_encode(
	array(
		'programBetaUrl' => $program_beta_id > 0 ? (string) get_permalink( $program_beta_id ) : '',
	)
);
