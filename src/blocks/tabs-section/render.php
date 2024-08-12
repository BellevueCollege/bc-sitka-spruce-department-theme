<?php

use Timber\Timber;
$context = Timber::context();
$context['title'] = $attributes['title'];
$context['description'] = $attributes['description'];
$context['tabs'] = $content;
if ( '' !== $attributes['linkUrl' ] ) {
	$context['link_custom']['title'] = $attributes['linkTitle'];
	$context['link_custom']['url'] = $attributes['linkUrl'];
}

Timber::render( '/stories/tabs-section/tabs-section.twig', $context );
