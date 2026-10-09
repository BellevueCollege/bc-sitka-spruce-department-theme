<?php
/**
 * Publish pages with a single block for frontend e2e tests (no editor boot).
 *
 * Reads tests/fixtures/.e2e-block-seed-request.json written by Playwright wp-cli helper.
 *
 * @package BcSitkaSpruce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/e2e-query-helpers.php';

/**
 * @param string               $variant_key Variant key from the seed request.
 * @param string               $block_name  Block name.
 * @param array<string, mixed> $attributes  Block attributes.
 * @return array{pageUrl: string}
 */
function e2e_publish_block_frontend_page(
	string $variant_key,
	string $block_name,
	array $attributes
): array {
	$page_title = 'E2E Block Frontend — ' . $block_name . ' — ' . $variant_key;

	$existing = e2e_get_post_by_title( $page_title, 'page' );
	if ( $existing ) {
		wp_delete_post( $existing->ID, true );
	}

	$block = array(
		'blockName'    => $block_name,
		'attrs'        => $attributes,
		'innerBlocks'  => array(),
		'innerHTML'    => '',
		'innerContent' => array(),
	);

	$page_id = wp_insert_post(
		array(
			'post_title'   => $page_title,
			'post_status'  => 'publish',
			'post_type'    => 'page',
			'post_content' => serialize_block( $block ),
		),
		true
	);

	if ( is_wp_error( $page_id ) ) {
		echo wp_json_encode(
			array(
				'error' => $page_id->get_error_message(),
			)
		);
		exit( 1 );
	}

	return array(
		'pageUrl' => (string) get_permalink( $page_id ),
	);
}

$theme_slug   = 'bc-sitka-spruce-department-theme';
$request_path = WP_CONTENT_DIR . "/themes/{$theme_slug}/tests/fixtures/.e2e-block-seed-request.json";

if ( ! is_readable( $request_path ) ) {
	echo wp_json_encode( array( 'error' => 'Block seed request file is missing.' ) );
	exit( 1 );
}

$request = json_decode( (string) file_get_contents( $request_path ), true );
if ( ! is_array( $request ) || empty( $request['blockName'] ) || empty( $request['variants'] ) ) {
	echo wp_json_encode( array( 'error' => 'Invalid block seed request payload.' ) );
	exit( 1 );
}

$block_name = (string) $request['blockName'];
$variants   = $request['variants'];
$urls       = array();

foreach ( $variants as $variant_key => $variant_config ) {
	if ( ! is_array( $variant_config ) || ! isset( $variant_config['attributes'] ) ) {
		continue;
	}

	$attributes = $variant_config['attributes'];
	if ( ! is_array( $attributes ) ) {
		continue;
	}

	$attributes = array_merge(
		array(
			'name' => $block_name,
			'mode' => 'auto',
		),
		$attributes
	);

	$urls[ (string) $variant_key ] = e2e_publish_block_frontend_page(
		(string) $variant_key,
		$block_name,
		$attributes
	);
}

echo wp_json_encode( $urls );
