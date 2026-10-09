<?php
/**
 * Profile CPT and listing-page seeds for Playwright integration tests.
 *
 * @package BcSitkaSpruce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @param int   $post_id     Profile post ID.
 * @param array $overrides   Field overrides keyed by ACF name.
 */
function e2e_seed_profile_demographics( int $post_id, array $overrides = array() ): void {
	if ( ! function_exists( 'update_field' ) || $post_id <= 0 ) {
		return;
	}

	$defaults = array(
		'email'              => 'e2e.profile@example.com',
		'phone_number'       => '425-564-0001',
		'languages_spoken'   => 'English, French',
		'office_location'    => 'E2E Office Building, Room 101',
		'office_hours'       => 'Monday–Friday, 9:00 a.m.–5:00 p.m.',
		'gender_pronouns'    => 'she/her',
		// single-profile.php reads get_field( 'dept-office' ); ACF name is also seeded below.
		'dept-office'        => array(),
		'linkedin'           => array(
			'title' => 'LinkedIn',
			'url'   => 'https://example.com/e2e-linkedin',
		),
		'additional_url'     => array(
			'title' => 'E2E Faculty Page',
			'url'   => 'https://example.com/e2e-faculty',
		),
		'scheduling_section' => array(
			array(
				'scheduling_section_title'       => 'Schedule an Appointment',
				'scheduling_section_description' => 'E2E scheduling section description.',
				'schedule_appointment_link'      => array(
					'title' => 'Book E2E Appointment',
					'url'   => 'https://example.com/e2e-appointment',
				),
			),
		),
	);

	$fields = array_merge( $defaults, $overrides );

	foreach ( $fields as $field_name => $value ) {
		update_field( $field_name, $value, $post_id );
	}
}

/**
 * @param int $department_term_id Department taxonomy term ID.
 * @param int $profile_type_id    Profile type term ID.
 * @param int $profile_image_id   Attachment ID for Ada (0 to skip).
 * @return array{
 *   profileUrl: string,
 *   profileNoPhotoUrl: string,
 *   profileIds: int[],
 *   listingPageId: int,
 *   profilesBlockPageUrl: string
 * }
 */
function e2e_seed_profile_integration_pages(
	int $department_term_id,
	int $profile_type_id,
	int $profile_image_id
): array {
	$profile_department_id = $department_term_id;
	$profile_type_term_id  = $profile_type_id;

	// Drop stray profile CPT rows so listing totals match the four seeded fixtures.
	e2e_delete_all_posts_of_type( 'profile' );

	$profile_content = e2e_load_pattern_markup( 'profile-content-v0.php' );
	$profile_content = e2e_wire_core_site_blocks_in_content(
		$profile_content,
		e2e_get_core_seed_map()
	);

	$ada_id = e2e_upsert_post(
		'E2E Profile Ada Lovelace',
		'profile',
		array( 'post_content' => $profile_content )
	);

	$no_photo_id = e2e_upsert_post(
		'E2E Profile No Photo',
		'profile',
		array( 'post_content' => '' )
	);

	$grace_id = e2e_upsert_post(
		'E2E Profile Grace Hopper',
		'profile',
		array( 'post_content' => '' )
	);

	$curie_id = e2e_upsert_post(
		'E2E Profile Marie Curie',
		'profile',
		array( 'post_content' => '' )
	);

	$profile_ids = array( $ada_id, $grace_id, $curie_id, $no_photo_id );

	foreach ( $profile_ids as $profile_id ) {
		wp_set_object_terms( $profile_id, array( $profile_department_id ), 'department' );
		wp_set_object_terms( $profile_id, array( $profile_type_term_id ), 'profile_type' );
		if ( function_exists( 'update_field' ) ) {
			update_field( 'dept_office', array( $profile_department_id ), $profile_id );
			update_field( 'dept-office', array( $profile_department_id ), $profile_id );
			update_field( 'profile_type', array( $profile_type_term_id ), $profile_id );
		}
	}

	if ( function_exists( 'update_field' ) ) {
		update_field( 'first_name', 'Ada', $ada_id );
		update_field( 'last_name', 'Lovelace', $ada_id );
		update_field( 'position_role', 'E2E Faculty', $ada_id );
		if ( $profile_image_id > 0 ) {
			update_field( 'profile_image', $profile_image_id, $ada_id );
		}
		e2e_seed_profile_demographics(
			$ada_id,
			array(
				'email'           => 'ada.lovelace@example.com',
				'gender_pronouns' => 'she/her',
				'dept-office'     => array( $profile_department_id ),
				'dept_office'     => array( $profile_department_id ),
			)
		);
		update_field( 'pin_profile_in_listing', 1, $ada_id );

		update_field( 'first_name', 'E2E', $no_photo_id );
		update_field( 'last_name', 'No Photo', $no_photo_id );
		update_field( 'position_role', 'E2E Staff', $no_photo_id );

		update_field( 'first_name', 'Grace', $grace_id );
		update_field( 'last_name', 'Hopper', $grace_id );
		update_field( 'position_role', 'E2E Faculty', $grace_id );

		update_field( 'first_name', 'Marie', $curie_id );
		update_field( 'last_name', 'Curie', $curie_id );
		update_field( 'position_role', 'E2E Faculty', $curie_id );
	}

	$listing_page_id = e2e_upsert_post(
		'E2E Profile Listing',
		'page',
		array(
			'post_content' => '<!-- wp:paragraph --><p>E2E profile listing intro paragraph.</p><!-- /wp:paragraph -->',
		)
	);
	update_post_meta( $listing_page_id, '_wp_page_template', 'template--profile-listing.php' );

	if ( function_exists( 'update_field' ) ) {
		update_field( 'profile_parent', $listing_page_id, 'option' );
	}

	$profiles_block_content = e2e_strip_editor_setup_alert(
		e2e_load_pattern_markup( 'page-flexible-directory-v0.php' )
	);
	$profiles_block_content = e2e_wire_profiles_sections_node_select( $profiles_block_content, $ada_id );

	$profiles_block_page_id = e2e_upsert_post(
		'E2E Profiles Block',
		'page',
		array( 'post_content' => $profiles_block_content )
	);
	update_post_meta( $profiles_block_page_id, '_wp_page_template', 'template--no-sidebar.php' );

	return array(
		'profileUrl'           => (string) get_permalink( $ada_id ),
		'profileNoPhotoUrl'    => (string) get_permalink( $no_photo_id ),
		'profileIds'           => array_map( 'intval', $profile_ids ),
		'listingPageId'        => (int) $listing_page_id,
		'profilesBlockPageUrl' => (string) get_permalink( $profiles_block_page_id ),
	);
}
