<?php
use Timber\Timber;

$context = Timber::context();

// Rich Text Fields
$context['title']       = $attributes['title'];
$context['description'] = $attributes['description'];
$context['list_items']  = $content;

// Render Twig Template
Timber::render( '/stories/listing-section/listing-section.twig', $context );
