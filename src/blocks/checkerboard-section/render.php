<?php

use Timber\Timber;
$context = Timber::context();

$context['title']         = esc_html( get_field( 'title' ) ?? '' );
$context['description']   = esc_html( get_field( 'description' ) ?? '' );
$context['checkerboards'] = get_field( 'checkerboards' ) ? array_map(
	function ( $checkerboard ) {
		return array_merge(
			$checkerboard,
			array(
				'image' => $checkerboard['image'] ? wp_get_attachment_image( $checkerboard['image']['ID'], 'checkerboard', false, array( 'class' => 'img-fluid rounded' ) ) : null,
				'links' => $checkerboard['links'] ? array_map(
					function ( $link ) {
						return array(
							'title'  => esc_html( $link['link']['title'] ?? '' ),
							'url'    => esc_url( $link['link']['url'] ?? '' ),
							'target' => esc_attr( $link['link']['target'] ?? '' ),
						);
					},
					$checkerboard['links']
				) : null,
			)
		);
	},
	get_field( 'checkerboards' )
) : array();



if ( $context['checkerboards'] ) {
	Timber::render( '/stories/checkerboard-section/checkerboards.twig', $context );
} else {
	echo '';
}

if ( $is_preview && ! $context['checkerboards'] ) {
	echo '<div class="card"><p>';
	_e( 'Add checkerboards to this element so that it can display!', 'bc-sitka-spruce' );
	echo '</p></div>';
}
