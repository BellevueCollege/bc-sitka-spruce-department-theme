<?php
use Timber\Timber;
use BcSitkaSpruce\Library\Theme;
use BcSitkaSpruce\Controllers\Program;


$context                     = Timber::context();
$context['post']             = Timber::get_post();
$context['breadcrumbs']      = Theme::breadcrumbs()->getItems( 2 );
$related_program_data        = get_posts(
	array(
		'post_type'      => 'program',
		'posts_per_page' => -1,
		'exclude'        => $context['post']->ID,
	)
);
$context['related_programs'] = array_map(
	function ( $program ) {
		$core_data = Program::get_single_from_core_by_title( $program->post_title );
		return array_merge( $core_data, array( 'url' => get_permalink( $program->ID ) ) );
	},
	$related_program_data
);

Timber::render( 'content/single-program.twig', $context );
