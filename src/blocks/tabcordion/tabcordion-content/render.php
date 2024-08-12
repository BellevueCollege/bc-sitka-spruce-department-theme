<?php

use Timber\Timber;
$context = Timber::context();

$context['panels'] = $content;

// $wrapper_attrs = get_block_wrapper_attributes(
// 	array(
// 		'class' => 'card-body tab-content',
// 	)
// );

Timber::render( '/stories/tabcordion/components/content.twig', $context );
