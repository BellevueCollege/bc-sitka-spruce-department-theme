<?php
/**
 * Single Template for Resolutions
 */

$context = Timber::context();
$timber_post = Timber::get_post();

$meeting_date = $timber_post->meta( 'meeting_date' );

if ( ! empty( $meeting_date ) ) {
	// ACF date picker values are calendar dates; parse in the site timezone to avoid day offset.
	$date_time = DateTimeImmutable::createFromFormat( '!Ymd', $meeting_date, wp_timezone() );

	if ( ! $date_time ) {
		$date_time = date_create_immutable( $meeting_date, wp_timezone() );
	}

	if ( $date_time ) {
		$timber_post->localized_meeting_date = wp_date( 'F j, Y', $date_time->getTimestamp(), wp_timezone() );
	}
}

$context['post'] = $timber_post;

// Render twig
Timber::render( 'content/single-resolution.twig', $context );
