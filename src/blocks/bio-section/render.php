<?php
use Timber\Timber;

$context = Timber::context();
$context['content'] = $content;

// Render Twig Template
Timber::render( '/stories/bio-section/bio-section.twig', $context );
