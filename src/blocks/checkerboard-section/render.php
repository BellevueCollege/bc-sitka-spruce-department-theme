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
$context['is_preview'] = $is_preview;

/**
 * If the editor sets an HTML Anchor, use it (sanitized). Otherwise, don't set an id at all.
 */
$explicit_anchor = isset( $block['anchor'] ) ? trim( (string) $block['anchor'] ) : '';
$context['anchor_id'] = $explicit_anchor !== '' ? sanitize_title( $explicit_anchor ) : null;

/**
 * ── Wrapper classes: include core className/align.
 */
$classes = [ 'checkerboard-section' ];
if ( ! empty( $block['className'] ) ) {
	$classes[] = $block['className'];
}
if ( ! empty( $block['align'] ) ) {
	$classes[] = 'align' . $block['align'];
}
$classes = array_map( 'sanitize_html_class', $classes );
$context['classes'] = implode( ' ', $classes );

$hasContent = $context['title'] && $context['checkerboards'];

if ( $hasContent ) {
	Timber::render( '/stories/checkerboard-section/checkerboards.twig', $context );
} elseif ( $is_preview ) {
	Timber::render( '/stories/atoms/block-empty-state/block-empty-state.twig', array(
		'block_name'   => __( 'Checkerboard Section', 'bc-sitka-spruce' ),
		'instructions' => __( 'Add title and checkerboards to this element so that it can display!', 'bc-sitka-spruce' ),
	) );
}
