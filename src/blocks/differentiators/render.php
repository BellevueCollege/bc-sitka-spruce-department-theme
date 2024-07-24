<?php
use Timber\Timber;

if ( ! isset( $content ) ) {
    return;
}

$context = Timber::context();

$context['content'] = $content;

// Render Twig Template
Timber::render( get_template_directory() . '/stories/differentiators/differentiators.twig', $context );