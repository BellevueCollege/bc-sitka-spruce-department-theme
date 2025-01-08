<?php

use Timber\Timber;
$context                = Timber::context();
$context['title']       = esc_html( $attributes['title'] ?? '' );
$context['description'] = wp_kses_post( $attributes['description'] ?? '' );
$context['content']     = $content;

Timber::render( '/stories/application-steps/application-steps.twig', $context );
