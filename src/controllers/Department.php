<?php
namespace BcSitkaSpruce\Controllers;


class Department extends PostData {

	/**
	 * Get Single Department's data
	 *
	 * @param int $id The ID of the department
	 * @return array - An array of department data
	 */
	public static function get_single( $id ) {
		if ( ! $id ) {
			return;
		}

		$post = get_post( $id );
		if ( ! $post ) {
			return;
		}

		return array(
			'dept_title'    => esc_html( get_the_title( $id ) ),
			'dept_url'      => esc_url( get_field( 'url', $id ) ),
			'dept_summary'  => wp_kses_post( get_field( 'summary', $id ) ),
			'dept_image'    => get_field( 'image', $id ) ? wp_get_attachment_image(
				get_field( 'image', $id )['id'],
				'660x500',
				false,
				array(
					'class' => 'img-fluid rounded',
				)
			) : null,
			'dept_services' => get_field( 'services_resources', $id ) ? array_map(
				function ( $service ) {
					return $service['service_resource'];
				},
				get_field( 'services_resources', $id )
			) : array(),
		);
	}
}
