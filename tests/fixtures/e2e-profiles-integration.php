<?php
/**
 * Profile CPT and listing-page seeds for Playwright integration tests.
 *
 * Listing test contract (do not shrink this dataset):
 * - At least 12 profiles so OHO Views pagination (10 per page) appears.
 * - Exactly one pinned profile (Ada Lovelace). All others set pin to 0.
 * - Unpinned last names include two sharing the initial L (Larson, Liu) on page 1,
 *   plus other initials so letter bands are not a single-letter list.
 * - Mix of uploaded profile images and the default placeholder image.
 * - Profiles are spread across two departments and Administration, Faculty, and Staff.
 * - Page 1 includes an unpinned row with email, phone, and an appointment link (Pat Alvarez)
 *   and an unpinned row without those fields (Marie Curie). Ada stays the only pinned profile.
 *
 * @package BcSitkaSpruce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Minimum published profiles required for listing pagination to render.
 */
const E2E_PROFILE_LISTING_MINIMUM_COUNT = 12;

/**
 * @param int   $post_id   Profile post ID.
 * @param array $overrides Field overrides keyed by ACF name.
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
 * Seed the listing-card contact fields (email, phone, pronouns, appointment link).
 *
 * @param int                  $post_id Profile post ID.
 * @param array<string, mixed> $contact  email, phone_number, appointment_label, appointment_url.
 */
function e2e_seed_profile_listing_contact( int $post_id, array $contact ): void {
	if ( ! function_exists( 'update_field' ) || $post_id <= 0 ) {
		return;
	}

	update_field( 'email', (string) ( $contact['email'] ?? '' ), $post_id );
	update_field( 'phone_number', (string) ( $contact['phone_number'] ?? '' ), $post_id );
	update_field( 'gender_pronouns', (string) ( $contact['gender_pronouns'] ?? '' ), $post_id );
	update_field(
		'scheduling_section',
		array(
			array(
				'scheduling_section_title'       => 'Schedule an Appointment',
				'scheduling_section_description' => 'E2E scheduling section description.',
				'schedule_appointment_link'      => array(
					'title' => (string) ( $contact['appointment_label'] ?? 'Schedule an Appointment' ),
					'url'   => (string) ( $contact['appointment_url'] ?? 'https://example.com/e2e-appointment' ),
				),
			),
		),
		$post_id
	);
}

/**
 * Declarative listing fixtures.
 *
 * Last names are ordered so Larson and Liu both fall on page 1 after the pinned
 * row (nine unpinned slots). Names that sort before L are limited to seven.
 *
 * @return array<int, array<string, mixed>>
 */
function e2e_get_profile_listing_fixtures(): array {
	return array(
		array(
			'post_title'                 => 'E2E Profile Ada Lovelace',
			'first_name'                 => 'Ada',
			'last_name'                  => 'Lovelace',
			'position_role'              => 'E2E Faculty',
			'department'                 => 'primary',
			'profile_type'               => 'faculty',
			'is_pinned'                  => true,
			'has_image'                  => true,
			'include_full_demographics'  => true,
			'include_pattern_content'    => true,
		),
		array(
			'post_title'    => 'E2E Profile Grace Hopper',
			'first_name'    => 'Grace',
			'last_name'     => 'Hopper',
			'position_role' => 'E2E Faculty',
			'department'    => 'primary',
			'profile_type'  => 'faculty',
			'is_pinned'     => false,
			'has_image'     => false,
		),
		array(
			'post_title'    => 'E2E Profile Marie Curie',
			'first_name'    => 'Marie',
			'last_name'     => 'Curie',
			'position_role' => 'E2E Faculty',
			'department'    => 'secondary',
			'profile_type'  => 'faculty',
			'is_pinned'     => false,
			'has_image'     => false,
		),
		array(
			'post_title'               => 'E2E Profile Pat Alvarez',
			'first_name'               => 'Pat',
			'last_name'                => 'Alvarez',
			'position_role'            => 'E2E Administrator',
			'department'               => 'primary',
			'profile_type'             => 'administration',
			'is_pinned'                => false,
			'has_image'                => true,
			'include_contact_details'  => true,
			'email'                    => 'pat.alvarez@example.com',
			'phone_number'             => '425-564-0102',
			'gender_pronouns'          => 'they/them',
			'appointment_label'        => 'Book with Pat',
			'appointment_url'          => 'https://example.com/e2e-pat-appointment',
		),
		array(
			'post_title'    => 'E2E Profile Riley Diaz',
			'first_name'    => 'Riley',
			'last_name'     => 'Diaz',
			'position_role' => 'E2E Staff',
			'department'    => 'primary',
			'profile_type'  => 'staff',
			'is_pinned'     => false,
			'has_image'     => false,
		),
		array(
			'post_title'    => 'E2E Profile Casey Evans',
			'first_name'    => 'Casey',
			'last_name'     => 'Evans',
			'position_role' => 'E2E Administrator',
			'department'    => 'secondary',
			'profile_type'  => 'administration',
			'is_pinned'     => false,
			'has_image'     => false,
		),
		array(
			'post_title'    => 'E2E Profile Quinn Foster',
			'first_name'    => 'Quinn',
			'last_name'     => 'Foster',
			'position_role' => 'E2E Staff',
			'department'    => 'primary',
			'profile_type'  => 'staff',
			'is_pinned'     => false,
			'has_image'     => false,
		),
		array(
			'post_title'    => 'E2E Profile Avery Garcia',
			'first_name'    => 'Avery',
			'last_name'     => 'Garcia',
			'position_role' => 'E2E Faculty',
			'department'    => 'secondary',
			'profile_type'  => 'faculty',
			'is_pinned'     => false,
			'has_image'     => true,
		),
		array(
			'post_title'    => 'E2E Profile Sam Larson',
			'first_name'    => 'Sam',
			'last_name'     => 'Larson',
			'position_role' => 'E2E Staff',
			'department'    => 'secondary',
			'profile_type'  => 'staff',
			'is_pinned'     => false,
			'has_image'     => false,
		),
		array(
			'post_title'    => 'E2E Profile Mei Liu',
			'first_name'    => 'Mei',
			'last_name'     => 'Liu',
			'position_role' => 'E2E Administrator',
			'department'    => 'primary',
			'profile_type'  => 'administration',
			'is_pinned'     => false,
			'has_image'     => false,
		),
		array(
			'post_title'    => 'E2E Profile No Photo',
			'first_name'    => 'E2E',
			'last_name'     => 'No Photo',
			'position_role' => 'E2E Staff',
			'department'    => 'secondary',
			'profile_type'  => 'staff',
			'is_pinned'     => false,
			'has_image'     => false,
		),
		array(
			'post_title'    => 'E2E Profile Jordan Okonkwo',
			'first_name'    => 'Jordan',
			'last_name'     => 'Okonkwo',
			'position_role' => 'E2E Faculty',
			'department'    => 'primary',
			'profile_type'  => 'faculty',
			'is_pinned'     => false,
			'has_image'     => false,
		),
	);
}

/**
 * Create or replace one listing profile and apply taxonomy, pin, and image fields.
 *
 * @param array<string, mixed>              $fixture            Fixture row from e2e_get_profile_listing_fixtures().
 * @param array{departments: array<string, int>, profile_types: array<string, int>} $term_ids Term IDs keyed by fixture slug.
 * @param int                               $profile_image_id   Attachment ID used when has_image is true.
 * @param string                            $post_content       Post content markup.
 * @return int Profile post ID.
 */
function e2e_upsert_listing_profile(
	array $fixture,
	array $term_ids,
	int $profile_image_id,
	string $post_content
): int {
	$department_key   = (string) $fixture['department'];
	$profile_type_key = (string) $fixture['profile_type'];
	$department_id    = (int) ( $term_ids['departments'][ $department_key ] ?? 0 );
	$profile_type_id  = (int) ( $term_ids['profile_types'][ $profile_type_key ] ?? 0 );

	$post_id = e2e_upsert_post(
		(string) $fixture['post_title'],
		'profile',
		array( 'post_content' => $post_content )
	);

	if ( $department_id > 0 ) {
		wp_set_object_terms( $post_id, array( $department_id ), 'department' );
	}

	if ( $profile_type_id > 0 ) {
		wp_set_object_terms( $post_id, array( $profile_type_id ), 'profile_type' );
	}

	if ( ! function_exists( 'update_field' ) ) {
		return $post_id;
	}

	update_field( 'first_name', $fixture['first_name'], $post_id );
	update_field( 'last_name', $fixture['last_name'], $post_id );
	update_field( 'position_role', $fixture['position_role'], $post_id );
	update_field( 'dept_office', array( $department_id ), $post_id );
	update_field( 'dept-office', array( $department_id ), $post_id );
	update_field( 'profile_type', array( $profile_type_id ), $post_id );
	update_field( 'pin_profile_in_listing', ! empty( $fixture['is_pinned'] ) ? 1 : 0, $post_id );

	if ( ! empty( $fixture['has_image'] ) && $profile_image_id > 0 ) {
		update_field( 'profile_image', $profile_image_id, $post_id );
	}

	if ( ! empty( $fixture['include_contact_details'] ) ) {
		e2e_seed_profile_listing_contact( $post_id, $fixture );
	}

	if ( empty( $fixture['include_full_demographics'] ) ) {
		return $post_id;
	}

	e2e_seed_profile_demographics(
		$post_id,
		array(
			'email'           => 'ada.lovelace@example.com',
			'gender_pronouns' => 'she/her',
			'dept-office'     => array( $department_id ),
			'dept_office'     => array( $department_id ),
		)
	);

	return $post_id;
}

/**
 * @param array<string, int> $department_term_ids   Keys: primary, secondary.
 * @param array<string, int> $profile_type_term_ids Keys: administration, faculty, staff.
 * @param int                $profile_image_id      Attachment ID for profiles that include an image.
 * @return array{
 *   profileUrl: string,
 *   profileNoPhotoUrl: string,
 *   profileIds: int[],
 *   listingPageId: int,
 *   profilesBlockPageUrl: string
 * }
 */
function e2e_seed_profile_integration_pages(
	array $department_term_ids,
	array $profile_type_term_ids,
	int $profile_image_id
): array {
	$fixtures = e2e_get_profile_listing_fixtures();
	if ( count( $fixtures ) < E2E_PROFILE_LISTING_MINIMUM_COUNT ) {
		echo wp_json_encode(
			array(
				'error' => 'Profile listing fixtures must include at least ' . E2E_PROFILE_LISTING_MINIMUM_COUNT . ' profiles.',
			)
		);
		exit( 1 );
	}

	$term_ids = array(
		'departments'   => $department_term_ids,
		'profile_types' => $profile_type_term_ids,
	);

	$pattern_content = e2e_load_pattern_markup( 'profile-content-v0.php' );
	$pattern_content = e2e_wire_core_site_blocks_in_content(
		$pattern_content,
		e2e_get_core_seed_map()
	);

	// Drop stray profile CPT rows so listing totals match the fixture list.
	e2e_delete_all_posts_of_type( 'profile' );

	$profile_ids_by_title = array();

	foreach ( $fixtures as $fixture ) {
		$post_content = ! empty( $fixture['include_pattern_content'] ) ? $pattern_content : '';
		$profile_id   = e2e_upsert_listing_profile(
			$fixture,
			$term_ids,
			$profile_image_id,
			$post_content
		);
		$profile_ids_by_title[ $fixture['post_title'] ] = $profile_id;
	}

	$ada_id      = (int) $profile_ids_by_title['E2E Profile Ada Lovelace'];
	$no_photo_id = (int) $profile_ids_by_title['E2E Profile No Photo'];
	$grace_id    = (int) $profile_ids_by_title['E2E Profile Grace Hopper'];
	$curie_id    = (int) $profile_ids_by_title['E2E Profile Marie Curie'];

	$profile_ids = array( $ada_id, $grace_id, $curie_id );
	foreach ( $profile_ids_by_title as $profile_id ) {
		if ( ! in_array( $profile_id, $profile_ids, true ) ) {
			$profile_ids[] = $profile_id;
		}
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
