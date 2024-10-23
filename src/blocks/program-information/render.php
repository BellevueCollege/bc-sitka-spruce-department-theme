<?php
use Timber\Timber;
use BcSitkaSpruce\Controllers\Program;

$context = Timber::context();
$context['content']          = $content;

if ( ! array_key_exists( 'post', $context ) ) {
	return '';
}

$program = Program::get_single_from_core_by_title( $context['post']->post_title );

// Render Twig Template
Timber::render( '/stories/program-introduction/program-introduction.twig', array_merge( $context, $program ) ); // Merge in the content from the core
