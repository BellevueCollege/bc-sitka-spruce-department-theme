<?php
use Timber\Timber;

$context = Timber::context();

// Rich Text Fields
$context['title']       = esc_html( $attributes['title'] ?? '' );
$context['description'] = wp_kses_post( $attributes['description'] ?? '' );
$context['list_items']  = $content;

// Render Twig Template
Timber::render( '/stories/listing-section/listing-section.twig', $context );
