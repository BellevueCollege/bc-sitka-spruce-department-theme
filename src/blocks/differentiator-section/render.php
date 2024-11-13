<?php
use Timber\Timber;

if ( ! isset( $content ) ) {
    return;
}

$context = Timber::context();
$context['title']       = esc_html( $attributes['title'] ?? '' );
$context['description'] = wp_kses_post( $attributes['description'] ?? '' );
$context['linkTitle']   = esc_html( $attributes['linkTitle'] ?? '' );
$context['linkUrl']     = esc_url( $attributes['linkUrl'] ?? '' );
$context['content']     = $content;

// Render Twig Template
Timber::render( get_template_directory() . '/stories/differentiators/differentiators.twig', $context );
