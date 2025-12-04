<?php

use Timber\Timber;
$context                = Timber::context();
$context['title']       = esc_html( $attributes['title'] ?? '' );
$context['description'] = wp_kses_post( $attributes['description'] ?? '' );
$context['tabs']        = $content;

$anchor = ! empty( $attributes['anchor'] )
	? sanitize_title( $attributes['anchor'] )
	: '';

if ( $anchor ) {
	$context['anchor'] = $anchor;
}

if ( '' !== $attributes['linkUrl'] ) {
	$context['link_custom']['title'] = html_entity_decode( esc_html( $attributes['linkTitle'] ) ); // This appears to be escaped elsewhere, and adding additional escaping here causes issues
	$context['link_custom']['url']   = esc_url( $attributes['linkUrl'] );
}

Timber::render( '/stories/tabs-section/tabs-section.twig', $context );
