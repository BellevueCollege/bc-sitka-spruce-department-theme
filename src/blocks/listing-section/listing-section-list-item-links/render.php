<?php

use Timber\Timber;
$context = Timber::context();
$context['links'] = get_field( 'links' ) ? array_map( function ( $link ) {
	return array(
		'title'  => esc_html( $link['link']['title'] ?? '' ),
		'url'    => esc_url( $link['link']['url'] ?? '' ),
		'target' => esc_attr( $link['link']['target'] ?? '' ),
	);
}, get_field( 'links' ) ) : null;
$context['is_preview'] = $is_preview;

$context['button'] = get_field( 'button' );

if ( $context['links'] || $context['button'] ) {
	Timber::render( '/stories/listing-section/list-item-links.twig', $context );
} else {
	echo '';
}

if ( $is_preview && ! $context['links'] && ! $context['button'] ) {
	echo '<div class="card"><p><i>';
	_e( 'Select this element and use the Settings sidebar to add optional links or button', 'bc-sitka-spruce' );
	echo '</i></p></div>';
}
