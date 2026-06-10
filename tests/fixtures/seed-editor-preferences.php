<?php
/**
 * Disable the starter pattern modal for the admin user in e2e tests.
 *
 * Idempotent: safe to run before every Playwright session.
 * Invoked via:
 *   wp-env run tests-cli wp eval-file .../seed-editor-preferences.php
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
