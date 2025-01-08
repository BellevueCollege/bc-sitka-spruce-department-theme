<?php
use Timber\Timber;

$context                = Timber::context();
$context['title']       = esc_html( $attributes['title'] ?? '' );
$context['description'] = wp_kses_post( $attributes['description'] ?? '' );
$context['accordion']   = $content;

// Render Twig Template
Timber::render( '/stories/accordion-section/accordion-section-content.twig', $context );
