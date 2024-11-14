<?php

use Timber\Timber;
$context = Timber::context();
$context['links'] = get_field( 'links' ) ? array_map( function ( $link ) {
	return array(
		'title' => $link['link']['title'] ?? '',
		'url' => $link['link']['url'] ?? '',
		'target' => $link['link']['target'] ?? '',
	);
}, get_field( 'links' ) ) : null;

$context['button'] = get_field( 'button' );

if ( $context['links'] || $context['button'] ) {
	Timber::render( '/stories/listing-section/list-item-links.twig', $context );
} else {
	echo '';
}

if ( $is_preview && ! $context['links'] && ! $context['button'] ) {
	echo '<div class="card"><p><i>';
	_e( 'Edit this element to add optional links or button..', 'bc-sitka-spruce' );
	echo '</i></p></div>';
}
