<?php
/**
 * Shared program fixtures for main-site core seed and subsite integration seed.
 *
 * @package BcSitkaSpruce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Extra programs beyond Alpha and Beta (titles must match on main and subsite).
 *
 * @return array<int, array{title: string, short_name: string, overview: string, duration: string}>
 */
function e2e_extra_program_seed_specs(): array {
	return array(
		array(
			'title'       => 'E2E Program Gamma',
			'short_name'  => 'E2E Gamma',
			'overview'    => 'E2E tertiary core program overview.',
			'duration'    => '18 months',
		),
		array(
			'title'       => 'E2E Program Delta',
			'short_name'  => 'E2E Delta',
			'overview'    => 'E2E quaternary core program overview.',
			'duration'    => '6 quarters',
		),
		array(
			'title'       => 'E2E Program Epsilon',
			'short_name'  => 'E2E Epsilon',
			'overview'    => 'E2E fifth core program overview.',
			'duration'    => '3 quarters',
		),
	);
}

/**
 * Seed one main-site program CPT with taxonomy and ACF fields used by related programs UI.
 *
 * @param array{title: string, short_name: string, overview: string, duration: string} $spec Program seed row.
 * @param int                                                                           $program_type_id Program type term ID.
 * @param int                                                                           $degree_term_id Degree term ID.
 * @param \WP_Term|null                                                                 $program_type_term Program type term object.
 * @param \WP_Term|null                                                                 $degree_term Degree term object.
 * @return int Post ID.
 */
function e2e_seed_main_site_program(
	array $spec,
	int $program_type_id,
	int $degree_term_id,
	?WP_Term $program_type_term,
	?WP_Term $degree_term
): int {
	$program_id = e2e_upsert_post(
		$spec['title'],
		'program',
		array(
			'post_content' => '',
		)
	);

	wp_set_object_terms( $program_id, array( $program_type_id ), 'program_type' );
	wp_set_object_terms( $program_id, array( $degree_term_id ), 'degree' );

	if ( function_exists( 'update_field' ) ) {
		update_field( 'short_name', $spec['short_name'], $program_id );
		update_field( 'overview', $spec['overview'], $program_id );
		if ( $program_type_term ) {
			update_field( 'type', $program_type_term, $program_id );
		}
		if ( $degree_term ) {
			update_field( 'degree', $degree_term, $program_id );
		}
		update_field( 'duration', $spec['duration'], $program_id );
	}

	return (int) $program_id;
}

/**
 * Seed one subsite program post that mirrors a main-site program title.
 *
 * @param array{title: string, short_name: string, overview: string, duration: string} $spec Program seed row.
 * @param string                                                                       $post_content Block content for the program template.
 * @return int Post ID.
 */
function e2e_seed_subsite_program( array $spec, string $post_content ): int {
	return (int) e2e_upsert_post(
		$spec['title'],
		'program',
		array(
			'post_content' => $post_content,
		)
	);
}
