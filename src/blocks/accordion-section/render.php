<?php
use Timber\Timber;

$context            = Timber::context();
$context['content'] = $content;
$context['anchor'] = ! empty( $attributes['anchor'] )
	? sanitize_title( $attributes['anchor'] )
	: '';

// Render Twig Template
Timber::render( '/stories/accordion-section/accordion-section.twig', $context );
