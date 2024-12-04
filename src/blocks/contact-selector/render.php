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
        $profile_data['first_name'] = esc_html(get_field('first_name', $profile->ID));
        $profile_data['last_name'] = esc_html(get_field('last_name', $profile->ID));
        $profile_data['position'] = esc_html(get_field('position_role', $profile->ID));
        $profile_data['email'] = esc_html(get_field('email', $profile->ID));
        $profile_data['phone'] = esc_html(get_field('phone_number', $profile->ID));

        // getting data specifically for contact item
        $schedule_data = get_field('scheduling_section', $profile->ID);

    // going into contact item data to grab nested data
        $profile_data['scheduling_link'] = esc_url($schedule_data['schedule_appointment_link']['url'] ?? null);
        $profile_data['scheduling_text'] = esc_html($schedule_data['schedule_appointment_link']['title'] ?? null);

        //add processed profile data to list
        $profiles_data[] = $profile_data;
    } // END OF FOR LOOP
}
// copying data from profiles to context
$context['profiles'] = $profiles_data;

// Showing message if use does not input any contacts (in preview, on editor side)
if ( $is_preview && ! $context['profiles'] ) {
	//echo '<div class="callout-wrapper callout-disabled"></div>';
    echo '<div class="contact-selector-wrapper-preview col"><p>';
	_e( 'The  \'Contact Selector Component\' is not configured. <br />Edit this element to configure it!', 'bc-sitka-spruce' );
	echo '</p></div>';
}


// Render Twig Template, and if it's empty, return nothing
if ( $context['profiles'] ) {
	Timber::render( '/stories/contact-item/contact-loop.twig', $context );
} else {
	echo '';
}