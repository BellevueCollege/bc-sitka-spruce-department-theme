<?php
use BcSitkaSpruce\Controllers\SupportFeature;
use Timber\Timber;
$context                      = Timber::context();
$context['heading']           = esc_html( $attributes['heading'] );
$context['parent_id']                = esc_attr( $attributes['sectionId'] );
$context['wrapper_attrs'] = get_block_wrapper_attributes(
	array(
		'class' => 'row tabcordion tabcordion-list',
		'id'    => esc_attr( $attributes['sectionId'] ),
	)
);

$context['tabs'] = SupportFeature::get_posts_from_core( $attributes['supportPosts'] );

if ( true ) {
	Timber::render( '/stories/support-feature/support-feature.twig', $context );
} else {
	return '';
}
