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
 * Paragraph block markup matching a block-editor save.
 *
 * @param string $text Visible paragraph text.
 * @return string
 */
function e2e_governance_paragraph_block( string $text ): string {
	$escaped_text = esc_html( $text );

	return "<!-- wp:paragraph -->\n<p class=\"wp-block-paragraph\">{$escaped_text}</p>\n<!-- /wp:paragraph -->";
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
			'post_content' => e2e_governance_paragraph_block( 'E2E agenda body content.' ),
		)
	);

	$special_agenda_id = e2e_upsert_post(
		'E2E Special Board Agenda',
		'agendas',
		array(
			'post_content' => e2e_governance_paragraph_block( 'E2E special agenda body.' ),
		)
	);

	$second_2026_agenda_id = e2e_upsert_post(
		'E2E Spring Board Agenda',
		'agendas',
		array(
			'post_content' => e2e_governance_paragraph_block( 'E2E spring agenda body.' ),
		)
	);

	$prior_year_agenda_id = e2e_upsert_post(
		'E2E Prior Year Agenda',
		'agendas',
		array(
			'post_content' => e2e_governance_paragraph_block( 'E2E prior year agenda body.' ),
		)
	);

	$action_id = e2e_upsert_post(
		'E2E Action Item',
		'action-item',
		array(
			'post_content' => e2e_governance_paragraph_block( 'E2E action item body.' ),
		)
	);

	$resolution_id = e2e_upsert_post(
		'E2E Resolution',
		'resolution',
		array(
			'post_content' => e2e_governance_paragraph_block( 'E2E resolution body.' ),
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
