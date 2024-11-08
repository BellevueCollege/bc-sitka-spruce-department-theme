<?php

use Timber\Timber;
$context = Timber::context();

$context['title'] = get_field( 'title' ) ?? '';
$context['description'] = get_field( 'description' ) ?? '';
$context['slides'] = get_field( 'slides' ) ? array_map( function ( $slide ) {
	return array(
		'image' => wp_get_attachment_image( $slide['image'], 'media-gallery-image', false, array( 'class' => 'img-fluid rounded' ) ),
		'slide_title' => $slide['slide_title'] ?? '',
		'slide_description' => $slide['slide_description'] ?? '',
		'video_url' => $slide['video_url'] ?? '',
	);
}, get_field( 'slides' ) ) : null;

Timber::render( '/stories/media-gallery/media-gallery.twig', $context );

if ( $is_preview && ! $context['title'] ) {
	echo '<div class="announcement-wrapper-preview col"><p>';
	_e( 'The  \'Media Gallery Section\' is not configured. <br />Edit this element to configure it!', 'bc-sitka-spruce' );
	echo '</p></div>';
}

/*$slides = get_field( 'slides' );
$context['slides'] = array_map( function_to_process_array, $slides );
function function_to_process_array( $slide ) {
	return DO ALL THE THINGS
}*/