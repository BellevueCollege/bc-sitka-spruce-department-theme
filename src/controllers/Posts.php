<?php
namespace BcSitkaSpruce\Controllers;

class Posts extends PostData {

	public static function get_single( $id ) {
		if ( ! $id ) {
			return;
		}

		if ( false === get_post_status( $id ) ) {
			return;
		}

		$image_type       = get_field( 'featured_media_type', $id );

		if ( $image_type === 'image_horizontal' || $image_type === 'video' ) {
			$featured_image = get_field( 'featured_image_horizontal', $id );
			$featured_image_orientation = 'horizontal';
			$featured_image_size = 'post-horiz-lg';
		} else {
			$featured_image = get_field( 'featured_image_vertical', $id );
			$featured_image_orientation = 'vertical';
			$featured_image_size = 'post-vert-lg';
		}

		if ( $featured_image ) {
			$featured_image_output = wp_get_attachment_image(
				$featured_image['id'],
				$featured_image_size,
			);
		} else {
			$featured_image_output = '';
		}

		if ( get_field( 'summary', $id ) ) {
			$summary = get_field( 'summary', $id );
		} else {
			$summary = get_the_excerpt( $id );
		}

		$output = array(
			'title'   => esc_html( get_the_title( $id ) ),
			'url'     => esc_url( get_the_permalink( $id ) ),
			'summary' => $summary,
			'image'   => $featured_image_output,
			'image_orientation' => $featured_image_orientation ?? null,
		);

		return $output;
	}

	public static function get_by_category(
		array $terms,
		array $exclude,
		int $limit,
	) {

		// Get top 3 posts with the correct types, but not the excluded ones
		$args     = array(
			'posts_per_page' => $limit,
			'post_type'      => 'post',
			'orderby'        => 'date',
			'order'          => 'DESC',
			'category__in'   => $terms,
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
}
