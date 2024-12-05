<?php
/*
Template Name: No Navigation Sidebar
*/
use Timber\Timber;
use BcSitkaSpruce\Library\Theme;

global $post;

$context = Timber::context();

$context['breadcrumbs']  = Theme::breadcrumbs()->getItems( 2 );
$context['post']         = Timber::get_post();
$context['header_image'] = get_field( 'header_image' ) ?
	wp_get_attachment_image( get_field( 'header_image' ), 'full', false, array( 'class' => 'img-fluid rounded' ) ) : null;
$context['intro_text']   = esc_html( get_field( 'intro_text' ) ?? '' );


Timber::render( 'content/page--no-sidebar.twig', $context );
