<?php


use Timber\Timber;
$context = Timber::context();

$context['structure'] = $content;
$context['id']        = esc_attr( $attributes['blockId'] ?? '' );

$classes   = array( 'tabcordion' );
$classes[] = esc_attr( 'tabcordion-' . $attributes['format'] );

if ( $attributes['_wrapContent'] ) {
	$classes[] = 'wrap-content';
}

if ( $attributes['format'] === 'tabs' ) {
	$classes[] = 'card';
}

if ( $attributes['format'] === 'list' ) {
	$classes[] = 'row';
}

$context['wrapper_attrs'] = get_block_wrapper_attributes(
	array(
		'id'    => esc_attr( $attributes['blockId'] ?? '' ),
		'class' => implode( ' ', $classes ),
	)
);

// $wrapper_attrs = get_block_wrapper_attributes(
//  array(
//      'class' => 'card',
//  )
// );
if ( $attributes['format'] === 'tabs' ) {
	Timber::render( '/stories/tabcordion/tabcordion-top-tabs-card.twig', $context );
} elseif ( $attributes['format'] === 'pills' ) {
	Timber::render( '/stories/tabcordion/tabcordion-top-tabs.twig', $context );
} else {
	Timber::render( '/stories/tabcordion/tabcordion-side-tabs.twig', $context );
}
