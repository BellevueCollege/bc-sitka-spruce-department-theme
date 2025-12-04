<?php
use Timber\Timber;

$context = Timber::context();

$context['cards'] = $content;

// Rich Text Fields
$context['title']       = esc_html( $attributes['title'] ?? '' );
$context['description'] = wp_kses_post( $attributes['description'] ?? '' );

// Wrapper
$wrapper_attr_args = array(
	'class' => 'section section-white card-section alignfull',
);
// If an anchor was set in the block sidebar, use it as the ID
if ( ! empty( $attributes['anchor'] ) ) {
	$wrapper_attr_args['id'] = sanitize_title( $attributes['anchor'] );
}

$context['wrapper_attrs'] = get_block_wrapper_attributes( $wrapper_attr_args );
// Render Twig Template
if ( $context['cards'] && $context['title'] ) {
	Timber::render( '/stories/card-section/card-section.twig', $context );
} else {
	echo '';
}
