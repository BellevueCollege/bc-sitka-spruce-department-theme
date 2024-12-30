<?php
use BcSitkaSpruce\Controllers\Department;
use Timber\Timber;
$context                  = Timber::context();
$context['heading']       = esc_html( $attributes['title'] );
$context['subheading']    = esc_html( $attributes['description'] );
$context['link_custom']       = $attributes['linkTitle'] && $attributes['linkUrl'] ? array(
	'title' => html_entity_decode( esc_html( $attributes['linkTitle'] ) ), // This appears to be escaped elsewhere, and adding additional escaping here causes issues
	'url'   => esc_url( $attributes['linkUrl'] ),
) : null;
$context['department_id'] = esc_attr( $attributes['departmentId'] );
$dept                     = Department::get_single_from_core( $attributes['departmentId'] );
$context                  = is_array( $dept ) ? array_merge( $context, Department::get_single_from_core( $attributes['departmentId'] ) ) : $context; // Merge in the content from the core

if ( $context['department_id'] ) {
	Timber::render( '/stories/department-feature/department-feature.twig', $context );
} else {
	return '';
}
