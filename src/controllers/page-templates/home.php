<?php
/*
Blog Home
*/

use Timber\Timber;
use BcSitkaSpruce\Library\Theme;
use BcSitkaSpruce\Controllers\PostFilters;



//Basic page rendering from full-width template. Should be integrated with other code.
global $post;

$context = Timber::context();

$context['breadcrumbs']  = Theme::breadcrumbs()->getItems( 2 );
$context['header_image'] = get_field( 'header_image' ) ?
	wp_get_attachment_image( get_field( 'header_image' ), 'featured-page', false, array( 'class' => 'img-fluid rounded' ) ) : null;
$context['intro_text']   = esc_html( get_field( 'intro_text' ) ?? '' );

// Build options for date filter
$context['date_filter_options'] = PostFilters::get_archives_as_options();

// Build options for category filter
$context['category_filter_options'] = PostFilters::get_categories_as_options();

$context['page_heading'] = __('All Posts', 'bc-sitka-spruce');

Timber::render( 'content/home.twig', $context );
