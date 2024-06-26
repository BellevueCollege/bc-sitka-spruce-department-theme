<?php
$context = Timber::context();

$context['assetPath'] = get_template_directory_uri() . '/assets';
$context['wrapperAtts'] = get_block_wrapper_attributes();

Timber::render( get_template_directory() . '/stories/bc-brand-bar/bc-brand-bar.twig', $context );