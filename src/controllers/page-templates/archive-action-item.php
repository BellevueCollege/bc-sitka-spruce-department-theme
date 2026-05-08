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
    //allows posts w/o meta_key in results
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
    $year = null; // always reset (to prevent hiccup date associated with last item)
    $meeting_date = $agenda->meta('meeting_date');
    if ( ! empty( $meeting_date ) ) {
        // Extract just the year from the ACF date field
        $year = gmdate( 'Y', strtotime( $date ) );
    } else {
        //fallback to publish year if no meeting date
        // $agenda->post_date = timber version of publish date
        $year = gmdate( 'Y', strtotime( $agenda->post_date ) );
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
Timber::render( 'archive-action-items.twig', $context );