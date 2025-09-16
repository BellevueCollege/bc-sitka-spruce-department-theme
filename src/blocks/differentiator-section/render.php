<?php
use Timber\Timber;

if ( ! isset( $content ) ) {
    return;
}

$context = Timber::context();
$context['title']       = esc_html( $attributes['title'] ?? '' );
$context['description'] = wp_kses_post( $attributes['description'] ?? '' );
$context['content']     = $content;

// Set anchor from attribute (or slug of title as fallback)
$anchor = '';
if ( ! empty( $attributes['anchor'] ) ) {
    $anchor = sanitize_title( (string) $attributes['anchor'] );
} elseif ( ! empty( $context['title'] ) ) {
    $anchor = sanitize_title( (string) $context['title'] );
}
$context['anchor'] = $anchor; ///fallback

//Optional: aria-labelledby id for h2
$context['heading_id'] = $anchor ? $anchor . '-heading' : ''; 

// wrapping attributes WP/proper way for custom classes (& anchor)
$classes = 'section section-rainy-night-blue diffs curved-top alignfull';
$wrapper = get_block_wrapper_attributes( [ 'class' => $classes ] );
$context['wrapper_attributes'] = $wrapper;
//so Twig can add an `id` only if WP didn’t
$context['wrapper_has_id'] = (strpos($wrapper, ' id=') !== false);

/* // Building a stable heading id for aria-labelledby (optional)
$anchor = $attributes['anchor'] ?? '';
if ( ! $anchor && ! empty( $context['title'] ) ) {
    $anchor = sanitize_title( (string) $context['title'] );
} */

//let WP output attributes
if ( ! empty( $attributes['linkTitle'] ) && ! empty( $attributes['linkUrl'] ) ) {
    $context['link_custom'] = [
        'title' => html_entity_decode( esc_html( $attributes['linkTitle'] ) ),
        'url'   => esc_url( $attributes['linkUrl'] ),
    ];
}

// Render Twig Template
Timber::render( '/stories/differentiators/differentiators.twig', $context );
