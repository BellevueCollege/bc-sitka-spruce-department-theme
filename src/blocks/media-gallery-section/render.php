<?php

use Timber\Timber;
$context = Timber::context();

$context['title']       = esc_html( get_field( 'title' ) ?? '' );
$context['description'] = wp_kses_post( get_field( 'description' ) ?? '' );
$context['slides']      = get_field( 'slides' ) ? array_map(
	function ( $slide ) {
		return array(
			'image'             => wp_get_attachment_image( $slide['image'], 'media-gallery-image', false, array( 'class' => 'img-fluid rounded' ) ),
			'slide_title'       => esc_html( $slide['slide_title'] ?? '' ),
			'slide_description' => wp_kses_post( $slide['slide_description'] ?? '' ),
			'video_url'         => esc_url( $slide['video_url'] ?? '' ),
		);
	},
	get_field( 'slides' )
) : null;

Timber::render( '/stories/media-gallery/media-gallery.twig', $context );

if ( $is_preview && ! $context['title'] ) {
	echo '<div class="announcement-wrapper-preview col"><p>';
	_e( 'The  \'Media Gallery Section\' is not configured. <br />Select this element, then use the Settings sidebar to configure it!', 'bc-sitka-spruce' );
	echo '</p></div>';
}
