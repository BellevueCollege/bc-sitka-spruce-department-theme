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

$context['wrapper_attrs'] = get_block_wrapper_attributes(
    array(
        'class' => 'section section-white body-section-wrapper alignfull',
    )
);
error_log( 'Body Section attributes: ' . print_r( $attributes, true ) );
// Render Twig Template
Timber::render( '/stories/body-section/body-section.twig', $context );
