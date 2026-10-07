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
require_once __DIR__ . '/e2e-core-content-helpers.php';

$core_map = e2e_get_core_seed_map();

$hero_attachment_id = e2e_import_hero_attachment();
$tablepress_id      = e2e_seed_tablepress_table();
$profile_seed       = array();

$program_alpha_id = e2e_upsert_post(
	E2E_CORE_PROGRAM_TITLE,
	'program',
	array(
		'post_content' => e2e_load_pattern_markup( 'program-content-v1.php' ),
	)
);

$program_beta_id = e2e_upsert_post(
	'E2E Program Beta',
	'program',
	array(
		'post_content' => e2e_load_pattern_markup( 'program-content-v1.php' ),
	)
);

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

foreach ( $homepage_titles as $site_type => $title ) {
	$content = e2e_homepage_pattern_for_seed( $homepage_patterns[ $site_type ] );
	$content = e2e_wire_core_site_blocks_in_content( $content, $core_map );

	if ( $site_type === 'dept' ) {
		$content = e2e_wire_degrees_block_program( $content, $program_alpha_id );
	}

	$page_id = e2e_upsert_post(
		$title,
		'page',
		array( 'post_content' => $content )
	);

	if ( $hero_attachment_id && function_exists( 'update_field' ) ) {
		update_post_meta( $page_id, '_e2e_hero_image', $hero_attachment_id );
	}

	$homepage_urls[ $site_type ] = get_permalink( $page_id );
}

e2e_configure_front_page( 'dept', $homepage_titles['dept'] );

$flexible_parent_id = e2e_upsert_post(
	'E2E Flexible Parent',
	'page',
	array(
		'post_content' => '<!-- wp:paragraph --><p>E2E parent page intro.</p><!-- /wp:paragraph -->',
	)
);

$flexible_page_id = e2e_upsert_post(
	'E2E Flexible Page',
	'page',
	array(
		'post_parent'  => $flexible_parent_id,
		'post_content' => e2e_flexible_page_block_markup( $tablepress_id ),
	)
);

$application_content = e2e_load_pattern_markup( 'page-application-guide-v0.php' );
$application_content = e2e_strip_editor_setup_alert( $application_content );
$application_content = e2e_wire_core_site_blocks_in_content( $application_content, $core_map );
$application_page_id = e2e_upsert_post(
	'E2E Application Guide',
	'page',
	array( 'post_content' => $application_content )
);
update_post_meta( $application_page_id, '_wp_page_template', 'template--no-sidebar.php' );

$listing_page_id = e2e_upsert_post(
	'E2E Profile Listing',
	'page',
	array(
		'post_content' => e2e_strip_editor_setup_alert(
			e2e_load_pattern_markup( 'page-flexible-directory-v0.php' )
		),
	)
);
update_post_meta( $listing_page_id, '_wp_page_template', 'template--profile-listing.php' );

$profile_content = e2e_load_pattern_markup( 'profile-content-v0.php' );
$profile_content = e2e_wire_core_site_blocks_in_content( $profile_content, $core_map );

$profile_post_id = e2e_upsert_post(
	'E2E Profile Ada Lovelace',
	'profile',
	array( 'post_content' => $profile_content )
);

if ( function_exists( 'update_field' ) ) {
	update_field( 'first_name', 'Ada', $profile_post_id );
	update_field( 'last_name', 'Lovelace', $profile_post_id );
	update_field( 'position_role', 'E2E Faculty', $profile_post_id );
}

$profile_seed = array(
	'profileId'  => (int) $profile_post_id,
	'profileUrl' => (string) get_permalink( $profile_post_id ),
);

$blog_page_id = e2e_upsert_post(
	'E2E Blog Index',
	'page',
	array(
		'post_content' => '<!-- wp:paragraph --><p>E2E blog landing.</p><!-- /wp:paragraph -->',
	)
);
update_option( 'page_for_posts', $blog_page_id );

$governance = array(
	'agendaUrl'        => '',
	'actionItemUrl'    => '',
	'resolutionUrl'    => '',
	'agendaArchiveUrl' => '',
);

if ( post_type_exists( 'agendas' ) ) {
	$agenda_id = e2e_upsert_post(
		'E2E Board Agenda',
		'agendas',
		array(
			'post_content' => '<!-- wp:paragraph --><p>E2E agenda body content.</p><!-- /wp:paragraph -->',
		)
	);
	if ( function_exists( 'update_field' ) ) {
		update_field( 'meeting_date', '20260115', $agenda_id );
		update_field( 'special_meeting', 0, $agenda_id );
	}

	$action_id = e2e_upsert_post(
		'E2E Action Item',
		'action-item',
		array(
			'post_content' => '<!-- wp:paragraph --><p>E2E action item body.</p><!-- /wp:paragraph -->',
		)
	);
	if ( function_exists( 'update_field' ) ) {
		update_field( 'meeting_date', '20260115', $action_id );
	}

	$resolution_id = e2e_upsert_post(
		'E2E Resolution',
		'resolution',
		array(
			'post_content' => '<!-- wp:paragraph --><p>E2E resolution body.</p><!-- /wp:paragraph -->',
		)
	);
	if ( function_exists( 'update_field' ) ) {
		update_field( 'meeting_date', '20260115', $resolution_id );
		update_field( 'related_action_items', array( $action_id ), $agenda_id );
	}

	$governance['agendaUrl']         = get_permalink( $agenda_id );
	$governance['actionItemUrl']     = get_permalink( $action_id );
	$governance['resolutionUrl']     = get_permalink( $resolution_id );
	$governance['agendaArchiveUrl']  = get_post_type_archive_link( 'agendas' );
}

echo wp_json_encode(
	array(
		'homepages'           => $homepage_urls,
		'flexiblePageUrl'     => get_permalink( $flexible_page_id ),
		'applicationGuideUrl' => get_permalink( $application_page_id ),
		'profileListingUrl'   => get_permalink( $listing_page_id ),
		'profileUrl'          => get_permalink( $profile_post_id ),
		'blogIndexUrl'        => get_permalink( $blog_page_id ),
		'programUrl'          => get_permalink( $program_alpha_id ),
		'programBetaUrl'      => get_permalink( $program_beta_id ),
		'governance'          => $governance,
		'tablepressId'        => $tablepress_id,
		'profileSeed'         => $profile_seed,
	)
);
