<?php
use Timber\Timber;

$context = Timber::context();

// Rich Text Fields
$context['title']   = $attributes['title'] ?? '';
$context['content'] = $content ?? '';
$context['image']   = wp_get_attachment_image( $attributes['imageId'], 'listing-section', false, array( 'class' => 'img-fluid rounded' ) );

// Render Twig Template
Timber::render( '/stories/listing-section/list-item.twig', $context );
