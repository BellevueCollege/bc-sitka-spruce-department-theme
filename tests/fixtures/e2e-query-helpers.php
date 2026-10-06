<?php
/**
 * Shared WP_Query helpers for e2e seed scripts.
 *
 * @package BcSitkaSpruce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Find a post or page by exact title (replaces deprecated get_page_by_title).
 *
 * @param string $title     Post title.
 * @param string $post_type Post type slug.
 * @return WP_Post|null
 */
function e2e_get_post_by_title( string $title, string $post_type ) {
	$query = new WP_Query(
		array(
			'post_type'      => $post_type,
			'title'          => $title,
			'post_status'    => 'any',
			'posts_per_page' => 1,
			'no_found_rows'  => true,
		)
	);

	if ( ! empty( $query->posts ) ) {
		return $query->posts[0];
	}

	return null;
}
