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

/**
 * If the editor sets an HTML Anchor, use it (sanitized). Otherwise, don't set an id at all.
 */
$explicit_anchor = isset( $block['anchor'] ) ? trim( (string) $block['anchor'] ) : '';
$context['anchor_id'] = $explicit_anchor !== '' ? sanitize_title( $explicit_anchor ) : null;

/**
 * ── Wrapper classes: include core className/align.
 */
$classes = [ 'testimonial-section' ];
if ( ! empty( $block['className'] ) ) {
	$classes[] = $block['className'];
}
if ( ! empty( $block['align'] ) ) {
	$classes[] = 'align' . $block['align'];
}
$classes = array_map( 'sanitize_html_class', $classes );
$context['classes'] = implode( ' ', $classes );

if ( $context['title'] ) {
	Timber::render( '/stories/media-gallery/media-gallery.twig', $context );
} else {
	echo '';
}

if ( $is_preview && ! $context['title'] ) {
	echo '<div class="announcement-wrapper-preview col"><p>';
	_e( 'The  \'Media Gallery Section\' is not configured. <br />Select this element, then use the Settings sidebar to configure it!', 'bc-sitka-spruce' );
	echo '</p></div>';
}
