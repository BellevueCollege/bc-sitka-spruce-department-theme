<?php
use BcSitkaSpruce\Controllers\Differentiator;
use Timber\Timber;

if ( ! isset( $attributes['differentiatorPostId'] ) ) {
	return;
}

$context                = Timber::context();
$context['assetPath']   = get_template_directory_uri() . '/assets';
$context['wrapperAtts'] = get_block_wrapper_attributes();

$content = Differentiator::get_single_from_core(
	$attributes['differentiatorPostId']
);

if ( ! is_array( $content ) || ! isset( $content ) ) {
	return;
}

$context += $content;

// Render Twig Template
Timber::render( get_template_directory() . '/stories/differentiators/differentiator.twig', $context );
