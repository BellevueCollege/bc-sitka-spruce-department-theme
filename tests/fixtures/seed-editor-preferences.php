<?php
/**
 * Disable starter-pattern modal and settings sidebar for the admin user in e2e.
 *
 * Multisite persists preferences under `{blog_prefix}persisted_preferences`
 * (e.g. `wp_2_persisted_preferences` on the department subsite). Seeding only
 * `wp_persisted_preferences` leaves the modal and complementary area enabled.
 *
 * Idempotent: safe to run on every wp-env start. Run with `wp eval-file` from
 * the wp-env `afterStart` lifecycle script (tests/e2e/scripts/generate-wp-env-e2e.mjs).
 *
 * @package BcSitkaSpruce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const E2E_ADMIN_USER_ID = 1;

/**
 * Merge e2e editor preference defaults into a persisted-preferences array.
 *
 * @param mixed $preferences Existing user meta value.
 * @return array
 */
function e2e_merge_editor_preferences( $preferences ): array {
	if ( ! is_array( $preferences ) ) {
		$preferences = array();
	}

	if ( ! isset( $preferences['core'] ) || ! is_array( $preferences['core'] ) ) {
		$preferences['core'] = array();
	}

	$preferences['core']['enableChoosePatternModal']   = false;
	$preferences['core']['isComplementaryAreaVisible'] = false;

	if ( ! isset( $preferences['core/edit-post'] ) || ! is_array( $preferences['core/edit-post'] ) ) {
		$preferences['core/edit-post'] = array();
	}

	$preferences['core/edit-post']['welcomeGuide'] = false;

	return $preferences;
}

global $wpdb;

$preference_meta_keys = array_unique(
	array(
		'wp_persisted_preferences',
		$wpdb->get_blog_prefix() . 'persisted_preferences',
	)
);

foreach ( $preference_meta_keys as $meta_key ) {
	$preferences = get_user_meta( E2E_ADMIN_USER_ID, $meta_key, true );
	update_user_meta(
		E2E_ADMIN_USER_ID,
		$meta_key,
		e2e_merge_editor_preferences( $preferences )
	);
}

echo wp_json_encode(
	array(
		'ok'       => true,
		'blogId'   => get_current_blog_id(),
		'metaKeys' => $preference_meta_keys,
	)
);
