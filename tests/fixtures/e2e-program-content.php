<?php
/**
 * Program post content enrichment for Playwright integration tests.
 *
 * @package BcSitkaSpruce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/e2e-homepage-content.php';

/**
 * @param array $core_map        Core site seed map.
 * @param int   $profile_id      Profile post ID for profiles-section wire.
 * @param int   $attachment_id   Image attachment for checkerboard and testimonial.
 * @return string
 */
function e2e_build_program_post_content( array $core_map, int $profile_id, int $attachment_id ): string {
	$content = e2e_load_pattern_markup( 'program-content-v1.php' );
	$content = e2e_wire_core_site_blocks_in_content( $content, $core_map );
	$content = e2e_wire_profiles_sections_node_select( $content, $profile_id );
	$content = e2e_populate_program_template_info( $content );
	$content = e2e_program_wire_checkerboard_section( $content, $attachment_id );
	$content = e2e_homepage_wire_testimonial_section( $content, $attachment_id );

	return $content;
}

/**
 * @param string $content         Block markup.
 * @param int    $attachment_id   Image attachment ID.
 * @return string
 */
function e2e_program_wire_checkerboard_section( string $content, int $attachment_id ): string {
	if ( $attachment_id <= 0 ) {
		return $content;
	}

	$content = str_replace(
		'"field_6733e8f04e849":""',
		'"field_6733e8f04e849":"E2E program highlights description."',
		$content
	);

	return preg_replace(
		'/"field_62ff9d4b85359_field_62ff804b719f6":""/',
		'"field_62ff9d4b85359_field_62ff804b719f6":' . $attachment_id,
		$content,
		2
	) ?? $content;
}

/**
 * @param string $content Block markup.
 * @return string
 */
function e2e_populate_program_template_info( string $content ): string {
	$content = preg_replace(
		'#<h2 class="wp-block-heading"></h2>#',
		'<h2 class="wp-block-heading">Learning Areas</h2>',
		$content,
		1
	) ?? $content;

	$content = preg_replace(
		'#<h2 class="wp-block-heading"></h2>#',
		'<h2 class="wp-block-heading">Learning Outcomes</h2>',
		$content,
		1
	) ?? $content;

	$replacement_index = 0;
	$content           = preg_replace_callback(
		'#<li></li>#',
		static function () use ( &$replacement_index ) {
			$replacement_index++;
			return $replacement_index === 1
				? '<li>E2E learning list item one.</li>'
				: '<li>E2E learning list item two.</li>';
		},
		$content,
		2
	) ?? $content;

	return $content;
}
