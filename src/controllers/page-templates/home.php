<?php
/*
Blog Home
*/
use Oho\Views\Filter\ExposedFilter\Taxonomy\TaxonomySelectExposedFilter;

use Oho\Views\FilterGroup\AndFilterGroup;
use Oho\Views\FilterGroup\FilterGroupBase;
use Oho\Views\View;
use Oho\Views\FilterContainer\FilterContainer;
use Oho\Views\ViewType\PostView;
use Timber\Timber;
use BcSitkaSpruce\Library\Theme;


$context                 = Timber::context();
$context['post']         = Timber::get_post();
$context['listing']      = build_post_listing();
$context['acf']          = get_fields();
$context['breadcrumbs']  = Theme::breadcrumbs()->getItems( 2 );
$context['intro_text']   = esc_html( get_field( 'intro_text' ) ?? '' );


Timber::render( 'content/home.twig', $context );

function build_post_listing() {
	$post_view = new PostView(
		'post-listing',
		'post',
		'subcomponents/post-list-element.twig',
	);

	// TODO: Should sort on date! probably addColumnSortOrder
	// $post_view->addMetaSortOrder( 'pin_profile_in_listing', 'DESC' );
	// $post_view->addMetaSortOrder( 'last_name', 'ASC' );
	// $post_view->addMetaSortOrder( 'first_name', 'ASC' );


	$category_filter = new TaxonomySelectExposedFilter(
		'category',
		__( 'Category', 'bc-sitka-spruce' ),
	);
	$category_filter->addAllOption( __( 'All Categories', 'bc-sitka-spruce' ) );


	//$profile_type_filter->addAllOption(__('All Types', 'bc-sitka-spruce'));

	$taxonomy_filters = new AndFilterGroup();
	$taxonomy_filters
		->addFilter( 'category', $category_filter );

	$view_filters = new FilterContainer();
	$view_filters
		->addTaxonomyFilterGroup( $taxonomy_filters );

	$posts = new View( $post_view );
	$posts->addViewFilters( $view_filters );

	$post_listing = $posts->render();

	return $post_listing;
}







// Basic page rendering from full-width template. Should be integrated with other code.
// global $post;

// $context = Timber::context();

// $context['breadcrumbs']  = Theme::breadcrumbs()->getItems( 2 );
// $context['post']         = Timber::get_post();
// //$context['header_image'] = get_field( 'header_image' ) ?
// 	// wp_get_attachment_image( get_field( 'header_image' ), 'full', false, array( 'class' => 'img-fluid rounded' ) ) : null;
// $context['intro_text']   = esc_html( get_field( 'intro_text' ) ?? '' );


// Timber::render( 'content/home.twig', $context );
