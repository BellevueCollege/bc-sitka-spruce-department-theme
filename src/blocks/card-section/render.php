<?php
use Timber\Timber;

$context = Timber::context();

$context['cards'] = $content;

// Rich Text Fields
$context['title']       = $attributes['title'];
$context['description'] = $attributes['description'];

// Wrapper
$context['wrapper_attrs'] = get_block_wrapper_attributes(
	array(
		'class' => 'section card-section alignfull',
	)
);



// Render Twig Template
Timber::render( '/stories/card-section/card-section.twig', $context );
