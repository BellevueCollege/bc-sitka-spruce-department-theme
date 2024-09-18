<?php
namespace BcSitkaSpruce\Controllers;

class PostData {

	/**
	 * Get Single Post's data
	 *
	 * Get the data for a single post
	 *
	 * @param int $id The ID of the post
	 * @return array
	 */
	public static function get_single( int $id ) {
		if ( ! $id ) {
			return;
		}

		// Verify that the post exists
		$post = get_post( $id );
		if ( ! $post ) {
			return;
		}

		return $post;
	}

	/**
	 * Get Posts of a Specific Type/Taxonomy
	 *
	 * @param string $post_type - The post type slug
	 * @param string $taxonomy - The taxonomy slug
	 * @param array $terms - An array of term IDs
	 * @param array $exclude - An array of post IDs to exclude
	 * @param int $limit - The number of posts to return
	 * @return array An array of post IDs
	 */

	public static function get_by_taxonomy(
		string $post_type,
		string $taxonomy,
		array $terms,
		array $exclude,
		int $limit,
	) {

		// Get top 3 posts with the correct types, but not the excluded ones
		$args     = array(
			'posts_per_page' => $limit,
			'post_type'      => $post_type,
			'orderby'        => 'date',
			'order'          => 'DESC',
			'tax_query'      => array(
				array(
					'taxonomy' => $taxonomy,
					'field'    => 'id',
					'terms'    => $terms,
					'operator' => 'IN',
				),
			),
			'post__not_in'   => $exclude,
			'fields'         => 'ids',
		);
		$post_ids = get_posts( $args );

		// Run the get_single_post function on each ID
		return array_map(
			function ( $id ) {
				return static::get_single( $id );
			},
			$post_ids
		);
	}

	/**
	 * Get a single post from the core site.
	 *
	 * @param int $id The post ID to retrieve.
	 * @param int $site_id The site ID to retrieve from. Defaults to the current site ID.
	 * @return array The post data.
	 */
	public static function get_single_from_core( int $id, int|null $site_id = null ) {
		$post;
		$site_id = $site_id ?? get_main_site_id();

		// Get Story from Core Site
		switch_to_blog( $site_id );
			$post = static::get_single( id: $id );
		restore_current_blog();

		return $post;
	}


	/**
	 * Get posts from the core site that match the given post type/taxonomy,
	 * terms, and limit.
	 *
	 * @param string $post_type The post type to retrieve.
	 * @param string $taxonomy The taxonomy to retrieve posts from.
	 * @param array $terms The terms to retrieve posts for.
	 * @param array $exclude The IDs to exclude from the results.
	 * @param int $limit The maximum number of posts to retrieve.
	 * @param int $site_id The site ID to retrieve from. Defaults to the current site ID.
	 * @return array The post data.
	 */
	public static function get_from_core_by_taxonomy(
		string $post_type,
		string $taxonomy,
		array $terms,
		array $exclude,
		int $limit,
		int|null $site_id = null
	) {
		$posts;
		$site_id = $site_id ?? get_main_site_id();

		// Get Story from Core Site
		switch_to_blog( $site_id );
			$posts = static::get_by_taxonomy( $post_type, $taxonomy, $terms, $exclude, $limit );
		restore_current_blog();

		return $posts;
	}
}
