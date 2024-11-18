<?php
use Timber\Timber;

$context = Timber::context();

// Rich Text Fields
$context['title']   = esc_html( $attributes['title'] ?? '' );
$context['content'] = $content ?? '';
$context['image']   = $attributes['imageId'] ? wp_get_attachment_image( $attributes['imageId'], 'listing-section', false, array( 'class' => 'img-fluid rounded' ) ) : null;

// Render Twig Template
Timber::render( '/stories/listing-section/list-item.twig', $context );
