<?php
use Timber\Timber;

$context = Timber::context();

$context['content']          = $content;

// Rich Text Fields
$context['heading']          = esc_html( $attributes['heading'] ?? '' );
$context['summary']          = wp_kses_post( $attributes['summary'] ?? '' );

$context['site_type']        = get_field( 'site_type', 'option' );
$context['parent_division']  = get_field( 'parent_division', 'option' ) ?? null;

// Custom fields from Options
$context['display_location'] = get_field( 'display_location_card', 'option' ) ? true : false;
$image                       = get_field( 'location_image', 'option' );
if ( $image ) {
	$context['image']['src'] = esc_url( $image['url'] ?? '' );
	$context['image']['alt'] = esc_attr( $image['alt'] ?? '' );
}
$context['location']      = wp_kses_post( get_field( 'location', 'option' ) ?? '' );
$context['hours']         = wp_kses_post( get_field( 'hours', 'option' ) ?? '' );
$context['contact_url']   = esc_url( get_field( 'contact_page_url', 'option' ) ?? '' );

// Wrapper
$context['wrapper_attrs'] = get_block_wrapper_attributes(
	array(
		'class' => 'content-and-location container-xl alignwide',
	)
);



// Render Twig Template
Timber::render( '/stories/content-and-location/content-and-location.twig', $context );
