<?php
use Timber\Timber;

if ( ! isset( $content ) ) {
    return;
}

$context = Timber::context();
$context['title'] = $attributes['title'];
$context['description'] = $attributes['description'];
$context['linkTitle'] = $attributes['linkTitle'];
$context['linkUrl'] = $attributes['linkUrl'];

$context['content'] = $content;

// Render Twig Template
Timber::render( get_template_directory() . '/stories/differentiators/differentiators.twig', $context );
