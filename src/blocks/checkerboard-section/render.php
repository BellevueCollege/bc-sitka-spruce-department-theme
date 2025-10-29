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
 * $block is provided by ACF when using render.php.
 */
$raw_anchor   = $block['anchor'] ?? '';
$title_fallback = $context['title'] ?? '';

$base_slug = $raw_anchor ?: $title_fallback;
$slug = $base_slug ? sanitize_title( $base_slug ) : '';

/**
 * Add a short, unique, suffix from block ID to avoid duplicate IDs
 */
$unique_suffix = isset( $block['id'] ) ? substr( preg_replace( '/[^a-z0-9]/', '', strtolower( $block['id'] ) ), -6 ) : '';
if ( $slug && $unique_suffix ) {
  $slug .= '-' . $unique_suffix;
}
$context['anchor_id'] = $slug ?: null;

// Merge WP core className/align into wrapper classes
$classes = [ 'checkerboard-section' ];
if ( ! empty( $block['className'] ) ) {
  $classes[] = $block['className'];
}
if ( ! empty( $block['align'] ) ) {
  $classes[] = 'align' . $block['align'];
}
$classes = array_map( 'sanitize_html_class', $classes );
$context['classes'] = implode( ' ', $classes );

// AFTER: trust the block's anchor if provided
$explicit_anchor = isset( $block['anchor'] ) ? trim( (string) $block['anchor'] ) : '';

if ( $explicit_anchor !== '' ) {
    // Use exactly what the editor typed (sanitized)
    $context['anchor_id'] = sanitize_title( $explicit_anchor );
} else {
    // Fallback: derive from title + short unique suffix to prevent dupes
    $title_fallback = $context['title'] ?? '';
    $slug = $title_fallback ? sanitize_title( $title_fallback ) : '';

    $unique_suffix = isset( $block['id'] )
        ? substr( preg_replace( '/[^a-z0-9]/', '', strtolower( $block['id'] ) ), -6 )
        : '';

    if ( $slug && $unique_suffix ) {
        $slug .= '-' . $unique_suffix;
    }

    $context['anchor_id'] = $slug ?: null;
}
if ( $context['title'] && $context['checkerboards'] ) {
	Timber::render( '/stories/checkerboard-section/checkerboards.twig', $context );
} else {
	echo '';
}

if ( $is_preview && ( ! $context['checkerboards'] || ! $context['title'] ) ) {
	echo '<div class="card"><p>';
	_e( 'Add title and checkerboards to this element so that it can display!', 'bc-sitka-spruce' );
	echo '</p></div>';
}
