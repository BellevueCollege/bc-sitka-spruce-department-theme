<?php
/**
 * Seed posts and a category for Posts Feature e2e tests.
 *
 * @package BcSitkaSpruce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/e2e-query-helpers.php';
require_once ABSPATH . 'wp-admin/includes/image.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';

$theme_slug    = 'bc-sitka-spruce-department-theme';
$image_path    = WP_CONTENT_DIR . "/themes/{$theme_slug}/tests/fixtures/test-image-760x400.png";
$category_name = 'E2E Posts Feature';

// Required for register_blocks() to include posts-feature.
update_option( 'options_enable_posts', 1 );

$post_titles = array(
	'E2E Featured Post',
	'E2E List Post 1',
	'E2E List Post 2',
	'E2E List Post 3',
	'E2E List Post 4',
);

foreach ( $post_titles as $title ) {
	$existing = e2e_get_post_by_title( $title, 'post' );
	if ( $existing ) {
		wp_delete_post( $existing->ID, true );
	}
}

$existing_term = get_term_by( 'name', $category_name, 'category' );
if ( $existing_term ) {
	wp_delete_term( $existing_term->term_id, 'category' );
}

$term_result = wp_insert_term( $category_name, 'category' );
if ( is_wp_error( $term_result ) ) {
	echo wp_json_encode( array( 'error' => $term_result->get_error_message() ) );
	exit( 1 );
}

$category_id = (int) $term_result['term_id'];

if ( ! file_exists( $image_path ) ) {
	echo wp_json_encode( array( 'error' => 'Fixture image not found.' ) );
	exit( 1 );
}

$filename   = basename( $image_path );
$tmp_file   = wp_tempnam( $filename );
$attachment_id = 0;

if ( $tmp_file && copy( $image_path, $tmp_file ) ) {
	$file_array = array(
		'name'     => $filename,
		'tmp_name' => $tmp_file,
	);
	$attachment_id = media_handle_sideload( $file_array, 0 );
	@unlink( $tmp_file );
}

if ( is_wp_error( $attachment_id ) || ! $attachment_id ) {
	echo wp_json_encode( array( 'error' => 'Failed to import fixture image.' ) );
	exit( 1 );
}

update_post_meta(
	$attachment_id,
	'_wp_attachment_image_alt',
	'E2E Posts Feature fixture image'
);

$post_ids = array();
$dates    = array(
	'-4 hours',
	'-1 hour',
	'-2 hours',
	'-3 hours',
	'-30 minutes',
);

foreach ( $post_titles as $index => $title ) {
	$post_id = wp_insert_post(
		array(
			'post_title'   => $title,
			'post_status'  => 'publish',
			'post_type'    => 'post',
			'post_content' => 'E2E fixture content for Posts Feature tests.',
			'post_date'    => gmdate( 'Y-m-d H:i:s', strtotime( $dates[ $index ] ) ),
		),
		true
	);

	if ( is_wp_error( $post_id ) ) {
		echo wp_json_encode( array( 'error' => $post_id->get_error_message() ) );
		exit( 1 );
	}

	wp_set_post_terms( $post_id, array( $category_id ), 'category' );
	update_field( 'summary', "Summary for {$title}.", $post_id );
	update_field( 'featured_media_type', 'image_horizontal', $post_id );
	update_field( 'featured_image_horizontal', $attachment_id, $post_id );

	$post_ids[ $title ] = (int) $post_id;
}

// Keep the default post behind every seeded post so blog index order does not drift as the container ages.
$hello_world = e2e_get_post_by_title( 'Hello world!', 'post' );
if ( $hello_world ) {
	wp_update_post(
		array(
			'ID'            => $hello_world->ID,
			'post_date'     => '2020-01-15 12:00:00',
			'post_date_gmt' => '2020-01-15 12:00:00',
		)
	);
}

echo wp_json_encode(
	array(
		'categoryId'       => $category_id,
		'categoryName'     => $category_name,
		'featuredPostId'   => $post_ids['E2E Featured Post'],
		'featuredPostTitle' => 'E2E Featured Post',
		'listPostTitles'   => array(
			'E2E List Post 1',
			'E2E List Post 2',
			'E2E List Post 4',
		),
		'listPostIds'      => array(
			$post_ids['E2E List Post 1'],
			$post_ids['E2E List Post 2'],
			$post_ids['E2E List Post 4'],
		),
	)
);
