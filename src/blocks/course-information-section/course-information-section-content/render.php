<?php
use Timber\Timber;

$context            = Timber::context();
$context['title']   = esc_attr( $attributes['title'] ?? '' );
$context['content'] = $content;

// Render Twig Template
Timber::render( '/stories/course-information-section/course-information-section-content.twig', $context );
