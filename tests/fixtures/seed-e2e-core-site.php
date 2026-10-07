<?php
/**
 * Seed main-site CPT content for multisite core-site block integration tests.
 *
 * @package BcSitkaSpruce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/e2e-seed-shared.php';
require_once __DIR__ . '/e2e-core-content-helpers.php';

/**
 * Ensure a taxonomy term exists and return its term ID.
 *
 * @param string $taxonomy Taxonomy slug.
 * @param string $name     Term name.
 * @return int
 */
function e2e_ensure_term( string $taxonomy, string $name ): int {
	$existing = term_exists( $name, $taxonomy );
	if ( is_array( $existing ) && isset( $existing['term_id'] ) ) {
		return (int) $existing['term_id'];
	}

	$result = wp_insert_term( $name, $taxonomy );
	if ( is_wp_error( $result ) ) {
		echo wp_json_encode( array( 'error' => $result->get_error_message() ) );
		exit( 1 );
	}

	return (int) $result['term_id'];
}

$hero_attachment_id = e2e_import_hero_attachment();

$organization_id = e2e_upsert_post(
	'E2E Core Organization',
	'organization',
	array(
		'post_content' => '',
	)
);

if ( function_exists( 'update_field' ) ) {
	update_field( 'summary', 'E2E organization summary for department feature.', $organization_id );
	update_field( 'url', 'https://example.com/e2e-organization', $organization_id );
	if ( $hero_attachment_id ) {
		update_field(
			'image',
			array(
				'ID' => $hero_attachment_id,
			),
			$organization_id
		);
	}
	update_field(
		'services_resources',
		array(
			array(
				'service_resource' => 'E2E student service',
			),
		),
		$organization_id
	);
}

$news_type_id = e2e_ensure_term( 'news_type', 'E2E News Type' );

$news_id = e2e_upsert_post(
	'E2E Core News Story',
	'news',
	array(
		'post_content' => '<!-- wp:paragraph --><p>E2E core news body.</p><!-- /wp:paragraph -->',
	)
);
wp_set_object_terms( $news_id, array( (int) $news_type_id ), 'news_type' );

if ( function_exists( 'update_field' ) ) {
	update_field( 'summary', 'E2E featured news summary.', $news_id );
	if ( $hero_attachment_id ) {
		update_field(
			'image',
			array(
				'ID' => $hero_attachment_id,
			),
			$news_id
		);
	}
}

$identity_support_id = e2e_upsert_post(
	'E2E Core Identity Support',
	'identity-support',
	array(
		'post_content' => '',
	)
);

if ( function_exists( 'update_field' ) ) {
	update_field( 'heading', 'E2E Support Tab', $identity_support_id );
	update_field( 'summary', 'E2E support tab summary content.', $identity_support_id );
	if ( $hero_attachment_id ) {
		update_field(
			'image',
			array(
				'ID' => $hero_attachment_id,
			),
			$identity_support_id
		);
	}
}

$differentiator_ids = array();
for ( $index = 1; $index <= 3; $index++ ) {
	$differentiator_id = e2e_upsert_post(
		'E2E Core Differentiator ' . $index,
		'differentiator',
		array(
			'post_content' => '',
		)
	);

	if ( function_exists( 'update_field' ) ) {
		update_field( 'title', 'E2E Stat ' . $index, $differentiator_id );
		update_field( 'text', 'E2E differentiator supporting text ' . $index . '.', $differentiator_id );
		update_field(
			'top',
			array(
				array(
					'acf_fc_layout' => 'text',
					'text'          => (string) ( 90 + $index ),
					'superscript'   => '%',
				),
			),
			$differentiator_id
		);
	}

	$differentiator_ids[] = (int) $differentiator_id;
}

$program_type_id = e2e_ensure_term( 'program_type', 'E2E Program Type' );
$degree_term_id    = e2e_ensure_term( 'degree', 'E2E Degree' );

$core_program_id = e2e_upsert_post(
	E2E_CORE_PROGRAM_TITLE,
	'program',
	array(
		'post_content' => '',
	)
);

$core_program_beta_id = e2e_upsert_post(
	'E2E Program Beta',
	'program',
	array(
		'post_content' => '',
	)
);

if ( function_exists( 'update_field' ) ) {
	update_field( 'short_name', 'E2E Alpha', $core_program_id );
	update_field( 'overview', 'E2E core program overview.', $core_program_id );
	update_field( 'type', (int) $program_type_id, $core_program_id );
	update_field( 'degree', (int) $degree_term_id, $core_program_id );
	update_field( 'duration', '2 years', $core_program_id );

	update_field( 'short_name', 'E2E Beta', $core_program_beta_id );
	update_field( 'overview', 'E2E secondary core program overview.', $core_program_beta_id );
	update_field( 'type', (int) $program_type_id, $core_program_beta_id );
	update_field( 'degree', (int) $degree_term_id, $core_program_beta_id );
	update_field( 'duration', '1 year', $core_program_beta_id );
}

$map = array(
	'organizationId'     => (int) $organization_id,
	'newsStoryId'        => (int) $news_id,
	'newsTypeId'         => (int) $news_type_id,
	'identitySupportId'  => (int) $identity_support_id,
	'differentiatorIds'  => $differentiator_ids,
	'coreProgramId'      => (int) $core_program_id,
	'coreProgramTitle'   => E2E_CORE_PROGRAM_TITLE,
);

update_option( E2E_CORE_SEED_OPTION, $map );

echo wp_json_encode( $map );
