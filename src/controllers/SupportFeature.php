<?php
namespace BcSitkaSpruce\Controllers;

class SupportFeature {

	public static function get_posts( array $ids ) {
		if ( ! $ids || ! is_array( $ids ) || count( $ids ) < 1 ) {
			return;
		}

		return array_map( function( $post_id ) {
			return array(
				'title' => esc_html( get_the_title( $post_id ) ),
				'image' => get_field( 'image', $post_id ) ? wp_get_attachment_image(
					get_field( 'image', $post_id )['id'],
					'560x320',
					false,
					array( 'class' => 'img-fluid rounded' )
				) : null,
				'heading' => esc_html( get_field( 'heading', $post_id ) ),
				'content' => wp_kses_post( get_field( 'summary', $post_id ) ),
				'links' => get_field( 'links', $post_id ) ? array_map( function( $link ) {
					return array(
						'title' => esc_html( $link['link']['title'] ),
						'url' => esc_url( $link['link']['url'] ),
						'target' => esc_attr( $link['link']['target'] ),
					);
				}, get_field( 'links', $post_id ) ) : null,
			);
		}, $ids );

	}


	public static function get_posts_from_core( $ids, $site_id = null ) {
		$story;
		$site_id = $site_id ?? get_main_site_id();

		// Get Story from Core Site
		switch_to_blog( $site_id );
			$story = self::get_posts( ids: $ids );
		restore_current_blog();

		return $story;
	}


}
