<?php

use Timber\Timber;
$context = Timber::context();

$context['title']       = esc_html( get_field( 'title' ) ?? '' );
$context['description'] = wp_kses_post( get_field( 'description' ) ?? '' );
$context['cta_button']  = get_field( 'cta_button' ) ?? '';

//individual profiles logic
$context['sections'] = get_field( 'sections' ) ? array_map(
	function ( $section ) {
		//logic for node select profiles
		if ( $section['section_type'] === 'node' ) {
				return array(
					'title'    => $section['section_title'] ?? '',
					'profiles' => $section['profiles'] ? array_map(
						function ( $profile ) {
							return array(
								//these are in CPT line 15 is in block- DELTE LATER
								'first_name'    => esc_html( get_field( 'first_name', $profile->ID ) ?? '' ),
								'last_name'     => esc_html( get_field( 'last_name', $profile->ID ) ?? '' ),
								'position'      => esc_html( get_field( 'position_role', $profile->ID ) ?? '' ),
								'profile_image' => is_array( get_field( 'profile_image', $profile->ID ) ) ?
									wp_get_attachment_image( get_field( 'profile_image', $profile->ID )['ID'], 'profile-list-image', false, array( 'class' => 'img-fluid rounded-top' ) )
									: '',
								'profile_url'   => esc_url( get_permalink( $profile ) ?? '' ),
							);
						},
						$section['profiles']
					) : null,
				);
		} else {
			// do stuff with query logic
			$dept     = $section['office_department'];
			$types    = $section['profile_types'];
			$args     = array(
				'post_type'      => 'profile',
				'posts_per_page' => -1,
				'fields'         => 'ids',
				'relation'       => 'AND',
				'tax_query'      => array(
					array(
						'taxonomy' => 'department',
						'field'    => 'ID',
						'terms'    => $dept,
						'operator' => 'IN',
					),
					array(
						'taxonomy' => 'profile_type',
						'field'    => 'ID',
						'terms'    => $types,
						'operator' => 'IN',
					),
				),
			);
			$profiles = get_posts( $args );
			return array(
				'title'    => $section['section_title'] ?? '',
				'profiles' => $profiles ? array_map(
					function ( $profile ) {
						return array(
							'first_name'    => esc_html( get_field( 'first_name', $profile ) ?? '' ),
							'last_name'     => esc_html( get_field( 'last_name', $profile ) ?? '' ),
							'position'      => esc_html( get_field( 'position_role', $profile ) ?? '' ),
							'profile_image' => get_field( 'profile_image', $profile )['ID'] ?
								wp_get_attachment_image( get_field( 'profile_image', $profile )['ID'], 'profile-list-image', false, array( 'class' => 'img-fluid rounded-top' ) )
								: '',
							'profile_url'   => esc_url( get_permalink( $profile ) ?? '' ),
						);
					},
					$profiles
				) : null,
			);
		}
	},
	get_field( 'sections' )
) : null;

if ( $context['title'] ) {
	Timber::render( '/stories/profiles-section/profiles-section.twig', $context );
} else {
	echo '';
}

if ( $is_preview && ! $context['title'] ) {
	echo '<div class="card"><p>';
	_e( 'Add content to this element so that it can display!', 'bc-sitka-spruce' );
	echo '</p></div>';
}
