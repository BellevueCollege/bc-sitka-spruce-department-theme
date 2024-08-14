<?php
use Timber\Timber;

$context = Timber::context();

// Area for Title & Description
$context['title'] = get_field('title');
$context['description'] = get_field('description');

// holds data from profiles
$profiles_data = [];

// for loop, loops through each profile
foreach (get_field('profiles') as $profile) {

    // defining variables
    $profile_data = [];

    // for loop, loops through each field in each profile
    $profile_data['first_name'] = get_field('first_name', $profile->ID);
    $profile_data['last_name'] = get_field('last_name', $profile->ID);
    $profile_data['position'] = get_field('position_role', $profile->ID);
    $profile_data['email'] = get_field('email', $profile->ID);
    $profile_data['phone'] = get_field('phone_number', $profile->ID);

    // getting data specifically for contact item
    $schedule_data = get_field('scheduling_section', $profile->ID);

   // going into contact item data to grab nested data
    $profile_data['scheduling_link'] = $schedule_data['schedule_appointment_link']['url'] ?? null;
    $profile_data['scheduling_text'] = $schedule_data['schedule_appointment_link']['title'] ?? null;
    
    $profiles_data[] = $profile_data;
} // END OF FOR LOOP

// copying data from profiles to context
$context['profiles'] = $profiles_data;

// Showing message if use does not input any contacts (in preview, on editor side)
if ( $is_preview && ! $context['profiles'] ) {
	echo '<div class="callout-wrapper callout-disabled col"><p>';
	_e( 'YOU HAVE NOT ADDED ANY CONTACTS! <br />Edit this element to add some!', 'bc-sitka-spruce' );
	echo '</p></div>';
}

// Render Twig Template
Timber::render( '/stories/contact-item/contact-loop.twig', $context );