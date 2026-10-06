<?php
/**
 * Strip block markup from pattern content for e2e seeds.
 *
 * @package BcSitkaSpruce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Remove a block (self-closing or wrapped) from serialized post content.
 *
 * @param string $content   Block markup.
 * @param string $block_name Block name without wp: prefix (e.g. bc-sitka-spruce/foo).
 * @return string
 */
function e2e_strip_block_from_content( string $content, string $block_name ): string {
	$escaped = preg_quote( $block_name, '#' );

	$content = preg_replace(
		'#<!-- wp:' . $escaped . ' \{.*?\} /-->\s*#s',
		'',
		$content
	);

	$content = preg_replace(
		'#<!-- wp:' . $escaped . ' \{.*?\} -->\s*.*?<!-- /wp:' . $escaped . ' -->\s*#s',
		'',
		$content
	);

	return $content;
}

/**
 * Load pattern markup from patterns/*.php (content after the first ?>).
 *
 * @param string $pattern_basename Filename under patterns/ (e.g. page-homepage-dept-v1.php).
 * @return string
 */
function e2e_load_pattern_markup( string $pattern_basename ): string {
	$path = get_stylesheet_directory() . '/patterns/' . $pattern_basename;
	if ( ! is_readable( $path ) ) {
		return '';
	}

	$raw = file_get_contents( $path );
	$parts = explode( '?>', $raw, 2 );

	return isset( $parts[1] ) ? trim( $parts[1] ) : '';
}

/**
 * Homepage pattern content without core-site or Gravity Forms blocks.
 *
 * @param string $pattern_basename Pattern file name.
 * @return string
 */
function e2e_homepage_pattern_for_seed( string $pattern_basename ): string {
	$content = e2e_load_pattern_markup( $pattern_basename );

	$strip_blocks = array(
		'bc-sitka-spruce/differentiator-section',
		'bc-sitka-spruce/differentiator',
		'bc-sitka-spruce/degrees-certificates-section',
		'bc-sitka-spruce/support-feature',
		'bc-sitka-spruce/department-feature',
		'bc-sitka-spruce/news-feature-core',
		'gravityforms/form',
	);

	foreach ( $strip_blocks as $block_name ) {
		$content = e2e_strip_block_from_content( $content, $block_name );
	}

	return $content;
}

/**
 * Remove the editor-only Mayflower alert that tells authors to delete setup instructions.
 *
 * @param string $content Block markup.
 * @return string
 */
function e2e_strip_editor_setup_alert( string $content ): string {
	$stripped = preg_replace(
		'#<!-- wp:mayflower-blocks/alert \{.*?\} -->\s*.*?Setup Instructions:.*?<!-- /wp:mayflower-blocks/alert -->\s*#s',
		'',
		$content
	);

	return is_string( $stripped ) ? $stripped : $content;
}
