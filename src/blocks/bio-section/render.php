<?php
use Timber\Timber;

$context = Timber::context();
$context['content'] = $content;
// Passing the anchor attribute to Twig!
$context['anchor'] = $attributes['anchor'] ?? null;
// Render Twig Template
Timber::render( '/stories/bio-section/bio-section.twig', $context );
