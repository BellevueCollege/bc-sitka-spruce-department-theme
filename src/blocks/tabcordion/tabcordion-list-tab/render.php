<?php



$tab_classes = array(
	'nav-link',
);

if ( $attributes['tabDefault'] ) {
	$tab_classes[] = 'active';
}


use Timber\Timber;
$context = Timber::context();

$context['title']         = esc_html( $attributes['tabTitle'] ?? '' );
$context['active']        = $attributes['tabDefault'] ? 'active show' : '';
$context['aria_selected'] = $attributes['tabDefault'] ? 'true' : 'false';

Timber::render( '/stories/tabcordion/components/tab-list-tab.twig', $context );
