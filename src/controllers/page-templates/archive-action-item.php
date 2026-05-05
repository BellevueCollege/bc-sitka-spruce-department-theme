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
    'posts_per_page' => -1, // Get all of them
    'meta_key'       => 'date',
    'orderby'        => 'meta_value',
    'order'          => 'DESC',
);
$agendas = Timber::get_posts( $args );

//Group them by Year (this is how they were grouped in douglas theme)
$posts_by_year = array();
foreach ( $agendas as $agenda ) {
    $date = $agenda->meta('date');
    if ( ! empty( $date ) ) {
        // Extract just the year from the ACF date field
        $year = gmdate( 'Y', strtotime( $date ) );
        $posts_by_year[ $year ][] = $agenda;
    }
}

//Sort so the years are in descending order (newest/latest to oldest/earliest)
krsort( $posts_by_year );
//Pass  to Twig
$context['posts_by_year'] = $posts_by_year;

//Render
Timber::render( 'archive-action-items.twig', $context );