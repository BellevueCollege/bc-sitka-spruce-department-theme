<?php
use Timber\Timber;
use BcSitkaSpruce\Controllers\Program;

$context = Timber::context();
$context['content']          = $content;

if ( ! array_key_exists( 'post', $context ) ) {
	return '';
}

$program = Program::get_single_from_core_by_title( $context['post']->post_title );

if ( ! $program ) {
	echo '<p class="alert alert-danger container">' . __( 'Warning: Program not found in the main Program Directory. Please report this to the website manager.', 'bc-sitka-spruce' ) . '</p>';
	return;
}
// Render Twig Template
Timber::render( '/stories/program-info/program-info.twig', array_merge( $context, $program ) ); // Merge in the content from the core
