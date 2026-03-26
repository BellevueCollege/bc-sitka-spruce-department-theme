<?php
use Timber\Timber;

$context = Timber::context();
$context['content'] = $content;
$context['anchor'] = ! empty( $attributes['anchor'] )
	? sanitize_title( $attributes['anchor'] )
	: '';

// Render Twig Template
if ( ! empty( $content ) ) {
	Timber::render( '/stories/course-information-section/course-information-section.twig', $context );
} else {
	echo '';
}
