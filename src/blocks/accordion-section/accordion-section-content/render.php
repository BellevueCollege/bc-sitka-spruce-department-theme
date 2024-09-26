<?php
use Timber\Timber;

$context = Timber::context();
$context['title'] = $attributes['title'];
$context['description'] = $attributes['description'];
$context['accordion'] = $content;

// Render Twig Template
Timber::render( '/stories/accordion-section/accordion-section-content.twig', $context );
