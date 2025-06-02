<?php
use Timber\Timber;

$context = Timber::context();

// Rich Text Fields
$context['title']       = esc_html( $attributes['title'] ?? '' );
$context['description'] = wp_kses_post( $attributes['description'] ?? '' );
$context['list_items']  = $content;
$context['anchor']      = $attributes['anchor'] ?? null;

// Render Twig Template
Timber::render( '/stories/listing-section/listing-section.twig', $context );
