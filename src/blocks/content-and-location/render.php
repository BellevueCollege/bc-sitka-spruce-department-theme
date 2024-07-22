<?php
use Timber\Timber;

$context = Timber::context();

$context['content']          = $content;
$context['display_location'] = get_field( 'display_location_card', 'option' );
$image                       = get_field( 'location_image', 'option' );
if ( $image ) {
	$context['image']['src'] = $image['url'];
	$context['image']['alt'] = $image['alt'];
}
$context['location']      = get_field( 'location', 'option' );
$context['hours']         = get_field( 'hours', 'option' );
$context['contact_url']   = get_field( 'contact_page_url', 'option' );
$context['wrapper_attrs'] = get_block_wrapper_attributes(
	array(
		'class' => 'content-and-location container-xl alignwide',
	)
);



// Render Twig Template
Timber::render( '/views/blocks/content-and-location.twig', $context );
