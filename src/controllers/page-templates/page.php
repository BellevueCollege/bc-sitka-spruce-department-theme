<?php
use Timber\Timber;

$context = Timber::context();
$context['post'] = Timber::get_post();
$context['header_image'] = get_field( 'header_image' ) ?
	wp_get_attachment_image( get_field( 'header_image' ), 'full', false, array( 'class' => 'img-fluid rounded' ) ) : null;
$context['intro_text'] = get_field( 'intro_text' );
Timber::render( 'content/page.twig', $context );
