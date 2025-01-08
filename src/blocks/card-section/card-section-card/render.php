<?php
use Timber\Timber;

$context = Timber::context();

// Wrapper
$context['wrapper_attrs'] = get_block_wrapper_attributes(
	array(
		'class' => 'card-section alignfull',
	)
);

$context['card_classes'] = array( 'card-section-card' );
$context['media_html']        = $attributes['cardImageId'] ? wp_get_attachment_image( $attributes['cardImageId'], 'card-header', false, array( 'class' => 'card-img-top' ) ) : null;

$context['card_title_tag'] = 'h3';
$context['card_title']     = wp_kses_post( $attributes['cardTitle'] ?? '' );
$context['card_content']   = wp_kses_post( $content ?? '' );



// Render Twig Template
if ( $context['media_html'] && $context['card_title'] && $context['card_content'] ) {
	Timber::render( '/stories/card-bootstrap/card-bootstrap.twig', $context );
} else {
	echo '';
}

