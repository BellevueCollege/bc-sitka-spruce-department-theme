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
								'pronouns'       => esc_html( get_field( 'gender_pronouns', $profile->ID ) ?? '' ),
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

			// Fetch the profiles
			$profiles = get_posts( $args );

			// Format profiles for output
			$formatted_profiles = array();
			if ( $profiles ) {
				// 1. Build the array of profile data
				$formatted_profiles = array_map(
					function ( $profile_id ) {
						return array(
							'first_name'    => esc_html( get_field( 'first_name', $profile_id ) ?? '' ),
							'last_name'     => esc_html( get_field( 'last_name', $profile_id ) ?? '' ),
							'pronouns'      => esc_html( get_field( 'gender_pronouns', $profile_id ) ?? '' ),
							'position'      => esc_html( get_field( 'position_role', $profile_id ) ?? '' ),
							'profile_image' => get_field( 'profile_image', $profile_id ) ?
								wp_get_attachment_image( get_field( 'profile_image', $profile_id )['ID'], 'profile-list-image', false, array( 'class' => 'img-fluid rounded-top' ) )
								: '',
							'profile_url'   => esc_url( get_permalink( $profile_id ) ?? '' ),
							// Surface the pin value here for sorting (cast to int so it's strictly 1 or 0)
							'is_pinned'     => (int) get_field( 'pin_profile_in_listing', $profile_id ),
						);
					},
					$profiles
				);

				// 2. Sort the array (done in PHP since the query doesn't allow for multiple orderby clauses)
				usort( $formatted_profiles, function ( $a, $b ) {
					// Primary Sort: Pinned profiles first
					if ( $a['is_pinned'] !== $b['is_pinned'] ) {
						return $b['is_pinned'] - $a['is_pinned'];
					}

					// Secondary Sort: Alphabetical by last name (case-insensitive)
					return strcasecmp( $a['last_name'], $b['last_name'] );
				});
			}

			// 3. Return the final payload
			return array(
				'title'    => $section['section_title'] ?? '',
				'profiles' => ! empty( $formatted_profiles ) ? $formatted_profiles : null,
			);
		}
	},
	get_field( 'sections' )
) : null;

/**
 * If the editor sets an HTML Anchor, use it (sanitized). Otherwise, don't set an id at all.
 */
$explicit_anchor = isset( $block['anchor'] ) ? trim( (string) $block['anchor'] ) : '';
$context['anchor_id'] = $explicit_anchor !== '' ? sanitize_title( $explicit_anchor ) : null;

if ( $context['title'] ) {
	Timber::render( '/stories/profiles-section/profiles-section.twig', $context );
} else {
	echo '';
}

if ( $is_preview && ! $context['title'] ) {
	echo '<div class="card"><p>';
	_e( 'Select this element, then use the Settings sidebar to add content to this element so that it can display!', 'bc-sitka-spruce' );
	echo '</p></div>';
}
