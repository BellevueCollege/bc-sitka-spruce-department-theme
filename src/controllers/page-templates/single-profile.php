<?php
use Timber\Timber;
use BcSitkaSpruce\Library\Theme;

$context         = Timber::context();
$context['post'] = Timber::get_post();

//mapping fields
$context ['pin']             = get_field( 'pin_profile_in_listing' ) ? true : false; //note, while this is not used on overview, there is direct connection from overview to list (vice versa)
$context ['first_name']      = esc_html( get_field( 'first_name' ) ?? '' );
$context ['last_name']       = esc_html( get_field( 'last_name' ) ?? '' );
$context ['position']        = esc_html( get_field( 'position_role' ) ?? '' );
$context ['department']      = get_field( 'dept-office' ) ?? array(); //get field matches the ACF field name (field)!
$context ['email']           = esc_html( get_field( 'email' ) ?? '' );
$context ['phone']           = esc_html( get_field( 'phone_number' ) ?? '' );
$context ['languages']       = esc_html( get_field( 'languages_spoken' ) ?? '' );
$context ['office_location'] = wp_kses_post( get_field( 'office_location' ) ?? '' );
$context ['office_hours']    = wp_kses_post( get_field( 'office_hours' ) ?? '' );
$context ['linkedin']        = get_field( 'linkedin' );
$context ['additional_url']  = get_field( 'additional_url' );
// Below is for grabbing fields for scheduled appointments


if ( is_array( get_field( 'scheduling_section' ) ) && array_key_exists( 0, get_field( 'scheduling_section' ) ) ) {
	$context ['title']       = esc_html( get_field( 'scheduling_section' )[0]['scheduling_section_title'] ?? '' );
	$context ['description'] = wp_kses_post( get_field( 'scheduling_section' )[0]['scheduling_section_description'] ?? '' );
	$context ['button']      = get_field( 'scheduling_section' )[0]['schedule_appointment_link'];
}


$breadcrumb_parent = get_field( 'profile_parent', 'options' ) ?? null;
if ( $breadcrumb_parent ) {
	$context['breadcrumbs']      = array(
		'<a href="' . get_the_permalink( $breadcrumb_parent ) . '">' . get_the_title( $breadcrumb_parent ) . '</a>',
		$context ['first_name'] . ' ' . $context ['last_name'],
	);
}
// uses WP command to grab photo @ correct size
$context['profile_image'] = get_field( 'profile_image' ) ? wp_get_attachment_image(
	get_field( 'profile_image' )['ID'],
	'profile-overview-image',
	false,
	array(
		'class' => 'img-fluid rounded',
	)
) : null;

///needs to be last so everything before this line is rendered
Timber::render( 'content/single-profile.twig', $context );
