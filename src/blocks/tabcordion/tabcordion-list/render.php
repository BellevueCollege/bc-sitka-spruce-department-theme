<?php
use Timber\Timber;
$context = Timber::context();

$context['tab_links'] = $content;


// $wrapper_attrs = get_block_wrapper_attributes(
// 	array(
// 		'class' => 'card-header',
// 	)
// );

Timber::render( '/stories/tabcordion/components/tab-list.twig', $context );
