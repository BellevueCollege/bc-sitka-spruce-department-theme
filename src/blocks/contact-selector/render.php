<?php
use Timber\Timber;
use function Symfony\Component\VarDumper\Dumper\esc;

$context = Timber::context();

$context['title'] = esc_html (get_field('title') ?? '');
$context['description'] = wp_kses_post(get_field('description') ?? '');

// holds data from profiles
$profiles_data = array();

// for loop, loops through each profile
if (is_array(get_field('profiles'))) {
    foreach ((get_field('profiles')) as $profile) {
        // defining profile data
        $profile_data = array();

        // fetch each individual field for each profile
        $profile_data['first_name'] = esc_html(get_field('first_name', $profile->ID) ?? '');
        $profile_data['last_name'] = esc_html(get_field('last_name', $profile->ID) ?? '');
        $profile_data['position'] = esc_html(get_field('position_role', $profile->ID) ?? '');
        $profile_data['email'] = esc_html(get_field('email', $profile->ID) ?? '');
        $profile_data['phone'] = esc_html(get_field('phone_number', $profile->ID) ?? '');


        // Initialize an array to hold multiple links
        $profile_data['scheduling_links'] = array();

        // Get the repeater data from the profile post
        $schedule_data = get_field('scheduling_section', $profile->ID);

        // (Hard coded on purpose!) Check the first row of two specific fields
        if (is_array($schedule_data) && !empty($schedule_data)) {
            $section = $schedule_data[0]; // Get the first row

            // Check for the first link field
            if (!empty($section['schedule_appointment_link'])) {
                $profile_data['scheduling_links'][] = $section['schedule_appointment_link'];
            }
            
            // Check for the second link field
            if (!empty($section['sched_appt_link'])) {
                $profile_data['scheduling_links'][] = $section['sched_appt_link'];
            }
        }
        // Keep this for backward compatibility 
        $profile_data['scheduling_link'] = $profile_data['scheduling_links'][0] ?? null;

        //add processed profile data to list
        $profiles_data[] = $profile_data;
    } // END OF FOR LOOP
}
// copying data from profiles to context
$context['profiles'] = $profiles_data;

// Showing message if use does not input any contacts (in preview, on editor side)
if ( $is_preview && ! $context['profiles'] ) {
	//echo '<div class="callout-wrapper callout-disabled"></div>';
    echo '<div class="contact-selector-wrapper-preview col card"><p><strong>';
	_e( 'The  \'Contact Selector Section\' is not configured.', 'bc-sitka-spruce' );
	echo '</strong></p><p>';
	_e( 'Select this element, then use the Settings sidebar to add a title, description, and choose contacts to display.', 'bc-sitka-spruce' );
	echo '</p></div>';
}


// Render Twig Template, and if it's empty, return nothing
if ( $context['profiles'] ) {
	Timber::render( '/stories/contact-item/contact-loop.twig', $context );
} else {
	echo '';
}
