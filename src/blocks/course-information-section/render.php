<?php
use Timber\Timber;

$context = Timber::context();
$context['content'] = $content;

// Render Twig Template
Timber::render( '/stories/course-information-section/course-information-section.twig', $context );
