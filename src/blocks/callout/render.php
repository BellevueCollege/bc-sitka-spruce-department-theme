<?php

use Timber\Timber;
$context = Timber::context();

$context['enabled'] = get_field( 'display_callout' );
$context['title'] = get_field( 'title' ) ?? '';
$context['text'] = get_field( 'text' ) ?? '';
$context['links'] = array_map( function ( $link ) {
	return $link['link'] ?? '';
}, get_field( 'links' ) ?? array() );

$context['wrapper_classes'] = 'callout-wrapper col';
$context['heading_tag'] = 'h5';




// $wrapper_attrs = get_block_wrapper_attributes(
// 	array(
// 		'class' => 'card-body tab-content',
// 	)
// );
if ( $context['enabled'] ) {
	Timber::render( '/stories/callout/callout.twig', $context );
}
