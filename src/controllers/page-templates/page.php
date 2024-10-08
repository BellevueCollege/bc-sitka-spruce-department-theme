<?php
use Timber\Timber;
global $post;
$context = Timber::context();
$context['post'] = Timber::get_post();
$context['header_image'] = get_field( 'header_image' ) ?
	wp_get_attachment_image( get_field( 'header_image' ), 'full', false, array( 'class' => 'img-fluid rounded' ) ) : null;
$context['intro_text'] = get_field( 'intro_text' );


if ( $context['post']->post_parent > 0 ) {
	$context['parent_page']['title'] = get_the_title( $context['post']->post_parent );
	$context['parent_page']['url']   = get_permalink( $context['post']->post_parent );
	$context['context_menu'] = wp_page_menu(
		array(
			'sort_column' => 'menu_order',
			'echo'        => false,
			'child_of'    => $context['post']->post_parent,
			'depth'       => 2,
		)
	);
} else {
	// Get homepage URL instead
	$context['parent_page']['url'] = home_url();
	$context['parent_page']['title'] = __( 'Home', 'bc-sitka-spruce' );
	$context['context_menu'] = wp_page_menu(
		array(
			'sort_column' => 'menu_order',
			'echo'        => false,
			'depth'       => 2,
		)
	);
}


Timber::render( 'content/page.twig', $context );
