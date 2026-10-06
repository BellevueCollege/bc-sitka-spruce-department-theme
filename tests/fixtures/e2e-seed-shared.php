<?php
/**
 * Shared helpers for e2e page integration seeds.
 *
 * @package BcSitkaSpruce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/e2e-query-helpers.php';

/**
 * Delete a post by title if it exists.
 *
 * @param string $title     Post title.
 * @param string $post_type Post type.
 */
function e2e_delete_post_by_title( string $title, string $post_type ): void {
	$existing = e2e_get_post_by_title( $title, $post_type );
	if ( $existing ) {
		wp_delete_post( $existing->ID, true );
	}
}

/**
 * Publish or update a post by title.
 *
 * @param string               $title     Post title.
 * @param string               $post_type Post type.
 * @param array<string, mixed> $args      wp_insert_post args (post_content, page_template, post_parent, etc.).
 * @return int Post ID.
 */
function e2e_upsert_post( string $title, string $post_type, array $args ): int {
	e2e_delete_post_by_title( $title, $post_type );

	$post_id = wp_insert_post(
		array_merge(
			array(
				'post_title'  => $title,
				'post_status' => 'publish',
				'post_type'   => $post_type,
			),
			$args
		),
		true
	);

	if ( is_wp_error( $post_id ) ) {
		echo wp_json_encode( array( 'error' => $post_id->get_error_message() ) );
		exit( 1 );
	}

	return (int) $post_id;
}

/**
 * Import the standard e2e hero image attachment.
 *
 * @return int Attachment ID.
 */
function e2e_import_hero_attachment(): int {
	$theme_path = get_stylesheet_directory();
	$file       = $theme_path . '/tests/fixtures/test-image-760x400.png';

	if ( ! file_exists( $file ) ) {
		return 0;
	}

	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/media.php';
	require_once ABSPATH . 'wp-admin/includes/image.php';

	$tmp = wp_tempnam( 'e2e-hero.png' );
	if ( ! $tmp || ! copy( $file, $tmp ) ) {
		return 0;
	}

	$attachment_id = media_handle_sideload(
		array(
			'name'     => 'e2e-hero.png',
			'tmp_name' => $tmp,
		),
		0
	);

	if ( is_wp_error( $attachment_id ) ) {
		return 0;
	}

	return (int) $attachment_id;
}

/**
 * Set ACF site type and which page is the static front page.
 *
 * @param string $site_type dept|div|suppt.
 * @param string $homepage_title Front page title.
 */
function e2e_configure_front_page( string $site_type, string $homepage_title ): void {
	if ( function_exists( 'update_field' ) ) {
		update_field( 'site_type', $site_type, 'option' );
	}

	$page = e2e_get_post_by_title( $homepage_title, 'page' );
	if ( ! $page ) {
		return;
	}

	update_option( 'show_on_front', 'page' );
	update_option( 'page_on_front', $page->ID );
}

/**
 * Create a TablePress table for flexible-page tests.
 *
 * @return string Table ID for the tablepress/table block.
 */
function e2e_seed_tablepress_table(): string {
	if ( ! class_exists( 'TablePress' ) || ! isset( TablePress::$model_table ) ) {
		return '1';
	}

	$model = TablePress::$model_table;
	$table = $model->get_table_template();
	$table['name'] = 'E2E Sample Table';
	$table['data'] = array(
		array( 'E2E Column A', 'E2E Column B' ),
		array( 'E2E Cell One', 'E2E Cell Two' ),
	);

	$prepared = $model->prepare_table( $model->get_table_template(), $table, false );
	if ( is_wp_error( $prepared ) ) {
		return '1';
	}

	$table_id = $model->add( $prepared );
	if ( is_wp_error( $table_id ) ) {
		return '1';
	}

	return (string) $table_id;
}

/**
 * Seed profile CPT posts and taxonomies for listing tests.
 *
 * @return array{profileUrl: string, profileId: int}
 */
function e2e_seed_profiles(): array {
	$profile_title = 'E2E Profile Ada Lovelace';

	e2e_delete_post_by_title( $profile_title, 'profile' );

	$profile_id = wp_insert_post(
		array(
			'post_title'  => $profile_title,
			'post_status' => 'publish',
			'post_type'   => 'profile',
			'post_content' => '',
		),
		true
	);

	if ( is_wp_error( $profile_id ) ) {
		echo wp_json_encode( array( 'error' => $profile_id->get_error_message() ) );
		exit( 1 );
	}

	if ( function_exists( 'update_field' ) ) {
		update_field( 'first_name', 'Ada', $profile_id );
		update_field( 'last_name', 'Lovelace', $profile_id );
		update_field( 'position_role', 'E2E Faculty', $profile_id );
	}

	return array(
		'profileId'  => (int) $profile_id,
		'profileUrl' => (string) get_permalink( $profile_id ),
	);
}
