<?php
use Timber\Timber;

$context = Timber::context();

// $context['cards']          = $content;

// // Rich Text Fields
// $context['title']          = $attributes['title'];
// $context['description']        = $attributes['description'];

// Wrapper
$context['wrapper_attrs'] = get_block_wrapper_attributes(
	array(
		'class' => 'card-section alignfull',
	)
);

$context['card_classes'] = array( 'card-section-card' );
$context['media']        = $attributes['cardImageUrl'] ? array(
	'src'     => $attributes['cardImageUrl'],
	'alt'     => $attributes['cardImageAlt'],
	'classes' => array(),
) : null;

$context['card_title_tag'] = 'h3';
$context['card_title']     = $attributes['cardTitle'];
$context['card_content']   = $content;



// Render Twig Template
Timber::render( '/stories/card-bootstrap/card-bootstrap.twig', $context );
