<?php


use Timber\Timber;
$context = Timber::context();

$context['structure'] = $content;


// $wrapper_attrs = get_block_wrapper_attributes(
// 	array(
// 		'class' => 'card',
// 	)
// );

Timber::render( '/stories/tabcordion/tabcordion-top-tabs.twig', $context );

