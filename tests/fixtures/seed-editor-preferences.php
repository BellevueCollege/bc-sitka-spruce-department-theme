<?php
/**
 * Disable the starter pattern modal for the admin user in e2e tests.
 *
 * Idempotent: safe to run on every wp-env start. Run with `wp eval-file` from
 * the wp-env `afterStart` lifecycle script (tests/e2e/scripts/generate-wp-env-e2e.mjs).
 *
 * @package BcSitkaSpruce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const E2E_ADMIN_USER_ID              = 1;
const E2E_PERSISTED_PREFERENCES_KEY  = 'wp_persisted_preferences';

$preferences = get_user_meta( E2E_ADMIN_USER_ID, E2E_PERSISTED_PREFERENCES_KEY, true );
if ( ! is_array( $preferences ) ) {
	$preferences = array();
}

if ( ! isset( $preferences['core'] ) || ! is_array( $preferences['core'] ) ) {
	$preferences['core'] = array();
}

$preferences['core']['enableChoosePatternModal'] = false;

update_user_meta( E2E_ADMIN_USER_ID, E2E_PERSISTED_PREFERENCES_KEY, $preferences );

echo 'ok';
