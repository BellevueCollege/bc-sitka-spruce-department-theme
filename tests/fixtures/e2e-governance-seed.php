<?php
/**
 * Trustees governance CPT seeds for Playwright integration tests.
 *
 * @package BcSitkaSpruce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @return array<string, string>
 */
function e2e_seed_governance_data(): array {
	$empty = array(
		'agendaUrl'         => '',
		'specialAgendaUrl'  => '',
		'actionItemUrl'     => '',
		'resolutionUrl'     => '',
		'agendaArchiveUrl'  => '',
	);

	if ( ! post_type_exists( 'agendas' ) ) {
		return $empty;
	}

	$canonical_agenda_id = e2e_upsert_post(
		'E2E Board Agenda',
		'agendas',
		array(
			'post_content' => '<!-- wp:paragraph --><p>E2E agenda body content.</p><!-- /wp:paragraph -->',
		)
	);

	$special_agenda_id = e2e_upsert_post(
		'E2E Special Board Agenda',
		'agendas',
		array(
			'post_content' => '<!-- wp:paragraph --><p>E2E special agenda body.</p><!-- /wp:paragraph -->',
		)
	);

	$second_2026_agenda_id = e2e_upsert_post(
		'E2E Spring Board Agenda',
		'agendas',
		array(
			'post_content' => '<!-- wp:paragraph --><p>E2E spring agenda body.</p><!-- /wp:paragraph -->',
		)
	);

	$prior_year_agenda_id = e2e_upsert_post(
		'E2E Prior Year Agenda',
		'agendas',
		array(
			'post_content' => '<!-- wp:paragraph --><p>E2E prior year agenda body.</p><!-- /wp:paragraph -->',
		)
	);

	$action_id = e2e_upsert_post(
		'E2E Action Item',
		'action-item',
		array(
			'post_content' => '<!-- wp:paragraph --><p>E2E action item body.</p><!-- /wp:paragraph -->',
		)
	);

	$resolution_id = e2e_upsert_post(
		'E2E Resolution',
		'resolution',
		array(
			'post_content' => '<!-- wp:paragraph --><p>E2E resolution body.</p><!-- /wp:paragraph -->',
		)
	);

	if ( function_exists( 'update_field' ) ) {
		update_field( 'meeting_date', '20260115', $canonical_agenda_id );
		update_field( 'special_meeting', 0, $canonical_agenda_id );
		update_field( 'associated_agenda', $canonical_agenda_id, $action_id );
		update_field( 'related_action_items', array( $action_id ), $canonical_agenda_id );

		update_field( 'associated_agenda', $canonical_agenda_id, $resolution_id );
		update_field( 'associated_action_item', $action_id, $resolution_id );
		update_field( 'field_699e4c1359f63', array( $resolution_id ), $canonical_agenda_id );

		update_field( 'meeting_date', '20260610', $special_agenda_id );
		update_field( 'special_meeting', 1, $special_agenda_id );

		update_field( 'meeting_date', '20260301', $second_2026_agenda_id );
		update_field( 'special_meeting', 0, $second_2026_agenda_id );

		update_field( 'meeting_date', '20251105', $prior_year_agenda_id );
		update_field( 'special_meeting', 0, $prior_year_agenda_id );

		update_field( 'meeting_date', '20260115', $action_id );

		update_field( 'meeting_date', '20260115', $resolution_id );
	}

	return array(
		'agendaUrl'        => (string) get_permalink( $canonical_agenda_id ),
		'specialAgendaUrl' => (string) get_permalink( $special_agenda_id ),
		'actionItemUrl'    => (string) get_permalink( $action_id ),
		'resolutionUrl'    => (string) get_permalink( $resolution_id ),
		'agendaArchiveUrl' => (string) get_post_type_archive_link( 'agendas' ),
	);
}
