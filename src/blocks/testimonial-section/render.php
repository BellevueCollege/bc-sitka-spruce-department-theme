<?php

use Timber\Timber;
$context = Timber::context();

$context['title'] = get_field( 'title' ) ?? '';
$context['description'] = get_field( 'description' ) ?? '';
$context['image'] =  wp_get_attachment_image( get_field( 'image' )['ID'], 'testimonial' );
$context['quote'] = get_field( 'quote' ) ?? '';
$attribution = get_field( 'attribution' ) ?? array();
$context['attribution_name'] = $attribution['name'] ?? '';
$context['attribution_desc'] = $attribution['description'] ?? '';
$cta = get_field( 'cta' ) ?? null;
if ( $cta ) {
	$context['cta'] = array(
		'url' => $cta['url'] ?? '',
		'title' => $cta['title'] ?? '',
	);
}


if ( $context['title'] ) {
	Timber::render( '/stories/testimonial/testimonial.twig', $context );
} else {
	echo '';
}

if ( $is_preview && ! $context['title'] ) {
	echo '<div class="card"><p>';
	_e( 'Add content to this element so that it can display!', 'bc-sitka-spruce' );
	echo '</p></div>';
}
