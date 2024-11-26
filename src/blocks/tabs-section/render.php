<?php

use Timber\Timber;
$context                = Timber::context();
$context['title']       = esc_html( $attributes['title'] ?? '' );
$context['description'] = wp_kses_post( $attributes['description'] ?? '' );
$context['tabs']        = $content;
if ( '' !== $attributes['linkUrl'] ) {
	$context['link_custom']['title'] = esc_html( $attributes['linkTitle'] );
	$context['link_custom']['url']   = esc_url( $attributes['linkUrl'] );
}

Timber::render( '/stories/tabs-section/tabs-section.twig', $context );
