<?php
namespace BcSitkaSpruce\Controllers;


class Program extends PostData {

	/**
	 * Get Single Department's data
	 *
	 * @param string $title The title of the program
	 * @return array - An array of program data
	 */
	public static function get_single_by_title( string $title ) {
		if ( ! $title ) {
			return;
		}

		// Get posts from Program CPT where the title matches input
		$post = get_posts(
			array(
				'post_type' => 'program',
				'title'     => $title,
				'post_status' => 'publish',
				'numberposts' => 1,
			)
		) ?? array();

		// Verify that the post exists
		if ( ! is_array( $post ) || ! array_key_exists( 0, $post ) ) {
			return;
		}

		// Remove unneeded array from variable
		$post = $post[0];

		$pathways = get_field( 'pathways', $post->ID ) ? array_map( function ( $pathway ) {
			return array(
				'id'    => $pathway->ID,
				'title' => $pathway->post_title,
				'url'   => get_permalink( $pathway->ID ),
			);
		}, get_field( 'pathways', $post->ID )) : array();

		return array(
			'short_name'    => get_field( 'short_name', $post->ID ),
			'overview'      => get_field( 'overview', $post->ID ),
			'type'          => get_field( 'type', $post->ID )->name,
			'degree'        => get_field( 'degree', $post->ID )->name,
			'duration'      => get_field( 'duration', $post->ID ),
			'prerequisite'  => get_field( 'prerequisite', $post->ID ),
			'pathway_names' => array_map( function ( $pathway ) {
				return $pathway['title'];
			}, $pathways ),
			'pathways'      => $pathways,
			'focus_areas'   => get_field( 'focus_areas', $post->ID ) ? array_map( function ( $focus_area ) use ( $pathways ) {
				return array(
					'id'    => $focus_area->ID,
					'title' => $focus_area->post_title,
					'url'   => 1 === count( $pathways ) ? esc_url( $pathways[0]['url'] . '#' . $focus_area->post_name . '-tab-open' ) :  false,
				);
			}, get_field( 'focus_areas', $post->ID )) : array(),
		);
	}

	/**
	 * Get a single post from the core site by title
	 *
	 * @param string $title Title of the post to retrieve
	 * @param int $site_id The site ID to retrieve from. Defaults to the current site ID.
	 * @return array The post data.
	 */
	public static function get_single_from_core_by_title( string $title, int|null $site_id = null ) {
		$post;
		$site_id = $site_id ?? get_main_site_id();

		// Get Story from Core Site
		switch_to_blog( $site_id );
			$post = static::get_single_by_title( title: $title );
		restore_current_blog();

		return $post;
	}
}
