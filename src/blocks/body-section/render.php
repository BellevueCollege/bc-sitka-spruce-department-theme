<?php
use Timber\Timber;

$context = Timber::context();
$context['content'] = $content;

// Render Twig Template
Timber::render( '/stories/body-section/body-section.twig', $context );
