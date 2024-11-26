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
		'title' => esc_html( $attributes['linkTitle'] ),
		'url'   => esc_url( $attributes['linkUrl'] ),
	);
}


// Render Twig Template
Timber::render( get_template_directory() . '/stories/differentiators/differentiators.twig', $context );
