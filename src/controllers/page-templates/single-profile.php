<?php
use Timber\Timber;

$context                   = Timber::context();
$context['post']           = Timber::get_post();

//mapping fields
$context ['pin'] = get_field('pin_profile_in_listing'); //note, while this is not used on overview, there is direct connection from overview to list (vice versa)
$context ['first_name'] = get_field('first_name');
$context ['last_name'] = get_field('last_name');
$context ['position'] = get_field('position_role');
$context ['department'] = get_field('dept-office'); //get field matches the ACF field name (field)!
$context ['email'] = get_field('email');
$context ['phone'] = get_field('phone_number');
$context ['languages'] = get_field('languages_spoken');
$context ['office_location'] = get_field('office_location');
$context ['office_hours'] = get_field('office_hours');
$context ['linkedin'] = get_field('linkedin');
$context ['additional_url'] = get_field('additional_url');
// Below is for grabbing fields for scheduled appointments
$context ['title'] = get_field('scheduling_section')['scheduling_section_title'];
$context ['description'] = get_field('scheduling_section')['scheduling_section_description'];
$context ['button'] = get_field('scheduling_section')['schedule_appointment_link'];

// uses WP command to grab photo @ correct size
$context['profile_image'] = wp_get_attachment_image(
  get_field('profile_image')['ID'],
  'profile-overview-image',
  false,
  array(
    'class' => 'img-fluid rounded',
  )
);

///needs to be last so everything before this line is rendered
Timber::render( 'content/single-profile.twig', $context );
