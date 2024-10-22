<?php
/*
Template Name: Profile Listing
*/
use Oho\Views\Filter\ExposedFilter\Search\SearchExposedFilter;
use Oho\Views\Filter\ExposedFilter\Taxonomy\TaxonomySelectExposedFilter;
use Oho\Views\Filter\ExposedFilter\Taxonomy\TaxonomyCheckboxExposedFilter;
use Oho\Views\Filter\ExposedFilter\Taxonomy\TaxonomyRadioExposedFilter;

use Oho\Views\FilterGroup\AndFilterGroup;
use Oho\Views\FilterGroup\OrFilterGroup;
use Oho\Views\FilterGroup\FilterGroupBase;
use Oho\Views\View;
use Oho\Views\FilterContainer\FilterContainer;
use Oho\Views\ViewType\PostView;
use Timber\Timber;

$context = Timber::context();
$context['post'] = Timber::get_post();
$context['listing'] = build_profile_listing();
$context['acf'] = get_fields();

Timber::render( 'content/page--profile-listing.twig', $context );

function build_profile_listing() {
	$profiles_post_view = new PostView(
		'profile-listing',
		'profile',
		'subcomponents/profile-list-element.twig',
	);

	$profiles_post_view->addMetaSortOrder('pin_profile_in_listing', 'DESC');
	$profiles_post_view->addMetaSortOrder('last_name', 'ASC');
	$profiles_post_view->addMetaSortOrder('first_name', 'ASC');

	$search_filter = new SearchExposedFilter(
		__('Search by Name', 'bc-sitka-spruce'),
		__('Search All...', 'bc-sitka-spruce'),
	);

	$department_filter = new TaxonomySelectExposedFilter(
		'department',
		__('Office or Department', 'bc-sitka-spruce'),
	);
	$department_filter->addAllOption(__('All Offices and Departments', 'bc-sitka-spruce'));

	$profile_type_filter = new TaxonomyCheckboxExposedFilter( // this should be checkboxes, but they aren't working as expected
		'profile_type',
		__('Profile Type', 'bc-sitka-spruce'),
		'profile_type',
		'IN',
	);
	//$profile_type_filter->addAllOption(__('All Types', 'bc-sitka-spruce'));

	$taxonomy_filters = new AndFilterGroup();
	$taxonomy_filters
		->addFilter('department', $department_filter)
		->addFilter('profile-type', $profile_type_filter);

	$view_filters = new FilterContainer();
	$view_filters
		->addTaxonomyFilterGroup($taxonomy_filters)
		->addSpecialFilter('search', $search_filter);


	$profiles_view = new View( $profiles_post_view );
	$profiles_view->addViewFilters( $view_filters );

	$profile_listing = $profiles_view->render();

	return $profile_listing;
}
