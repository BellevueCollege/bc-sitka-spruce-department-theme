<?php
use Timber\Timber;
use BcSitkaSpruce\Controllers\Program;


$context                     = Timber::context();
$context['post']             = Timber::get_post();

$breadcrumb_parent = get_field( 'program_parent', 'options' ) ?? null;
if ( $breadcrumb_parent ) {
	$context['breadcrumbs']      = array(
		'<a href="' . get_the_permalink( $breadcrumb_parent ) . '">' . get_the_title( $breadcrumb_parent ) . '</a>',
		get_the_title( $context['post']->ID ),
	);
}

$related_program_data        = get_posts(
	array(
		'post_type'      => 'program',
		'posts_per_page' => -1,
		'exclude'        => $context['post']->ID,
	)
);
$context['related_programs'] = array_map(
	function ( $program ) {
		$core_data = Program::get_single_from_core_by_title( $program->post_title ) ?? array();
		return array_merge( $core_data, array( 'url' => get_permalink( $program->ID ) ) );
	},
	$related_program_data
);

Timber::render( 'content/single-program.twig', $context );
