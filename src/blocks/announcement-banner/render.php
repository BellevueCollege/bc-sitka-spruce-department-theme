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
			'target' => $link['link']['target'] ?? '',
		);
	},
	get_field( 'links' )
) : null;
$hasContent = (bool) $context['title'];

if ( $hasContent ) {
	Timber::render( '/stories/announcement-banner/announcement-banner.twig', $context );
} elseif ( $is_preview ) {
	Timber::render( '/stories/atoms/block-empty-state/block-empty-state.twig', array(
		'block_name'   => __( 'Announcement Banner Component', 'bc-sitka-spruce' ),
		'instructions' => __( 'Select this element, then use the Settings sidebar to add content to this element so that it can display!', 'bc-sitka-spruce' ),
	) );
}
