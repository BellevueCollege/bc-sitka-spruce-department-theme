<?php

use Timber\Timber;
$context = Timber::context();

$context['panels'] = $content;

Timber::render( '/stories/tabcordion/components/content.twig', $context );
