<?php
use Timber\Timber;

$context = Timber::context();

$context['content']          = $content;

// Rich Text Fields
$context['heading']          = $attributes['heading'];
$context['summary']          = $attributes['summary'];

// Custom fields from Options
$context['display_location'] = get_field( 'display_location_card', 'option' );
$image                       = get_field( 'location_image', 'option' );
if ( $image ) {
	$context['image']['src'] = $image['url'];
	$context['image']['alt'] = $image['alt'];
}
$context['location']      = get_field( 'location', 'option' );
$context['hours']         = get_field( 'hours', 'option' );
$context['contact_url']   = get_field( 'contact_page_url', 'option' );

// Wrapper
$context['wrapper_attrs'] = get_block_wrapper_attributes(
	array(
		'class' => 'content-and-location container-xl alignwide',
	)
);



// Render Twig Template
Timber::render( '/stories/content-and-location/content-and-location.twig', $context );
