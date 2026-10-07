<?php
/**
 * Wire core-site block attributes using the main-site seed map.
 *
 * @package BcSitkaSpruce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Option key on the main site storing core post IDs for e2e. */
const E2E_CORE_SEED_OPTION = 'bc_sitka_e2e_core_seed';

/** Shared program title between main-site core seed and subsite local program posts. */
const E2E_CORE_PROGRAM_TITLE = 'E2E Program Alpha';

/**
 * Load the core seed map from the main site.
 *
 * @return array<string, mixed>
 */
function e2e_get_core_seed_map(): array {
	if ( ! is_multisite() ) {
		$map = get_option( E2E_CORE_SEED_OPTION, array() );
		return is_array( $map ) ? $map : array();
	}

	$main_site_id = get_main_site_id();
	switch_to_blog( $main_site_id );
	$map = get_option( E2E_CORE_SEED_OPTION, array() );
	restore_current_blog();

	return is_array( $map ) ? $map : array();
}

/**
 * Inject core post IDs into serialized block markup.
 *
 * @param string               $content Block markup.
 * @param array<string, mixed> $map     Core seed map.
 * @return string
 */
function e2e_wire_core_site_blocks_in_content( string $content, array $map ): string {
	if ( empty( $map ) ) {
		return $content;
	}

	if ( ! empty( $map['organizationId'] ) ) {
		$content = e2e_set_block_attribute(
			$content,
			'bc-sitka-spruce/department-feature',
			'departmentId',
			(int) $map['organizationId']
		);
	}

	if ( ! empty( $map['newsStoryId'] ) ) {
		$content = e2e_set_block_attribute(
			$content,
			'bc-sitka-spruce/news-feature-core',
			'largeStoryId',
			(int) $map['newsStoryId']
		);
	}

	if ( ! empty( $map['newsTypeId'] ) ) {
		$content = e2e_set_block_attribute(
			$content,
			'bc-sitka-spruce/news-feature-core',
			'smallStoryTypes',
			array( (int) $map['newsTypeId'] )
		);
	}

	if ( ! empty( $map['identitySupportId'] ) ) {
		$content = e2e_set_block_attribute(
			$content,
			'bc-sitka-spruce/support-feature',
			'supportPosts',
			array( (int) $map['identitySupportId'] )
		);
	}

	if ( ! empty( $map['differentiatorIds'] ) && is_array( $map['differentiatorIds'] ) ) {
		$index = 0;
		$content = preg_replace_callback(
			'#<!-- wp:bc-sitka-spruce/differentiator(?:\s+\{.*?\})?\s*/-->#s',
			static function ( $matches ) use ( $map, &$index ) {
				$ids = $map['differentiatorIds'];
				if ( ! isset( $ids[ $index ] ) ) {
					return $matches[0];
				}
				$post_id = (int) $ids[ $index ];
				$index++;
				return '<!-- wp:bc-sitka-spruce/differentiator {"differentiatorPostId":' . $post_id . '} /-->';
			},
			$content
		) ?? $content;
	}

	return is_string( $content ) ? $content : '';
}

/**
 * Merge or set a single block attribute in serialized markup.
 *
 * @param string $content    Block markup.
 * @param string $block_name Block name without wp: prefix.
 * @param string $attribute  Attribute key.
 * @param mixed  $value      Attribute value.
 * @return string
 */
function e2e_set_block_attribute(
	string $content,
	string $block_name,
	string $attribute,
	mixed $value
): string {
	$escaped = preg_quote( $block_name, '#' );
	$pattern = '#<!-- wp:' . $escaped . '(?:\s+(\{.*?\}))?\s*/-->#s';

	return preg_replace_callback(
		$pattern,
		static function ( $matches ) use ( $block_name, $attribute, $value ) {
			$attributes = array();
			if ( ! empty( $matches[1] ) ) {
				$decoded = json_decode( $matches[1], true );
				if ( is_array( $decoded ) ) {
					$attributes = $decoded;
				}
			}
			$attributes[ $attribute ] = $value;
			$json                     = wp_json_encode( $attributes );
			return '<!-- wp:' . $block_name . ' ' . $json . ' /-->';
		},
		$content,
		1
	) ?? $content;
}

/**
 * Attach local program posts to empty degrees block segment rows (in order).
 *
 * @param string $content     Block markup.
 * @param int[]  $program_ids Local program post IDs.
 * @return string
 */
function e2e_wire_degrees_block_programs( string $content, array $program_ids ): string {
	foreach ( $program_ids as $program_id ) {
		$program_id = (int) $program_id;
		if ( $program_id <= 0 ) {
			continue;
		}

		$encoded_ids = wp_json_encode( array( $program_id ) );
		$content     = preg_replace(
			'/"field_671a706dffac6":""/',
			'"field_671a706dffac6":' . $encoded_ids,
			$content,
			1
		) ?? $content;
	}

	return $content;
}

/**
 * Attach a local program post to the degrees block segment (first row).
 *
 * @param string $content    Block markup.
 * @param int    $program_id Local program post ID.
 * @return string
 */
function e2e_wire_degrees_block_program( string $content, int $program_id ): string {
	return e2e_wire_degrees_block_programs( $content, array( $program_id ) );
}

/**
 * Inject profile taxonomy selectors into profiles-section block JSON.
 *
 * @param string $content              Block markup.
 * @param int    $department_term_id   `department` term ID.
 * @param int    $profile_type_term_id `profile_type` term ID.
 * @return string
 */
function e2e_wire_profiles_sections_in_content(
	string $content,
	int $department_term_id,
	int $profile_type_term_id
): string {
	if ( $department_term_id <= 0 || $profile_type_term_id <= 0 ) {
		return $content;
	}

	$department_json    = wp_json_encode( array( $department_term_id ) );
	$profile_type_json  = wp_json_encode( array( $profile_type_term_id ) );

	$content = preg_replace(
		'/"field_67181a0cebcad":""/',
		'"field_67181a0cebcad":' . $department_json,
		$content
	) ?? $content;

	$content = preg_replace(
		'/"field_67181b0c4e673":""/',
		'"field_67181b0c4e673":' . $profile_type_json,
		$content
	) ?? $content;

	return $content;
}

/**
 * Wire profiles-section repeater rows to manually selected profiles (node mode).
 *
 * @param string $content    Block markup.
 * @param int    $profile_id Profile post ID.
 * @return string
 */
function e2e_wire_profiles_sections_node_select( string $content, int $profile_id ): string {
	if ( $profile_id <= 0 ) {
		return $content;
	}

	$profiles_json = wp_json_encode( array( $profile_id ) );
	$node_row      = '"field_6718186dcf4ee":"node","field_67181986c01c6":' . $profiles_json;

	$content = preg_replace(
		'/"field_6718186dcf4ee":"taxonomy","field_67181a0cebcad":(?:\[\d+\]|""|\d+),"field_67181b0c4e673":(?:\[\d+\]|""|\d+)/',
		$node_row,
		$content
	) ?? $content;

	return $content;
}
