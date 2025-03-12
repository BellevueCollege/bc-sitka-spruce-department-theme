<?php
namespace BcSitkaSpruce\Controllers;

class PostFilters {

	static function get_archives_as_options() {
		return wp_get_archives( array(
			'type' => 'monthly',
			'format' => 'option',
			'show_post_count' => true,
			'echo' => false
		));
	}

	static function get_categories_as_options() {
		$categories_raw = get_categories();
		$category_options_array = array_map( function ( $category ) {
			$url = get_category_link( $category->term_id );
			$selected = get_queried_object_id() === $category->term_id ? 'selected="selected"' : '';
			return '<option value="' . $url . '" ' . $selected . '>' . $category->name . '</option>';
		}, $categories_raw );
		return implode( '', $category_options_array );
	}
}
