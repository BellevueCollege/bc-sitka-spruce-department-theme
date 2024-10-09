<?php
use Timber\Timber;

$context = Timber::context();
$context['content'] = $content;

// Render Twig Template
Timber::render( '/stories/accordion-section/accordion-section.twig', $context );
