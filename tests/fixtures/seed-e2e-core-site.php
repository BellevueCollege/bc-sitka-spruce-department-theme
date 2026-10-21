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
require_once __DIR__ . '/e2e-differentiator-acf.php';
e2e_register_differentiator_acf_field_group();

/**
 * Publish a core-site news story used by the small news list.
 *
 * @param string $title              Post title.
 * @param string $summary            ACF summary shown in the news feature list.
 * @param int    $news_type_id       news_type term ID.
 * @param int    $hero_attachment_id Featured image attachment ID.
 * @return int
 */
function e2e_seed_core_news_story(
	string $title,
	string $summary,
	int $news_type_id,
	int $hero_attachment_id,
	string $post_date = ''
): int {
	$post_args = array(
		'post_content' => '<!-- wp:paragraph --><p>' . esc_html( $title ) . ' body.</p><!-- /wp:paragraph -->',
	);
	if ( $post_date !== '' ) {
		$post_args['post_date']     = $post_date;
		$post_args['post_date_gmt'] = get_gmt_from_date( $post_date );
	}

	$news_id = e2e_upsert_post(
		$title,
		'news',
		$post_args
	);
	wp_set_object_terms( $news_id, array( $news_type_id ), 'news_type' );

	if ( function_exists( 'update_field' ) ) {
		update_field( 'summary', $summary, $news_id );
		if ( $hero_attachment_id > 0 ) {
			e2e_assign_raw_image_meta( (int) $news_id, $hero_attachment_id );
		}
	}

	return (int) $news_id;
}

/**
 * Store an image array without binding the shared ACF name "image".
 *
 * The e2e differentiator group registers a subfield named image. update_field( 'image' )
 * on news and organization posts was saving that field key, and News::get_single()
 * then received an attachment ID string instead of an image array.
 *
 * @param int $post_id       Post that displays the image.
 * @param int $attachment_id Attachment post ID.
 */
function e2e_assign_raw_image_meta( int $post_id, int $attachment_id ): void {
	if ( $post_id <= 0 || $attachment_id <= 0 ) {
		return;
	}

	update_post_meta( $post_id, 'image', e2e_acf_image_value( $attachment_id ) );
	delete_post_meta( $post_id, '_image' );
}

/**
 * Publish one core-site differentiator.
 *
 * Four rows cover text, icon, and image tops, plus a fourth text stat so a
 * four-up section wraps to a second row.
 *
 * @param int                  $index      1-based label index.
 * @param string               $layout     Flexible content layout name.
 * @param array<string, mixed> $top_fields Layout sub-fields.
 * @return int
 */
function e2e_seed_core_differentiator( int $index, string $layout, array $top_fields ): int {
	$differentiator_id = e2e_upsert_post(
		'E2E Core Differentiator ' . $index,
		'differentiator',
		array(
			'post_content' => '',
		)
	);

	if ( ! function_exists( 'update_field' ) ) {
		return (int) $differentiator_id;
	}

	update_field( 'field_63061256830d2', 'E2E Stat ' . $index, $differentiator_id );
	update_field(
		'field_63061261830d3',
		'E2E differentiator supporting text ' . $index . '.',
		$differentiator_id
	);
	update_field(
		'field_6306119e830cb',
		array(
			array_merge(
				array( 'acf_fc_layout' => $layout ),
				$top_fields
			),
		),
		$differentiator_id
	);

	return (int) $differentiator_id;
}

/**
 * Attach shared pathway and focus area posts to a core program.
 *
 * @param int   $program_id     Program post ID.
 * @param int[] $pathway_ids    Pathway post IDs.
 * @param int[] $focus_area_ids Focus area post IDs.
 */
function e2e_assign_core_program_pathways( int $program_id, array $pathway_ids, array $focus_area_ids ): void {
	if ( $program_id <= 0 || ! function_exists( 'update_field' ) ) {
		return;
	}

	$pathway_ids = array_values( array_filter( array_map( 'intval', $pathway_ids ) ) );
	$focus_area_ids = array_values( array_filter( array_map( 'intval', $focus_area_ids ) ) );
	if ( $pathway_ids === array() ) {
		return;
	}

	update_field( 'pathways', $pathway_ids, $program_id );
	update_field( 'focus_areas', $focus_area_ids, $program_id );
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
		e2e_assign_raw_image_meta( (int) $organization_id, (int) $hero_attachment_id );
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
		'post_content'  => '<!-- wp:paragraph --><p>E2E core news body.</p><!-- /wp:paragraph -->',
		'post_date'     => '2020-01-01 12:00:00',
		'post_date_gmt' => get_gmt_from_date( '2020-01-01 12:00:00' ),
	)
);
wp_set_object_terms( $news_id, array( (int) $news_type_id ), 'news_type' );

if ( function_exists( 'update_field' ) ) {
	update_field( 'summary', 'E2E featured news summary.', $news_id );
	if ( $hero_attachment_id ) {
		e2e_assign_raw_image_meta( (int) $news_id, (int) $hero_attachment_id );
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
		e2e_assign_raw_image_meta( (int) $identity_support_id, (int) $hero_attachment_id );
	}
	update_field(
		'links',
		array(
			array(
				'link' => array(
					'title'  => 'E2E Support Resource',
					'url'    => 'https://example.com/e2e-support-resource',
					'target' => '',
				),
			),
		),
		$identity_support_id
	);
}

$identity_support_two_id = e2e_upsert_post(
	'E2E Core Identity Support Two',
	'identity-support',
	array(
		'post_content' => '',
	)
);

if ( function_exists( 'update_field' ) ) {
	update_field( 'heading', 'E2E Support Tab Two', $identity_support_two_id );
	update_field( 'summary', 'E2E second support tab summary content.', $identity_support_two_id );
	if ( $hero_attachment_id ) {
		e2e_assign_raw_image_meta( (int) $identity_support_two_id, (int) $hero_attachment_id );
	}
}

// Fixed dates keep news-feature-core list order stable (date DESC → Two, Three, Four).
$news_two_id = e2e_seed_core_news_story(
	'E2E Core News Story Two',
	'E2E secondary featured news summary.',
	(int) $news_type_id,
	(int) $hero_attachment_id,
	'2020-01-14 12:00:00'
);
e2e_seed_core_news_story(
	'E2E Core News Story Three',
	'E2E third featured news summary.',
	(int) $news_type_id,
	(int) $hero_attachment_id,
	'2020-01-13 12:00:00'
);
e2e_seed_core_news_story(
	'E2E Core News Story Four',
	'E2E fourth featured news summary.',
	(int) $news_type_id,
	(int) $hero_attachment_id,
	'2020-01-12 12:00:00'
);

$differentiator_definitions = array(
	array(
		'layout' => 'text',
		'top'    => array(
			'text'        => '91',
			'superscript' => '%',
		),
	),
	array(
		'layout' => 'icon',
		'top'    => array(
			'icon' => '{"style":"solid","id":"graduation-cap","label":"Graduation cap"}',
		),
	),
	array(
		'layout' => 'image',
		'top'    => array(
			'image' => $hero_attachment_id ? e2e_acf_image_value( (int) $hero_attachment_id ) : '',
		),
	),
	array(
		'layout' => 'text',
		'top'    => array(
			'text'        => '12',
			'superscript' => 'k',
		),
	),
);

$differentiator_ids = array();
foreach ( $differentiator_definitions as $index => $definition ) {
	$differentiator_ids[] = e2e_seed_core_differentiator(
		$index + 1,
		$definition['layout'],
		$definition['top']
	);
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

$program_type_term = e2e_get_taxonomy_term( $program_type_id, 'program_type' );
$degree_term         = e2e_get_taxonomy_term( $degree_term_id, 'degree' );

wp_set_object_terms( $core_program_id, array( (int) $program_type_id ), 'program_type' );
wp_set_object_terms( $core_program_id, array( (int) $degree_term_id ), 'degree' );
wp_set_object_terms( $core_program_beta_id, array( (int) $program_type_id ), 'program_type' );
wp_set_object_terms( $core_program_beta_id, array( (int) $degree_term_id ), 'degree' );

if ( function_exists( 'update_field' ) ) {
	update_field( 'short_name', 'E2E Alpha', $core_program_id );
	update_field( 'overview', 'E2E core program overview.', $core_program_id );
	if ( $program_type_term ) {
		update_field( 'type', $program_type_term, $core_program_id );
	}
	if ( $degree_term ) {
		update_field( 'degree', $degree_term, $core_program_id );
	}
	update_field( 'duration', '2 years', $core_program_id );

	update_field( 'short_name', 'E2E Beta', $core_program_beta_id );
	update_field( 'overview', 'E2E secondary core program overview.', $core_program_beta_id );
	if ( $program_type_term ) {
		update_field( 'type', $program_type_term, $core_program_beta_id );
	}
	if ( $degree_term ) {
		update_field( 'degree', $degree_term, $core_program_beta_id );
	}
	update_field( 'duration', '1 year', $core_program_beta_id );
}

$pathway_id    = 0;
$focus_area_id = 0;
if ( post_type_exists( 'pathway' ) && post_type_exists( 'focus-area' ) ) {
	$pathway_id = e2e_upsert_post(
		'E2E BC Pathway',
		'pathway',
		array(
			'post_content' => '',
			'post_name'    => 'e2e-bc-pathway',
		)
	);
	$focus_area_id = e2e_upsert_post(
		'E2E Focus Area',
		'focus-area',
		array(
			'post_content' => '',
			'post_name'    => 'e2e-focus-area',
		)
	);

	e2e_assign_core_program_pathways( $core_program_id, array( $pathway_id ), array( $focus_area_id ) );
	e2e_assign_core_program_pathways( $core_program_beta_id, array( $pathway_id ), array( $focus_area_id ) );
}

$map = array(
	'organizationId'        => (int) $organization_id,
	'newsStoryId'           => (int) $news_id,
	'newsStoryTwoId'        => (int) $news_two_id,
	'newsTypeId'            => (int) $news_type_id,
	'identitySupportId'     => (int) $identity_support_id,
	'identitySupportTwoId'  => (int) $identity_support_two_id,
	'differentiatorIds'     => $differentiator_ids,
	'coreProgramId'         => (int) $core_program_id,
	'coreProgramTitle'      => E2E_CORE_PROGRAM_TITLE,
	'pathwayId'             => (int) $pathway_id,
	'focusAreaId'           => (int) $focus_area_id,
);

update_option( E2E_CORE_SEED_OPTION, $map );

echo wp_json_encode( $map );
