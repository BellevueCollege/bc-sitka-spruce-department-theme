<?php
/**
 * Seed published pages and CPTs for Playwright page integration tests.
 *
 * @package BcSitkaSpruce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! post_type_exists( 'agendas' ) ) {
	$trustees_plugin = WP_PLUGIN_DIR . '/trustees-agenda/trustees-agenda.php';
	if ( is_readable( $trustees_plugin ) ) {
		require_once ABSPATH . 'wp-admin/includes/plugin.php';
		activate_plugin( plugin_basename( $trustees_plugin ) );
	}
}

require_once __DIR__ . '/e2e-content-strip.php';
require_once __DIR__ . '/e2e-seed-shared.php';
require_once __DIR__ . '/e2e-flexible-page-content.php';
require_once __DIR__ . '/e2e-application-guide-content.php';
require_once __DIR__ . '/e2e-homepage-content.php';
require_once __DIR__ . '/e2e-core-content-helpers.php';
require_once __DIR__ . '/e2e-governance-seed.php';
require_once __DIR__ . '/e2e-profiles-integration.php';
require_once __DIR__ . '/e2e-program-content.php';
require_once __DIR__ . '/e2e-full-width-content.php';
require_once __DIR__ . '/e2e-section-adjacency.php';

$core_map = e2e_get_core_seed_map();

$hero_attachment_id    = e2e_import_hero_attachment();
$tablepress_id         = e2e_seed_tablepress_table();
$profile_seed          = array();
$profile_department_id = e2e_ensure_term( 'department', 'E2E Department' );
$profile_type_id       = e2e_ensure_term( 'profile_type', 'E2E Faculty' );

$profile_image_id   = e2e_import_profile_attachment();
$profile_pages      = e2e_seed_profile_integration_pages(
	$profile_department_id,
	$profile_type_id,
	$profile_image_id
);
$profile_post_id    = $profile_pages['profileIds'][0];
$homepage_profile_ids = array_slice( $profile_pages['profileIds'], 0, 3 );

$profile_seed = array(
	'profileId'         => (int) $profile_post_id,
	'profileUrl'        => $profile_pages['profileUrl'],
	'profileNoPhotoUrl' => $profile_pages['profileNoPhotoUrl'],
);

$program_pattern_content = e2e_build_program_post_content(
	$core_map,
	$profile_post_id,
	$hero_attachment_id
);

$program_alpha_id = e2e_upsert_post(
	E2E_CORE_PROGRAM_TITLE,
	'program',
	array(
		'post_content' => $program_pattern_content,
	)
);

$program_beta_id = e2e_upsert_post(
	'E2E Program Beta',
	'program',
	array(
		'post_content' => $program_pattern_content,
	)
);

if ( function_exists( 'update_field' ) ) {
	update_field( 'intro_text', 'E2E program page intro lead.', $program_alpha_id );
	update_field( 'header_image', $hero_attachment_id, $program_alpha_id );
}

$homepage_titles = array(
	'dept'  => 'E2E Homepage Department',
	'div'   => 'E2E Homepage Division',
	'suppt' => 'E2E Homepage Support',
);

$homepage_patterns = array(
	'dept'  => 'page-homepage-dept-v1.php',
	'div'   => 'page-homepage-division-v1.php',
	'suppt' => 'page-homepage-support-v1.php',
);

$homepage_urls = array();

$homepage_enrichment_context = array(
	'profile_ids'  => $homepage_profile_ids,
	'program_ids'  => array( (int) $program_alpha_id, (int) $program_beta_id ),
);

foreach ( $homepage_titles as $site_type => $title ) {
	$pattern_content = e2e_homepage_pattern_for_seed( $homepage_patterns[ $site_type ] );
	$pattern_content = e2e_wire_core_site_blocks_in_content( $pattern_content, $core_map );

	$content_with_hero = e2e_enrich_homepage_content(
		$pattern_content,
		$site_type,
		$hero_attachment_id,
		$homepage_enrichment_context
	);

	$content_without_hero = e2e_enrich_homepage_content(
		$pattern_content,
		$site_type,
		0,
		$homepage_enrichment_context
	);

	$page_id = e2e_upsert_post(
		$title,
		'page',
		array( 'post_content' => $content_with_hero )
	);

	$no_hero_page_id = e2e_upsert_post(
		$title . ' (No Hero)',
		'page',
		array( 'post_content' => $content_without_hero )
	);

	$homepage_urls[ $site_type ] = array(
		'withHero'    => (string) get_permalink( $page_id ),
		'withoutHero' => (string) get_permalink( $no_hero_page_id ),
	);
}

e2e_configure_front_page( 'dept', $homepage_titles['dept'] );

$flexible_parent_id = e2e_upsert_post(
	'E2E Flexible Parent',
	'page',
	array(
		'post_content' => '<!-- wp:paragraph --><p>E2E parent page intro.</p><!-- /wp:paragraph -->',
	)
);

$flexible_page_content = e2e_flexible_page_block_markup( $tablepress_id );

$flexible_page_id = e2e_upsert_post(
	'E2E Flexible Page',
	'page',
	array(
		'post_parent'  => $flexible_parent_id,
		'post_content' => $flexible_page_content,
	)
);
e2e_set_page_flexible_intro(
	$flexible_page_id,
	'E2E flexible page intro summary.',
	$hero_attachment_id
);

$section_adjacency_content = e2e_section_adjacency_page_markup(
	$core_map,
	array( (int) $program_alpha_id, (int) $program_beta_id ),
	(int) $profile_post_id,
	(int) $hero_attachment_id
);
$section_adjacency_page_id = e2e_upsert_post(
	'E2E Section Adjacency',
	'page',
	array( 'post_content' => $section_adjacency_content )
);
update_post_meta( $section_adjacency_page_id, '_wp_page_template', 'template--no-sidebar.php' );
e2e_set_page_flexible_intro(
	$section_adjacency_page_id,
	'E2E section adjacency intro summary.',
	0
);

$application_content = e2e_application_guide_block_markup( $hero_attachment_id );
$application_content = e2e_wire_core_site_blocks_in_content( $application_content, $core_map );
$application_page_id = e2e_upsert_post(
	'E2E Application Guide',
	'page',
	array( 'post_content' => $application_content )
);
update_post_meta( $application_page_id, '_wp_page_template', 'template--no-sidebar.php' );
e2e_set_page_flexible_intro(
	$application_page_id,
	'E2E application guide intro summary.',
	$hero_attachment_id
);

$application_guide_intro_matrix = e2e_seed_no_sidebar_intro_matrix_pages( $hero_attachment_id );

$listing_page_id = $profile_pages['listingPageId'];

$full_width_page_id = e2e_upsert_post(
	'E2E Full Width Page',
	'page',
	array( 'post_content' => e2e_full_width_page_block_markup() )
);
update_post_meta( $full_width_page_id, '_wp_page_template', 'template--no-sidebar.php' );
e2e_set_page_flexible_intro(
	$full_width_page_id,
	'E2E full width page intro summary.',
	$hero_attachment_id
);

$blog_page_id = e2e_upsert_post(
	'E2E Blog Index',
	'page',
	array(
		'post_content' => '<!-- wp:paragraph --><p>E2E blog landing.</p><!-- /wp:paragraph -->',
	)
);
update_option( 'page_for_posts', $blog_page_id );
e2e_set_page_flexible_intro(
	$blog_page_id,
	'E2E blog index intro summary.',
	$hero_attachment_id
);

$governance = e2e_seed_governance_data();

echo wp_json_encode(
	array(
		'homepages'           => $homepage_urls,
		'flexiblePageUrl'          => get_permalink( $flexible_page_id ),
		'sectionAdjacencyPageUrl'  => get_permalink( $section_adjacency_page_id ),
		'applicationGuideUrl' => get_permalink( $application_page_id ),
		'applicationGuideIntroMatrix' => $application_guide_intro_matrix,
		'profileListingUrl'      => get_permalink( $listing_page_id ),
		'profilesBlockPageUrl'   => $profile_pages['profilesBlockPageUrl'],
		'profileUrl'             => $profile_pages['profileUrl'],
		'profileNoPhotoUrl'      => $profile_pages['profileNoPhotoUrl'],
		'fullWidthPageUrl'       => get_permalink( $full_width_page_id ),
		'fullWidthIntroMatrix'   => $application_guide_intro_matrix,
		'blogIndexUrl'        => get_permalink( $blog_page_id ),
		'blogIntroMatrix'     => $application_guide_intro_matrix,
		'programUrl'          => get_permalink( $program_alpha_id ),
		'programBetaUrl'      => get_permalink( $program_beta_id ),
		'governance'          => $governance,
		'tablepressId'        => $tablepress_id,
		'profileSeed'         => $profile_seed,
		'profileDepartmentId' => $profile_department_id,
		'profileTypeId'       => $profile_type_id,
	)
);
