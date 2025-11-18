<?php

use Timber\Timber;
$context = Timber::context();

$context['title']            = esc_html( get_field( 'title' ) ?? '' );
$context['description']      = wp_kses_post( get_field( 'description' ) ?? '' );
$context['image']            = get_field( 'image' ) ? wp_get_attachment_image(
	get_field( 'image' )['ID'],
	'testimonial',
	false,
	array(
		'class' => 'img-fluid',
	)
) : '';
$context['quote']            = wp_kses_post( get_field( 'quote' ) ?? '' );
$attribution                 = get_field( 'attribution' ) ?? array();
$context['attribution_name'] = esc_html( $attribution['name'] ?? '' );
$context['attribution_desc'] = esc_html( $attribution['description'] ?? '' );
$cta                         = get_field( 'cta' ) ?? null;
if ( $cta ) {
	$context['cta'] = array(
		'url'   => esc_url( $cta['url'] ?? '' ),
		'title' => esc_html( $cta['title'] ?? '' ),
		'target' => esc_attr( $cta['target'] ?? '' ),
	);
}


if ( $context['title'] ) {
	Timber::render( '/stories/testimonial/testimonial.twig', $context );
} else {
	echo '';
}

if ( $is_preview && ! $context['title'] ) {
	echo '<div class="card"><p>';
	_e( 'Select this element, then use the Settings sidebar to add content to this element so that it can display!', 'bc-sitka-spruce' );
	echo '</p></div>';
}
