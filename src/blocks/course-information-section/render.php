<?php
use Timber\Timber;

$context = Timber::context();
$context['content'] = $content;

// Render Twig Template
if ( ! empty( $content ) ) {
	Timber::render( '/stories/course-information-section/course-information-section.twig', $context );
} else {
	echo '';
}
