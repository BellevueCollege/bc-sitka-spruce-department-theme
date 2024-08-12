<?php

use Timber\Timber;
$context = Timber::context();
$context['title'] = $attributes['title'];
$context['description'] = $attributes['description'];
$context['content'] = $content;

Timber::render( '/stories/application-steps/application-steps.twig', $context );
