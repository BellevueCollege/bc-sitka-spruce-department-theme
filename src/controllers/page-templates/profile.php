<?php
///NOTE TO SELF COME BACK AND SANITIZE THE DATA

/*
echo '<pre>';
echo print_r(get_field('profiles'));
echo '</pre>';

// holds data from profiles
$profiles_data = [];


// for loop, loops through each profile
foreach (get_field('profiles') as $profile) {

    // defining variables
    $profile_data = [];

    // for loop, loops through each field in each profile
    //$profile_data['pin'] = get_field('pin_profile_in_listing', $profile->ID);
    $profile_data['first_name'] = get_field('first_name', $profile->ID);
    $profile_data['last_name'] = get_field('last_name', $profile->ID);
    $profile_data['position'] = get_field('position_role', $profile->ID);
    $profile_data['email'] = get_field('email', $profile->ID);
    $profile_data['phone'] = get_field('phone_number', $profile->ID);
    /*$profile_data['office_location'] = get_field('office_location', $profile->ID);
      $profile_data['office_hours'] = get_field('office_hours', $profile->ID);
      $profile_data['linkedin'] = get_field('linkedin', $profile->ID);
      $profile_data['additional_url'] = get_field('additional_url', $profile->ID);
      $profile_data['profile_image'] = get_field('profile_image', $profile->ID);
    */
 
    // full array for contact item
    //$profile_data['schedule_link'] = $schedule_data['schedule_appointment_link'];
    
    // see src/block/contact-selector/render.php for reference