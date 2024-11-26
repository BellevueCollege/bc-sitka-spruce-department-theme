<?php

use Timber\Timber;
$context = Timber::context();

$context['title']       = esc_html( get_field( 'title' ) ?? '' );
$context['description'] = wp_kses_post( get_field( 'description' ) ?? '' );
$context['button']      = get_field( 'button' ) ?? '';
$context['image']       = get_field( 'image' ) ? wp_get_attachment_image( get_field( 'image' ), 'announcement-banner', false, array( 'class' => 'img-fluid rounded' ) ) : null;
$context['button']      = get_field( 'button' ) ?? array();
$context['links']       = get_field( 'links' ) ? array_map(
	function ( $link ) {
		return array(
			'title' => $link['link']['title'] ?? '',
			'url'   => $link['link']['url'] ?? '',
		);
	},
	get_field( 'links' )
) : null;
Timber::render( '/stories/announcement-banner/announcement-banner.twig', $context );

if ( $is_preview && ! $context['title'] ) {
	echo '<div class="announcement-wrapper-preview col"><p>';
	_e( 'The  \'Announcement Banner Component\' is not configured. <br />Edit this element to configure it!', 'bc-sitka-spruce' );
	echo '</p></div>';
}
