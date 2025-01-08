<?php
use Timber\Timber;

$context = Timber::context();

$context['cards'] = $content;

// Rich Text Fields
$context['title']       = esc_html( $attributes['title'] ?? '' );
$context['description'] = wp_kses_post( $attributes['description'] ?? '' );

// Wrapper
$context['wrapper_attrs'] = get_block_wrapper_attributes(
	array(
		'class' => 'section section-white card-section alignfull',
	)
);

// Render Twig Template
if ( $context['cards'] && $context['title'] ) {
	Timber::render( '/stories/card-section/card-section.twig', $context );
} else {
	echo '';
}
