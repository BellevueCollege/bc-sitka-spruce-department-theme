<?php

use Timber\Timber;
use BcSitkaSpruce\Controllers\Program;

$context = Timber::context();

$context['title']        = esc_html( get_field( 'title' ) ?? '' );
$context['description']  = wp_kses_post( get_field( 'description' ) ?? '' );
$context['segments']     = get_field( 'segments' ) ? array_map( function ( $segment ) {
	$segment['programs'] = $segment['programs'] ? array_map( function ( $program ) {
		$local_program_title        = get_the_title( $program );
		$core_program_data          = Program::get_single_from_core_by_title( $local_program_title );
		$core_program_data['title'] = esc_html( $core_program_data['short_name'] ?? '' );
		$core_program_data['url']   = esc_url( get_permalink( $program ) ?? '' );
		return $core_program_data;
	}, $segment['programs'] ) : array();

	return $segment;
}, get_field( 'segments' ) ) : array();

$context['anchor'] = (isset($block['anchor']) && $block['anchor'])
	? sanitize_title($block['anchor']) : '';

$hasContent = (bool) $context['title'];

if ( $hasContent ) {
	Timber::render( '/stories/degrees-certificates-section/degrees-certificates-section.twig', $context );
} elseif ( $is_preview ) {
	Timber::render( '/stories/atoms/block-empty-state/block-empty-state.twig', array(
		'block_name'   => __( 'Degrees Certificates Section', 'bc-sitka-spruce' ),
		'instructions' => __( 'Select this element, then use the Settings sidebar to add content to this element so that it can display!', 'bc-sitka-spruce' ),
	) );
}
