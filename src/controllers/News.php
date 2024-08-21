<?php
namespace BcSitkaSpruce\Controllers;

class News {

	public static function get_single_post( $id ) {
		if ( ! $id ) {
			return;
		}

		$post = get_post( $id );

		if ( ! $post ) {
			return;
		}

		$output =  [
			'title' => get_the_title( get_the_title( $id ) ),
			'url' => get_the_permalink( $id ),
			'summary' => esc_url( esc_html( get_field( 'summary', $id ) ) ),
			'image' => get_field( 'image', $id ) ? wp_get_attachment_image(
				get_field( 'image', $id )['id'],
				'760x400',
			) : null,
		];

		return $output;
	}

	/**
	 * Get Posts in the News CPT that belong to selected Type terms
	 *
	 * @param array $types An array of type IDs
	 * @return array An array of posts
	 */

	public static function get_posts_by_type( $types, $exclude ) {

		// Get top 3 posts with the correct types, but not the excluded ones
		$args = array(
			'posts_per_page'   => 3,
			'post_type'        => 'news',
			'orderby'          => 'date',
			'order'            => 'DESC',
			'tax_query'        => array(
				array(
					'taxonomy' => 'news_type',
					'field'    => 'id',
					'terms'    => $types,
					'operator' => 'IN',
				),
			),
			'post__not_in'     => $exclude,
			'fields'           => 'ids',
		);
		$post_ids =  get_posts( $args );

		// Run the get_single_post function on each ID
		return array_map( function( $id ) {
			return self::get_single_post( $id );
		}, $post_ids );
	}

	public static function get_post_from_core( $id, $site_id = null ) {
		$story;
		$site_id = $site_id ?? get_main_site_id();

		// Get Story from Core Site
		switch_to_blog( $site_id );
			$story = self::get_single_post( id: $id );
		restore_current_blog();

		return $story;
	}

	public static function get_from_core_by_type( $types, $exclude, $site_id = null ) {
		$stories;
		$site_id = $site_id ?? get_main_site_id();

		// Get Story from Core Site
		switch_to_blog( $site_id );
			$stories = self::get_posts_by_type( types: $types, exclude: $exclude );
		restore_current_blog();

		return $stories;
	}

}
