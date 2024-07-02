<?php
namespace BcSitkaSpruce\Controllers;

class Differentiator {
	
	public static function get_post_data( $id ) {
		if ( ! $id ) {
			return;
		}
	
		$post = get_post( $id );
	
		if ( ! $post ) {
			return;
		}
	
		$differentiator_top = get_field( 'top', $id );
		
	
		$output =  [
			'top_layout' => $differentiator_top[0]['acf_fc_layout'] ?? null,
			'top_text' => $differentiator_top[0]['text'] ?? null,
			'top_superscript' => $differentiator_top[0]['superscript'] ?? null,
			'top_icon' => $differentiator_top[0]['icon'] ?? null,
			'top_image' => isset($differentiator_top[0]['image']['ID']) ? wp_get_attachment_image( $differentiator_top[0]['image']['ID'], ['580', '322'] ) : null,
			'title' => get_field( 'title', $id ),
			'text' => get_field( 'text', $id ),
			'link' => get_field( 'link', $id ),
		];
	
		return $output;
	}

	public static function get_post_data_from_site( $id, $site_id = null ) {
		$differentiator;
		$site_id = $site_id ?? get_main_site_id();

		// Get Differentiators from Core Site
		switch_to_blog( $site_id );
			$differentiator = self::get_post_data( id: $id );
		restore_current_blog();

		return $differentiator;
	}
}