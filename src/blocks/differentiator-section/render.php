<?php
use Timber\Timber;

if ( ! isset( $content ) ) {
    return;
}

$context = Timber::context();
$context['title']       = esc_html( $attributes['title'] ?? '' );
$context['description'] = wp_kses_post( $attributes['description'] ?? '' );
$context['content']     = $content;

if ( $attributes['linkTitle'] && $attributes['linkUrl'] ) {
	$context['link_custom'] = array(
		'title' =>  html_entity_decode( esc_html( $attributes['linkTitle'] ) ), // This appears to be escaped elsewhere, and adding additional escaping here causes issues
		'url'   => esc_url( $attributes['linkUrl'] ),
	);
}


// Render Twig Template
Timber::render( '/stories/differentiators/differentiators.twig', $context );
