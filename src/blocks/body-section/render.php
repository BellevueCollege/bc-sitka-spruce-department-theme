<?php
use Timber\Timber;
/**
 * Render callback for Body Section block.
 *
 * @param array     $attributes Block attributes.
 * @param string    $content    Block content (inner blocks).
 * @param WP_Block  $block      Block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$context = Timber::context();

$context['content'] = $content;

// Get anchor from attributes 
$anchor = '';
if ( isset( $attributes['anchor'] ) && $attributes['anchor'] !== '' ) {
	$anchor = sanitize_title( $attributes['anchor'] );
}

$wrapper_attrs = array(
	'class' => 'section section-white body-section-wrapper alignfull',
);

// Force the ID if anchor exists.
if ( $anchor ) {
	$wrapper_attrs['id'] = $anchor;
}

$context['wrapper_attrs'] = get_block_wrapper_attributes( $wrapper_attrs );

// Render Twig Template
Timber::render( '/stories/body-section/body-section.twig', $context );
