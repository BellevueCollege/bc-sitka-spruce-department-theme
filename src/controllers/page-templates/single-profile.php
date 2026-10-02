<?php
use Timber\Timber;
use BcSitkaSpruce\Library\Theme;

$context         = Timber::context();
$context['post'] = Timber::get_post();

//mapping fields
$context ['pin']             = get_field( 'pin_profile_in_listing' ) ? true : false; //note, while this is not used on overview, there is direct connection from overview to list (vice versa)
$context ['first_name']      = esc_html( get_field( 'first_name' ) ?? '' );
$context ['last_name']       = esc_html( get_field( 'last_name' ) ?? '' );
$context ['gender_pronouns'] = esc_html( get_field( 'gender_pronouns' ) ?? '' );
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
$schedule_data = get_field('scheduling_section');

if ( is_array($schedule_data) && !empty($schedule_data) ) {
    $first_row = $schedule_data[0];

    //map title & description
    $context['title']       = esc_html($first_row['scheduling_section_title'] ?? '');
    $context['description'] = wp_kses_post($first_row['scheduling_section_description'] ?? '');

    // Check first appointment link
    if (!empty($first_row['schedule_appointment_link'])) {
        $buttons[] = $first_row['schedule_appointment_link'];
    }
    // Check for second appointment link
    if (!empty($first_row['sched_appt_link'])) {
        $buttons[] = $first_row['sched_appt_link'];
    }

    $context['buttons'] = $buttons; //matching 'buttons' in twig
}
//bread crumb trail stuff
$breadcrumb_parent = get_field( 'profile_parent', 'options' ) ?? null;
if ( $breadcrumb_parent ) {
	$context['breadcrumbs']      = array(
		'<a href="' . get_the_permalink( $breadcrumb_parent ) . '">' . get_the_title( $breadcrumb_parent ) . '</a>',
		$context ['first_name'] . ' ' . $context ['last_name'],
	);
}
// uses WP command to grab profile image @ correct size
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
