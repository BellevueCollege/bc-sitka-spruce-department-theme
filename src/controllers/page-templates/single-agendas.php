<?php
/**
 * Single Template for Agendas
 */

$context = Timber::context();
$timber_post = Timber::get_post();
$context['post'] = $timber_post;
$loader = new Timber\Loader();

// Render twig
Timber::render( 'content/single-agendas.twig', $context );