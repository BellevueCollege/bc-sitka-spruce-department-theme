<?php
use Timber\Timber;

$context = Timber::context();

// Rich Text Fields
$context['title']       = $attributes['title'];
$context['description'] = $attributes['description'];

// Render Twig Template
Timber::render( '/stories/listing-section/listing-section.twig', $context );
