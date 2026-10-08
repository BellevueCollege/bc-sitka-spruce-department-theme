<?php
/**
 * Shared helpers for e2e page integration seeds.
 *
 * @package BcSitkaSpruce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Theme directory slug mounted in wp-env (stable across local and CI checkouts). */
const E2E_THEME_SLUG = 'bc-sitka-spruce-department-theme';

require_once __DIR__ . '/e2e-query-helpers.php';

/**
 * Absolute path to a file under this theme directory in wp-content/themes.
 *
 * @param string $relative_path Path relative to the theme root.
 * @return string
 */
function e2e_theme_path( string $relative_path ): string {
	return WP_CONTENT_DIR . '/themes/' . E2E_THEME_SLUG . '/' . ltrim( $relative_path, '/' );
}

/**
 * Ensure a taxonomy term exists and return its ID.
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

/**
 * ACF image field value shape expected by theme controllers (`id` key).
 *
 * @param int $attachment_id Attachment post ID.
 * @return array<string, int>
 */
function e2e_acf_image_value( int $attachment_id ): array {
	return array(
		'ID' => $attachment_id,
		'id' => $attachment_id,
	);
}

/**
 * Seed degree sock site options for single-program template tests.
 *
 * @param int $hero_attachment_id Hero image attachment ID.
 */
function e2e_seed_degree_sock_site_options( int $hero_attachment_id ): void {
	if ( ! function_exists( 'update_field' ) ) {
		return;
	}

	$image = $hero_attachment_id > 0 ? e2e_acf_image_value( $hero_attachment_id ) : null;

	update_field(
		'degree_sock',
		array(
			'enable'           => 1,
			'main_message'       => array(
				'heading'          => 'E2E Degree Support',
				'additional_text'  => 'E2E degree sock supporting text.',
			),
			'message_segments'   => array(
				array(
					'title'       => 'E2E Admissions',
					'description' => 'E2E segment description.',
					'button'      => array(
						'title'  => 'Apply',
						'url'    => 'https://example.com/apply',
						'target' => '',
					),
				),
			),
			'admissions_contact' => array(
				'image'       => $image,
				'title'       => 'E2E Admissions Contact',
				'description' => 'E2E admissions contact description.',
				'button'      => array(
					'title'  => 'Contact',
					'url'    => 'https://example.com/contact',
					'target' => '',
				),
			),
		),
		'option'
	);
}

/**
 * Load a taxonomy term for ACF fields that return WP_Term objects.
 *
 * @param int    $term_id  Term ID.
 * @param string $taxonomy Taxonomy slug.
 * @return \WP_Term|null
 */
function e2e_get_taxonomy_term( int $term_id, string $taxonomy ): ?\WP_Term {
	$term = get_term( $term_id, $taxonomy );
	if ( ! $term || is_wp_error( $term ) ) {
		return null;
	}

	return $term;
}

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
 * @param int    $attachment_id Attachment post ID.
 * @param string $alt_text      Accessible alternative text.
 */
function e2e_set_attachment_alt_text( int $attachment_id, string $alt_text ): void {
	if ( $attachment_id <= 0 || $alt_text === '' ) {
		return;
	}

	update_post_meta( $attachment_id, '_wp_attachment_image_alt', $alt_text );
}

/**
 * Import the standard e2e hero image attachment.
 *
 * @return int Attachment ID.
 */
function e2e_import_hero_attachment(): int {
	$file = e2e_theme_path( 'tests/fixtures/test-image-760x400.png' );

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

	$attachment_id = (int) $attachment_id;
	e2e_set_attachment_alt_text( $attachment_id, 'E2E hero fixture image' );

	return $attachment_id;
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
