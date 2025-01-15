<?php

use Timber\Timber;
$context = Timber::context();

$context['enabled'] = get_field( 'display_callout' );
$context['title'] = get_field( 'title' ) ?? '';
$context['text'] = get_field( 'text' ) ?? '';
$context['button'] = get_field( 'button' ) ?? '';
$links = get_field( 'links' );
$context['links'] = is_array( $links ) ? array_map( function ( $link ) {
	return $link['link'] ?? '';
}, $links ) : null;

$context['wrapper_classes'] = 'callout-wrapper col';
$context['heading_tag'] = 'h3';




// $wrapper_attrs = get_block_wrapper_attributes(
// 	array(
// 		'class' => 'card-body tab-content',
// 	)
// );
if ( $context['enabled'] ) {
	Timber::render( '/stories/callout/callout.twig', $context );
} else {
	echo '';
}

if ( $is_preview && ! $context['enabled'] ) {
	echo '<div class="callout-wrapper callout-disabled col"><p>';
	_e( 'The optional \'Callout\' sidebar is disabled. <br />Edit this element to enable it!', 'bc-sitka-spruce' );
	echo '</p></div>';
}
