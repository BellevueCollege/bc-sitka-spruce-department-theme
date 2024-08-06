<?php

use Timber\Timber;
$context = Timber::context();

$context['content'] = $content;
$context['title'] = $attributes['tabTitle'];
$context['active'] = $attributes['tabDefault'] ? 'active show' : '';
$context['parent_id'] = $block->context['bc-sitka-spruce/tabcordion/blockId'];

// $wrapper_attrs = get_block_wrapper_attributes(
// 	array(
// 		'role' => 'tabpanel',
// 		'aria-labelledby' => 'tab_link_' . $attributes['tabId'],
// 		'class' => 'tab-pane fade ' . ( $attributes['tabDefault'] ? ' active show' : '' ),
// 		'id' => 'tab_' . $attributes['tabId'],
// 	)
// );

Timber::render( '/stories/tabcordion/components/content-panel.twig', $context );
