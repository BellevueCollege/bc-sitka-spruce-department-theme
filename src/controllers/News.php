<?php
namespace BcSitkaSpruce\Controllers;

class News extends PostData {

	public static function get_single( $id ) {
		if ( ! $id ) {
			return;
		}

		$post = get_post( $id );

		if ( ! $post ) {
			return;
		}

		$output = array(
			'title'   => esc_html( get_the_title( $id ) ),
			'url'     => esc_url( get_the_permalink( $id ) ),
			'summary' => wp_kses_post( get_field( 'summary', $id ) ),
			'image'   => get_field( 'image', $id ) ? wp_get_attachment_image(
				get_field( 'image', $id )['id'],
				'760x400',
			) : null,
		);

		return $output;
	}

	public static function get_stories_from_core_by_type( array $types, array $exclude ) {
		return static::get_from_core_by_taxonomy(
			post_type: 'news',
			taxonomy: 'news_type',
			terms: $types,
			exclude: $exclude,
			limit: 3
		);
	}
}
