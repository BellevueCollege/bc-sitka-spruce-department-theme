<?php
/**
 * Seed posts and categories for Posts Feature and blog template e2e tests.
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

const E2E_POSTS_PER_PAGE = 3;

$theme_slug             = 'bc-sitka-spruce-department-theme';
$horizontal_image_path  = WP_CONTENT_DIR . "/themes/{$theme_slug}/tests/fixtures/test-image-760x400.png";
$vertical_image_path    = WP_CONTENT_DIR . "/themes/{$theme_slug}/tests/fixtures/test-image-260x174.png";
$category_name          = 'E2E Posts Feature';
$secondary_category_name = 'E2E Blog Secondary';

// Required for register_blocks() to include posts-feature.
update_option( 'options_enable_posts', 1 );
update_option( 'posts_per_page', E2E_POSTS_PER_PAGE );

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

foreach ( array( $category_name, $secondary_category_name ) as $term_name ) {
	$existing_term = get_term_by( 'name', $term_name, 'category' );
	if ( $existing_term ) {
		wp_delete_term( $existing_term->term_id, 'category' );
	}
}

$term_result = wp_insert_term( $category_name, 'category' );
if ( is_wp_error( $term_result ) ) {
	echo wp_json_encode( array( 'error' => $term_result->get_error_message() ) );
	exit( 1 );
}

$secondary_term_result = wp_insert_term( $secondary_category_name, 'category' );
if ( is_wp_error( $secondary_term_result ) ) {
	echo wp_json_encode( array( 'error' => $secondary_term_result->get_error_message() ) );
	exit( 1 );
}

$category_id           = (int) $term_result['term_id'];
$secondary_category_id = (int) $secondary_term_result['term_id'];

/**
 * Import a theme fixture image as a media attachment.
 *
 * @param string $absolute_path Path to the image file.
 * @param string $alt_text      Attachment alt text.
 * @return int Attachment ID or 0 on failure.
 */
function e2e_seed_posts_import_fixture_image( string $absolute_path, string $alt_text ): int {
	if ( ! file_exists( $absolute_path ) ) {
		return 0;
	}

	$filename = basename( $absolute_path );
	$tmp_file = wp_tempnam( $filename );
	if ( ! $tmp_file || ! copy( $absolute_path, $tmp_file ) ) {
		return 0;
	}

	$file_array = array(
		'name'     => $filename,
		'tmp_name' => $tmp_file,
	);
	$attachment_id = media_handle_sideload( $file_array, 0 );
	@unlink( $tmp_file );

	if ( is_wp_error( $attachment_id ) || ! $attachment_id ) {
		return 0;
	}

	update_post_meta( $attachment_id, '_wp_attachment_image_alt', $alt_text );

	return (int) $attachment_id;
}

$horizontal_attachment_id = e2e_seed_posts_import_fixture_image(
	$horizontal_image_path,
	'E2E Posts Feature fixture image'
);
$vertical_attachment_id   = e2e_seed_posts_import_fixture_image(
	$vertical_image_path,
	'E2E Posts Feature vertical fixture image'
);

if ( $horizontal_attachment_id <= 0 ) {
	echo wp_json_encode( array( 'error' => 'Failed to import horizontal fixture image.' ) );
	exit( 1 );
}

$post_ids = array();
// Fixed dates keep blog index aria snapshots stable across CI runners and time zones.
$dates    = array(
	'2026-10-07 16:00:00', // E2E Featured Post
	'2026-10-07 19:00:00', // E2E List Post 1
	'2026-10-07 18:00:00', // E2E List Post 2
	'2026-10-07 19:30:00', // E2E List Post 3
	'2026-10-07 17:00:00', // E2E List Post 4
);

foreach ( $post_titles as $index => $title ) {
	$post_id = wp_insert_post(
		array(
			'post_title'    => $title,
			'post_status'   => 'publish',
			'post_type'     => 'post',
			'post_content'  => 'E2E fixture content for Posts Feature tests.',
			'post_date'     => $dates[ $index ],
			'post_date_gmt' => get_gmt_from_date( $dates[ $index ] ),
		),
		true
	);

	if ( is_wp_error( $post_id ) ) {
		echo wp_json_encode( array( 'error' => $post_id->get_error_message() ) );
		exit( 1 );
	}

	wp_set_post_terms( $post_id, array( $category_id ), 'category' );
	update_field( 'summary', "Summary for {$title}.", $post_id );

	$post_ids[ $title ] = (int) $post_id;
}

// Featured + list posts in the primary category (media variants for blog index coverage).
update_field( 'featured_media_type', 'image_horizontal', $post_ids['E2E Featured Post'] );
update_field( 'featured_image_horizontal', $horizontal_attachment_id, $post_ids['E2E Featured Post'] );

update_field( 'featured_media_type', 'image_horizontal', $post_ids['E2E List Post 1'] );
update_field( 'featured_image_horizontal', $horizontal_attachment_id, $post_ids['E2E List Post 1'] );

update_field( 'featured_media_type', 'image_vertical', $post_ids['E2E List Post 2'] );
if ( $vertical_attachment_id > 0 ) {
	update_field( 'featured_image_vertical', $vertical_attachment_id, $post_ids['E2E List Post 2'] );
}

update_field( 'featured_media_type', 'video', $post_ids['E2E List Post 3'] );
update_field( 'featured_image_horizontal', $horizontal_attachment_id, $post_ids['E2E List Post 3'] );
update_field( 'featured_video_url', 'https://www.youtube.com/watch?v=e2e-blog-video', $post_ids['E2E List Post 3'] );

update_field( 'featured_media_type', 'image_horizontal', $post_ids['E2E List Post 4'] );
wp_set_post_terms( $post_ids['E2E List Post 4'], array( $secondary_category_id ), 'category' );

// Keep the default post behind every seeded post so blog index order does not drift as the container ages.
$hello_world = e2e_get_post_by_title( 'Hello world!', 'post' );
if ( $hello_world ) {
	wp_update_post(
		array(
			'ID'            => $hello_world->ID,
			'post_content'  => 'Welcome to bc-sitka-spruce-department-theme Sites. This is your first post. Edit or delete it, then start writing!',
			'post_date'     => '2020-01-15 12:00:00',
			'post_date_gmt' => '2020-01-15 12:00:00',
		)
	);
}

flush_rewrite_rules( false );

echo wp_json_encode(
	array(
		'categoryId'            => $category_id,
		'categoryName'          => $category_name,
		'secondaryCategoryId'   => $secondary_category_id,
		'secondaryCategoryName' => $secondary_category_name,
		'postsPerPage'          => E2E_POSTS_PER_PAGE,
		'featuredPostId'        => $post_ids['E2E Featured Post'],
		'featuredPostTitle'     => 'E2E Featured Post',
		'listPostTitles'        => array(
			'E2E List Post 3',
			'E2E List Post 1',
			'E2E List Post 2',
		),
		'listPostIds'           => array(
			$post_ids['E2E List Post 3'],
			$post_ids['E2E List Post 1'],
			$post_ids['E2E List Post 2'],
		),
		'mediaVariantTitles'    => array(
			'vertical'     => 'E2E List Post 2',
			'video'        => 'E2E List Post 3',
			'missingImage' => 'E2E List Post 4',
		),
	)
);
