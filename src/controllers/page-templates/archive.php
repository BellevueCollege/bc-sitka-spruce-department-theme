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

$context['post']['title'] = get_the_archive_title();
$context['intro_text']    = category_description();
$context['breadcrumbs']  = Theme::breadcrumbs()->getItems( 2 );

// Build options for date filter
$context['date_filter_options'] = PostFilters::get_archives_as_options();

// Build options for category filter
$context['category_filter_options'] = PostFilters::get_categories_as_options();

$context['post_home_url'] = get_post_type_archive_link('post');

// Render Twig Template
Timber::render( 'content/home.twig', $context );
