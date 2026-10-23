<?php

use Timber\Timber;
$context = Timber::context();
$context['links'] = get_field( 'links' ) ? array_map( function ( $link ) {
	return array(
		'title'  => esc_html( $link['link']['title'] ?? '' ),
		'url'    => esc_url( $link['link']['url'] ?? '' ),
		'target' => esc_attr( $link['link']['target'] ?? '' ),
	);
}, get_field( 'links' ) ) : null;
$context['is_preview'] = $is_preview;

$context['button'] = get_field( 'button' );

$hasContent = $context['links'] || $context['button'];

if ( $hasContent ) {
	Timber::render( '/stories/listing-section/list-item-links.twig', $context );
} elseif ( $is_preview ) {
	Timber::render( '/stories/atoms/block-empty-state/block-empty-state.twig', array(
		'instructions' => __( 'Select this element and use the Settings sidebar to add optional links or button', 'bc-sitka-spruce' ),
		'variant' => 'optional',
	) );
}
