<?php
use Timber\Timber;

$context                   = Timber::context();
$context['post']           = Timber::get_post();
$hero_image                = get_field( 'hero_image', $context['post']->ID );
$context['featured_image'] = $hero_image ?
	wp_get_attachment_image( $hero_image['ID'], 'featured-home-div-lg', '', array( 'class' => 'img-fluid' ) )
	: '';
Timber::render( 'content/front-page.twig', $context );
