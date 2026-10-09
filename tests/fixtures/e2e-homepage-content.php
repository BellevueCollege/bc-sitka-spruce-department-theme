<?php
/**
 * Enrich homepage pattern markup for e2e integration tests.
 *
 * @package BcSitkaSpruce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Apply shared homepage enrichment (hero optional).
 *
 * @param string               $content         Block markup.
 * @param string               $site_type       dept|div|suppt.
 * @param int                  $attachment_id   Hero/listing image attachment ID (0 skips hero wire).
 * @param array<string, mixed> $context         profile_ids, program_ids arrays.
 * @return string
 */
function e2e_enrich_homepage_content(
	string $content,
	string $site_type,
	int $attachment_id,
	array $context
): string {
	if ( $attachment_id > 0 ) {
		$content = e2e_wire_hero_image_in_content( $content, $attachment_id );
	}

	$content = e2e_homepage_populate_listing_items( $content, $attachment_id );
	$content = e2e_homepage_wire_checkerboards( $content, $attachment_id );
	$content = e2e_homepage_wire_news_feature_blocks( $content );
	$content = e2e_homepage_wire_profiles_sections( $content, $context['profile_ids'] ?? array() );

	if ( $site_type === 'dept' ) {
		$content = e2e_homepage_wire_degrees_section( $content, $context['program_ids'] ?? array() );
		$content = e2e_homepage_populate_department_accordion( $content );
		$content = e2e_homepage_wire_media_gallery( $content, $attachment_id );
	}

	if ( $site_type === 'div' ) {
		$content = e2e_homepage_wire_division_cards( $content, $attachment_id );
	}

	if ( $site_type === 'suppt' ) {
		$content = e2e_homepage_wire_testimonial_section( $content, $attachment_id );
		$content = e2e_homepage_populate_support_accordion( $content );
	}

	return $content;
}

/**
 * @param string $content       Block markup.
 * @param int    $attachment_id Image attachment ID.
 * @return string
 */
function e2e_homepage_populate_listing_items( string $content, int $attachment_id ): string {
	$item_titles = array( 'E2E Listing Item One', 'E2E Listing Item Two' );
	$index       = 0;

	return preg_replace_callback(
		'#<!-- wp:bc-sitka-spruce/listing-section-list-item -->\s*<!-- wp:paragraph[^>]*-->\s*<p></p>\s*<!-- /wp:paragraph -->#s',
		static function () use ( &$index, $item_titles, $attachment_id ) {
			$title = $item_titles[ $index ] ?? 'E2E Listing Item';
			$index++;
			$attributes = array(
				'title'   => $title,
				'imageId' => $attachment_id > 0 ? $attachment_id : 0,
			);
			$json       = wp_json_encode( $attributes );
			$body       = '<p>E2E listing body copy for ' . esc_html( $title ) . '.</p>';

			return '<!-- wp:bc-sitka-spruce/listing-section-list-item ' . $json . ' -->' . "\n"
				. '<!-- wp:paragraph -->' . "\n" . $body . "\n" . '<!-- /wp:paragraph -->';
		},
		$content,
		2
	) ?? $content;
}

/**
 * @param string $content       Block markup.
 * @param int    $attachment_id Image attachment ID.
 * @return string
 */
function e2e_homepage_wire_checkerboards( string $content, int $attachment_id ): string {
	if ( $attachment_id <= 0 ) {
		return $content;
	}

	$content = str_replace(
		'"field_6733e8f04e849":""',
		'"field_6733e8f04e849":"E2E checkerboard section supporting copy."',
		$content
	);

	$content = str_replace(
		'"field_62ff9d4b85359_field_62ff804b719f6":""',
		'"field_62ff9d4b85359_field_62ff804b719f6":' . $attachment_id,
		$content
	);

	$content = preg_replace(
		'/"field_62ff9d4b85359_field_62ff8073719f8":""/',
		'"field_62ff9d4b85359_field_62ff8073719f8":"E2E checkerboard row body copy."',
		$content,
		2
	) ?? $content;

	$title_index = 0;
	$content     = preg_replace_callback(
		'/Checkerboard Heading/',
		static function () use ( &$title_index ) {
			$title_index++;
			return $title_index === 1 ? 'E2E Checkerboard One' : 'E2E Checkerboard Two';
		},
		$content,
		2
	) ?? $content;

	return $content;
}

/**
 * @param string $content Block markup.
 * @return string
 */
function e2e_homepage_wire_news_feature_blocks( string $content ): string {
	return preg_replace_callback(
		'#<!-- wp:bc-sitka-spruce/news-feature-core(?:\s+(\{.*?\}))?\s*/-->#s',
		static function ( $matches ) {
			$attributes = array();
			if ( ! empty( $matches[1] ) ) {
				$decoded = json_decode( $matches[1], true );
				if ( is_array( $decoded ) ) {
					$attributes = $decoded;
				}
			}
			$attributes['description'] = 'E2E news section supporting copy.';
			$attributes['linkTitle']   = 'View all E2E news';
			$attributes['linkUrl']     = 'https://example.com/e2e-news';

			return '<!-- wp:bc-sitka-spruce/news-feature-core ' . wp_json_encode( $attributes ) . ' /-->';
		},
		$content
	) ?? $content;
}

/**
 * @param string $content     Block markup.
 * @param int[]  $profile_ids Profile post IDs (first = leadership row, rest = faculty row).
 * @return string
 */
function e2e_homepage_wire_profiles_sections( string $content, array $profile_ids ): string {
	$profile_ids = array_values( array_filter( array_map( 'intval', $profile_ids ) ) );
	if ( $profile_ids === array() ) {
		return $content;
	}

	$taxonomy_row_count = preg_match_all(
		'/"field_6718186dcf4ee":"taxonomy"/',
		$content
	) ?: 0;

	if ( $taxonomy_row_count <= 1 ) {
		$row_profile_sets = array( $profile_ids );
	} else {
		$row_profile_sets = array(
			array( $profile_ids[0] ),
			count( $profile_ids ) > 1 ? array_slice( $profile_ids, 1 ) : array( $profile_ids[0] ),
		);
	}

	$content = str_replace(
		'"field_671804e7f8eaa":""',
		'"field_671804e7f8eaa":"E2E profiles section supporting copy."',
		$content
	);

	$cta = wp_json_encode(
		array(
			'title'  => 'Meet the team',
			'url'    => 'https://example.com/e2e-profiles',
			'target' => '',
		)
	);
	$content = preg_replace(
		'/"field_67182970176f2":\{"title":"","url":"","target":""\}/',
		'"field_67182970176f2":' . $cta,
		$content
	) ?? $content;

	foreach ( $row_profile_sets as $row_ids ) {
		$profiles_json = wp_json_encode( $row_ids );
		$node_row      = '"field_6718186dcf4ee":"node","field_67181986c01c6":' . $profiles_json;
		$content       = preg_replace(
			'/"field_6718186dcf4ee":"taxonomy","field_67181a0cebcad":"[^"]*","field_67181b0c4e673":"[^"]*"/',
			$node_row,
			$content,
			1
		) ?? $content;
		$content       = preg_replace(
			'/"field_6718186dcf4ee":"taxonomy","field_67181a0cebcad":"","field_67181b0c4e673":""/',
			$node_row,
			$content,
			1
		) ?? $content;
	}

	return $content;
}

/**
 * @param string $content     Block markup.
 * @param int[]  $program_ids Program post IDs for degree segments.
 * @return string
 */
function e2e_homepage_wire_degrees_section( string $content, array $program_ids ): string {
	$program_ids = array_values( array_filter( array_map( 'intval', $program_ids ) ) );
	if ( $program_ids === array() ) {
		return $content;
	}

	$content = str_replace(
		'"field_671a6fccffac2":""',
		'"field_671a6fccffac2":"E2E degrees and certificates section intro."',
		$content
	);

	$content = preg_replace(
		'/"field_671a7062ffac5":""/',
		'"field_671a7062ffac5":"E2E segment supporting copy."',
		$content,
		2
	) ?? $content;

	$encoded_programs = wp_json_encode( $program_ids );
	$content          = preg_replace(
		'/"field_671a706dffac6":""/',
		'"field_671a706dffac6":' . $encoded_programs,
		$content,
		2
	) ?? $content;

	return $content;
}

/**
 * @param string $content       Block markup.
 * @param int    $attachment_id Image attachment ID.
 * @return string
 */
function e2e_homepage_wire_media_gallery( string $content, int $attachment_id ): string {
	if ( $attachment_id <= 0 ) {
		return $content;
	}

	$content = str_replace(
		'"field_66ec94b860566":""',
		'"field_66ec94b860566":"E2E media gallery section intro."',
		$content
	);

	return str_replace(
		'"field_66ec94e515757":""',
		'"field_66ec94e515757":' . $attachment_id,
		$content
	);
}

/**
 * @param string $content       Block markup.
 * @param int    $attachment_id Image attachment ID.
 * @return string
 */
function e2e_homepage_wire_division_cards( string $content, int $attachment_id ): string {
	if ( $attachment_id <= 0 ) {
		return $content;
	}

	$card_one = '<!-- wp:bc-sitka-spruce/card-section-card {"cardTitle":"E2E Division Card One","cardImageId":' . $attachment_id . '} -->'
		. "\n<!-- wp:paragraph --><p>E2E division card one body.</p><!-- /wp:paragraph -->\n"
		. '<!-- /wp:bc-sitka-spruce/card-section-card -->';

	$card_two = '<!-- wp:bc-sitka-spruce/card-section-card {"cardTitle":"E2E Division Card Two","cardImageId":' . $attachment_id . '} -->'
		. "\n<!-- wp:paragraph --><p>E2E division card two body.</p><!-- /wp:paragraph -->\n"
		. '<!-- /wp:bc-sitka-spruce/card-section-card -->';

	$content = preg_replace(
		'#<!-- wp:bc-sitka-spruce/card-section-card -->\s*<!-- wp:paragraph[^>]*-->\s*<p></p>\s*<!-- /wp:paragraph -->\s*(?:<!-- wp:paragraph -->\s*<p></p>\s*<!-- /wp:paragraph -->\s*)?<!-- /wp:bc-sitka-spruce/card-section-card -->#s',
		$card_one,
		$content,
		1
	) ?? $content;

	$content = preg_replace(
		'#<!-- wp:bc-sitka-spruce/card-section-card -->\s*<!-- wp:paragraph[^>]*-->\s*<p></p>\s*<!-- /wp:paragraph -->\s*(?:<!-- wp:paragraph -->\s*<p></p>\s*<!-- /wp:paragraph -->\s*)?<!-- /wp:bc-sitka-spruce/card-section-card -->#s',
		$card_two,
		$content,
		1
	) ?? $content;

	return $content;
}

/**
 * @param string $content       Block markup.
 * @param int    $attachment_id Image attachment ID.
 * @return string
 */
function e2e_homepage_wire_testimonial_section( string $content, int $attachment_id ): string {
	if ( $attachment_id <= 0 ) {
		return $content;
	}

	$content = str_replace(
		'"field_66c3c84361b59":""',
		'"field_66c3c84361b59":' . $attachment_id,
		$content
	);

	$content = str_replace(
		'"field_66c3c83061b58":""',
		'"field_66c3c83061b58":"E2E testimonial section description."',
		$content
	);

	$content = str_replace(
		'"field_66c3c92af5205":""',
		'"field_66c3c92af5205":"E2E Testimonial Author"',
		$content
	);

	return str_replace(
		'"field_66c3c93cf5206":""',
		'"field_66c3c93cf5206":"E2E testimonial attribution line."',
		$content
	);
}

/**
 * @param string $content Block markup.
 * @return string
 */
function e2e_homepage_populate_department_accordion( string $content ): string {
	$pattern = <<<'MARKUP'
<div class="wp-block-mayflower-blocks-collapse accordion-item"><h3 class="accordion-header mb-0" id="heading_b9cd1bce-ca8e-4087-bdb7-ced01d6498a7"><button class="accordion-button bg-default text-bg-default
		 collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_b9cd1bce-ca8e-4087-bdb7-ced01d6498a7" aria-expanded="false" aria-controls="collapse_b9cd1bce-ca8e-4087-bdb7-ced01d6498a7"></button></h3><div id="collapse_b9cd1bce-ca8e-4087-bdb7-ced01d6498a7" class="accordion-collapse collapse " aria-labelledby="heading_b9cd1bce-ca8e-4087-bdb7-ced01d6498a7" data-parent="#accordion_9b8ee078-96ae-495b-b248-663ae2765f70" data-bs-parent="#accordion_9b8ee078-96ae-495b-b248-663ae2765f70"><div class="accordion-body bg-default text-bg-default
		"></div></div></div>
MARKUP;

	$replacement = <<<'MARKUP'
<div class="wp-block-mayflower-blocks-collapse accordion-item"><h3 class="accordion-header mb-0" id="heading_b9cd1bce-ca8e-4087-bdb7-ced01d6498a7"><button class="accordion-button bg-default text-bg-default" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_b9cd1bce-ca8e-4087-bdb7-ced01d6498a7" aria-expanded="true" aria-controls="collapse_b9cd1bce-ca8e-4087-bdb7-ced01d6498a7">E2E Dept FAQ One</button></h3><div id="collapse_b9cd1bce-ca8e-4087-bdb7-ced01d6498a7" class="accordion-collapse collapse show" aria-labelledby="heading_b9cd1bce-ca8e-4087-bdb7-ced01d6498a7" data-parent="#accordion_9b8ee078-96ae-495b-b248-663ae2765f70" data-bs-parent="#accordion_9b8ee078-96ae-495b-b248-663ae2765f70"><div class="accordion-body bg-default text-bg-default"><p>E2E department accordion panel one.</p></div></div></div>
MARKUP;

	$content = str_replace( $pattern, $replacement, $content );

	$content = preg_replace(
		'~(<button class="accordion-button bg-default text-bg-default\s+collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_645d9624[^"]+"[^>]*></button>)~',
		'<button class="accordion-button bg-default text-bg-default collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_645d9624-58e4-426d-b1a4-1c37d9bbbf5e" aria-expanded="false" aria-controls="collapse_645d9624-58e4-426d-b1a4-1c37d9bbbf5e">E2E Dept FAQ Two</button>',
		$content,
		1
	) ?? $content;

	return preg_replace(
		'~(id="collapse_645d9624[^"]+" class="accordion-collapse collapse "[^>]*><div class="accordion-body[^"]*">\s*)</div>~',
		'$1<p>E2E department accordion panel two.</p></div>',
		$content,
		1
	) ?? $content;
}

/**
 * @param string $content Block markup.
 * @return string
 */
function e2e_homepage_populate_support_accordion( string $content ): string {
	$pattern = <<<'MARKUP'
<div class="wp-block-mayflower-blocks-collapse accordion-item"><h3 class="accordion-header mb-0" id="heading_a61d3b5e-d8be-4f2f-9001-fcaa57854b83"><button class="accordion-button bg-default text-bg-default
		 collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_a61d3b5e-d8be-4f2f-9001-fcaa57854b83" aria-expanded="false" aria-controls="collapse_a61d3b5e-d8be-4f2f-9001-fcaa57854b83"></button></h3><div id="collapse_a61d3b5e-d8be-4f2f-9001-fcaa57854b83" class="accordion-collapse collapse " aria-labelledby="heading_a61d3b5e-d8be-4f2f-9001-fcaa57854b83" data-parent="#accordion_aa2a0840-c4d7-4082-b997-189b97be0aa4" data-bs-parent="#accordion_aa2a0840-c4d7-4082-b997-189b97be0aa4"><div class="accordion-body bg-default text-bg-default
		"></div></div></div>
MARKUP;

	$replacement = <<<'MARKUP'
<div class="wp-block-mayflower-blocks-collapse accordion-item"><h3 class="accordion-header mb-0" id="heading_a61d3b5e-d8be-4f2f-9001-fcaa57854b83"><button class="accordion-button bg-default text-bg-default" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_a61d3b5e-d8be-4f2f-9001-fcaa57854b83" aria-expanded="true" aria-controls="collapse_a61d3b5e-d8be-4f2f-9001-fcaa57854b83">E2E Support FAQ One</button></h3><div id="collapse_a61d3b5e-d8be-4f2f-9001-fcaa57854b83" class="accordion-collapse collapse show" aria-labelledby="heading_a61d3b5e-d8be-4f2f-9001-fcaa57854b83" data-parent="#accordion_aa2a0840-c4d7-4082-b997-189b97be0aa4" data-bs-parent="#accordion_aa2a0840-c4d7-4082-b997-189b97be0aa4"><div class="accordion-body bg-default text-bg-default"><p>E2E support resources FAQ panel one.</p></div></div></div>
MARKUP;

	$content = str_replace( $pattern, $replacement, $content );

	$content = preg_replace(
		'~(<button class="accordion-button bg-default text-bg-default\s+collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_47ad1881[^"]+"[^>]*></button>)~',
		'<button class="accordion-button bg-default text-bg-default collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_47ad1881-b439-4672-bc89-3093bbd4d664" aria-expanded="false" aria-controls="collapse_47ad1881-b439-4672-bc89-3093bbd4d664">E2E Support FAQ Two</button>',
		$content,
		1
	) ?? $content;

	return preg_replace(
		'~(id="collapse_47ad1881[^"]+" class="accordion-collapse collapse "[^>]*><div class="accordion-body[^"]*">\s*)</div>~',
		'$1<p>E2E support resources FAQ panel two.</p></div>',
		$content,
		1
	) ?? $content;
}
