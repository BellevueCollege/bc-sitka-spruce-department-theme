<?php
/**
 * Board of Trustees Agenda Archive Part
 * @package BC Sitka Spruce Theme
 */

$context = Timber::context();
$context['title'] = 'Board of Trustees Action Items'; // Fallback title

//All Action Item(s)- ordered by the meeting date
$args = array(
    'post_type'      => 'action-item',
    'posts_per_page' => -1, // Get all of them'
);
$agendas = Timber::get_posts( $args );

//Group them by Year 
$posts_by_year = array();
foreach ( $agendas as $agenda ) {
    $year = null; // always reset (to prevent hiccup date associated with last item)
    $sort_time = 0;
    $meeting_date = $agenda->meta('meeting_date');

    if ( ! empty( $meeting_date ) ) {
        // ACF date picker values are calendar dates; parse in the site timezone to avoid day offset.
        $date_time = DateTimeImmutable::createFromFormat( '!Ymd', $meeting_date, wp_timezone() );

        if ( ! $date_time ) {
            $date_time = date_create_immutable( $meeting_date, wp_timezone() );
        }

        if ( $date_time ) {
            $year = $date_time->format( 'Y' );
            $sort_time = $date_time->getTimestamp();
            $agenda->localized_meeting_date = wp_date( 'F j, Y', $sort_time, wp_timezone() );
        }
    } else {
        // Fallback to WP publish date for the year group
        $date_time = date_create_immutable( $agenda->post_date, wp_timezone() );

        if ( $date_time ) {
            $year = $date_time->format( 'Y' );
            $sort_time = $date_time->getTimestamp();
            $agenda->localized_meeting_date = wp_date( 'F j, Y', $sort_time, wp_timezone() );
        }
    }

    if ( $year ) {
        // Attach raw sort timestamp for sorting inside the year group
        $agenda->sort_timestamp = $sort_time;
        $posts_by_year[ $year ][] = $agenda;
    }
}

//Sort so the years are in descending order (newest/latest to oldest/earliest)
krsort( $posts_by_year );

//Sort posts w/in each year descending by date
foreach ( $posts_by_year as $year => &$posts ) {
    usort( $posts, function( $a, $b ) {
        return $b->sort_timestamp <=> $a->sort_timestamp;
    } );
}
unset( $posts ); // break reference

//Pass  to Twig
$context['posts_by_year'] = $posts_by_year;

//Render
Timber::render( 'archive-action-items.twig', $context );