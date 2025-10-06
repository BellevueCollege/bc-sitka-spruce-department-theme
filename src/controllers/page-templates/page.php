<?php
use Timber\Timber;
use BcSitkaSpruce\Library\Theme;

global $post;

$context = Timber::context();

$context['breadcrumbs']  = Theme::breadcrumbs()->getItems( 2 );
$context['post']         = Timber::get_post();
$context['header_image'] = get_field( 'header_image' ) ?
	wp_get_attachment_image( get_field( 'header_image' ), 'featured-page', false, array( 'class' => 'img-fluid rounded' ) ) : null;
$context['has_header_image'] = ! empty( $context['header_image'] );
$context['intro_text']   = esc_html( get_field( 'intro_text' ) ?? '' );

// Get pages to hide from side nav
$pages_to_hide = get_posts( array(
	'posts_per_page'    => -1,
	'post_type'         => 'page',
	'fields'            => 'ids',
	'meta_query' => array(
		array(
			'key'   => 'hide_from_side_nav',
			'value' => '1',
		)
	)
) );

// Add front page to hide list if it exists
if ( get_option( 'page_on_front' ) ) {
	$pages_to_hide[] = get_option( 'page_on_front' );
}

// Implode the pages array to a comma separated string
$pages_to_hide = implode( ',', $pages_to_hide );

if ( $context['post']->post_parent > 0 ) {
	$context['parent_page']['title'] = get_the_title( $context['post']->post_parent );
	$context['parent_page']['url']   = get_permalink( $context['post']->post_parent );
	$context['context_menu']         = wp_page_menu(
		array(
			'sort_column' => 'menu_order',
			'echo'        => false,
			'child_of'    => $context['post']->post_parent,
			'exclude'     => $pages_to_hide,
			'depth'       => 2,
		)
	);
} else {
	// Get homepage URL instead
	$context['parent_page']['url']   = home_url();
	$context['parent_page']['title'] = __( 'Home', 'bc-sitka-spruce' );
	$context['context_menu']         = wp_page_menu(
		array(
			'sort_column' => 'menu_order',
			'echo'        => false,
			'depth'       => 2,
			'exclude'     => $pages_to_hide,
		)
	);
}


Timber::render( 'content/page.twig', $context );
