<?php
/**
 * Board of Trustees Agenda Archive Part
 * @package BC Sitka Spruce Theme
 */

$context = Timber::context();
$context['title'] = 'Board of Trustees Agendas'; // Fallback title

//All Agendas- ordered by the meeting date
$args = array(
    'post_type'      => 'agendas',
    'posts_per_page' => -1, // Get all of them
    'meta_key'       => 'meeting_date',
    'orderby'        => 'meta_value',
    'order'          => 'DESC',
);
$agendas = Timber::get_posts( $args );

//Group them by Year
$posts_by_year = array();
foreach ( $agendas as $agenda ) {
    $year = null; // always reset
    $meeting_date = $agenda->meta('meeting_date');

    if ( ! empty( $meeting_date ) ) {
        // Extract just the year from the ACF date field
        $year = gmdate( 'Y', strtotime( $meeting_date ) );
        // use local WP timezone, strtotime for txt input & wp_date for local settings
        $agenda->localized_meeting_date = wp_date( 'F j, Y', strtotime( $meeting_date ) );
    } else {
        //Fallback to WP publish date for the year group
        $post_timestamp = strtotime( $agenda->post_date );
        $year = gmdate( 'Y', $post_timestamp );
        //standardizing fallback presentation w/ wp_date
        $agenda->localized_meeting_date = wp_date( 'F j, Y', $post_timestamp );
    }

    if ( $year ) {
        $posts_by_year[ $year ][] = $agenda;
    }
}

//Sort so the years are in descending order (newest/latest to oldest/earliest)
krsort( $posts_by_year );
//Pass  to Twig
$context['posts_by_year'] = $posts_by_year;

//Render
Timber::render( 'archive-agendas.twig', $context );