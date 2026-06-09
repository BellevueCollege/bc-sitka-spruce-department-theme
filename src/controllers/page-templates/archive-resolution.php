<?php
/**
 * Board of Trustees Agenda Archive Part
 * @package BC Sitka Spruce Theme
 */

$context = Timber::context();
$context['title'] = 'Board of Trustees Resolutions'; // Fallback title

//All Resolution(s)- ordered by the meeting date
$args = array(
    'post_type'      => 'resolution',
    'posts_per_page' => -1, // Get all of them
    // allows posts w/o meta_key in results
    'meta_query'     => array(
        'relation' => 'OR',
        array(
            'key'     => 'meeting_date',
            'compare' => 'EXISTS',
        ),
        array(
            'key'     => 'meeting_date',
            'compare' => 'NOT EXISTS',
        ),
    ),
    'orderby' => array(
        'meta_value' => 'DESC',
        'date'       => 'DESC', // Secondary sort by publish date
    ),
);
$agendas = Timber::get_posts( $args );

//Group them by Year (this is how they were grouped in douglas theme)
$posts_by_year = array();
foreach ( $agendas as $agenda ) {
    $year = null; // always reset
    // try to get ACF details date first
    $meeting_date = $agenda->meta('meeting_date');

    if ( ! empty( $meeting_date ) ) {
        // ACF date picker values are calendar dates; parse in the site timezone to avoid day offset.
        $date_time = DateTimeImmutable::createFromFormat( '!Ymd', $meeting_date, wp_timezone() );

        if ( ! $date_time ) {
            $date_time = date_create_immutable( $meeting_date, wp_timezone() );
        }

        if ( $date_time ) {
            $year = $date_time->format( 'Y' );
            $agenda->localized_meeting_date = wp_date( 'F j, Y', $date_time->getTimestamp(), wp_timezone() );
        }
    } else {
        //fallback to WP publish year if no meeting date
        // $agenda->post_date = timber version of publish date
        $post_timestamp = strtotime( $agenda->post_date );
        $year = gmdate( 'Y', strtotime( $post_timestamp ) );
        $agenda->localized_meeting_date = wp_date( 'F j, Y', $post_timestamp );
    }
    // AFTER finding the year, add it to the array
    if ( $year ) {
        $posts_by_year[ $year ][] = $agenda;
    }
}

//Sort so the years are in descending order (newest/latest to oldest/earliest)
krsort( $posts_by_year );
//Pass  to Twig
$context['posts_by_year'] = $posts_by_year;

//Render
Timber::render( 'archive-resolution.twig', $context );