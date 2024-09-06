<?php
namespace BcSitkaSpruce\Controllers;

class Department {

	public static function get_single_post( $id ) {
		if ( ! $id ) {
			return;
		}

		$post = get_post( $id );

		if ( ! $post ) {
			return;
		}

		$output =  [
			'dept_title' => esc_html( get_the_title( $id ) ),
			'dept_url' => esc_url( get_the_permalink( $id ) ),
			'dept_summary' => wp_kses_post( get_field( 'summary', $id ) ),
			'dept_image' => get_field( 'image', $id ) ? wp_get_attachment_image(
				get_field( 'image', $id )['id'],
				'660x500',
				false,
				array(
					'class' => 'img-fluid rounded',
				)
			) : null,
			'dept_services' => get_field( 'services_resources', $id ) ? array_map( function( $service ) {
				return $service['service_resource'];
			}, get_field( 'services_resources', $id ) ) : [],

		];

		return $output;
	}

	/**
	 * Get Posts in the News CPT that belong to selected Type terms
	 *
	 * @param array $types An array of type IDs
	 * @return array An array of posts
	 */

	public static function get_post_from_core( $id, $site_id = null ) {
		$story;
		$site_id = $site_id ?? get_main_site_id();

		// Get Story from Core Site
		switch_to_blog( $site_id );
			$story = self::get_single_post( id: $id );
		restore_current_blog();

		return $story;
	}

}
