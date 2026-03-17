<?php
/**
 * Single Template for Action Items
 */

$context = Timber::context();
$timber_post = Timber::get_post();
$context['post'] = $timber_post;

// Render twig
Timber::render( 'content/single-resolution.twig', $context );