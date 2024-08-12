<?php



$tab_classes = array(
	'nav-link',
);

if ( $attributes['tabDefault'] ) {
	$tab_classes[] = 'active';
}


use Timber\Timber;
$context = Timber::context();

$context['title'] = $attributes['tabTitle'];
$context['active'] = $attributes['tabDefault'] ? 'active show' : '';
$context['aria_selected'] = $attributes['tabDefault'] ? 'true' : 'false';

// $wrapper_attrs = get_block_wrapper_attributes(
// 	array(
// 		'class' => 'nav-item',
// 		'role' => 'presentation',
// 	)
// );

Timber::render( '/stories/tabcordion/components/tab-list-tab.twig', $context );
