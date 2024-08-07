<?php


use Timber\Timber;
$context = Timber::context();

$context['structure'] = $content;
$context['id'] = $attributes['blockId'];

$classes = array( 'tabcordion' );
$classes[] = 'tabcordion-' . $attributes['format'];

if ( $attributes['wrapContent'] ) {
	$classes[] = 'wrap-content';
}

if ( $attributes['format'] === 'tabs' ) {
	$classes[] = 'card';
}

$context['wrapper_attrs'] = get_block_wrapper_attributes(
	array(
		'id' => $attributes['blockId'],
		'class' => implode( ' ', $classes ),
	)
);

// $wrapper_attrs = get_block_wrapper_attributes(
// 	array(
// 		'class' => 'card',
// 	)
// );
if ( $attributes['format'] === 'tabs' ) {
	Timber::render( '/stories/tabcordion/tabcordion-top-tabs-card.twig', $context );
} else {
	Timber::render( '/stories/tabcordion/tabcordion-top-tabs.twig', $context );
}

