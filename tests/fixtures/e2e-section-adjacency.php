<?php
/**
 * Section adjacency scenarios for Playwright CSS regression tests.
 *
 * Covers ordered pairs driven by src/scss/components/_section.scss — not a
 * full color matrix. One representative block per section signature:
 *
 * | Signature                         | Block                          |
 * |-----------------------------------|--------------------------------|
 * | white + divider                   | body-section                   |
 * | xlight                            | listing-section                |
 * | accent                            | contact-selector               |
 * | brutus                            | degrees-certificates-section   |
 * | rainy (flat)                      | tabs-section                   |
 * | rainy + swiper                    | media-gallery-section          |
 * | rainy + arch + curved-top + diffs | differentiator-section         |
 * | rainy + arch + curved-top         | support-feature                |
 *
 * Covered elsewhere (homepage / program / listing specs), same signatures:
 * card-section, checkerboard-section, bio-section, department-feature,
 * news-feature / posts-feature (white); profiles-section, testimonial-section,
 * accordion-section, application-steps, course-information-section (xlight).
 *
 * @package BcSitkaSpruce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Build the full adjacency page block markup.
 *
 * @param array<string, mixed> $core_map      Core site seed map.
 * @param int[]                $program_ids   Local program post IDs.
 * @param int                  $profile_id    Profile ID for contact-selector.
 * @param int                  $attachment_id Image for media gallery.
 * @return string
 */
function e2e_section_adjacency_page_markup(
	array $core_map,
	array $program_ids,
	int $profile_id,
	int $attachment_id
): string {
	$context = array(
		'core_map'      => $core_map,
		'program_ids'   => $program_ids,
		'profile_id'    => $profile_id,
		'attachment_id' => $attachment_id,
	);

	$scenarios = array(
		// White divider hide via :has(+ colored|arch).
		e2e_build_adjacency_white_to_xlight( $context ),
		e2e_build_adjacency_white_to_accent( $context ),
		e2e_build_adjacency_white_to_brutus( $context ),
		e2e_build_adjacency_white_to_rainy( $context ),
		e2e_build_adjacency_white_to_arch( $context ),
		// Same-color borders.
		e2e_build_adjacency_xlight_to_xlight( $context ),
		e2e_build_adjacency_rainy_to_rainy( $context ),
		// Arch overlap (padding-bottom + arch margin-top).
		e2e_build_adjacency_xlight_to_differentiator( $context ),
		e2e_build_adjacency_brutus_to_differentiator( $context ),
		e2e_build_adjacency_accent_to_differentiator( $context ),
		// Arch suppression after rainy.
		e2e_build_adjacency_rainy_to_differentiator( $context ),
		// Curved / diffs stack rules.
		e2e_build_adjacency_differentiator_to_rainy( $context ),
		e2e_build_adjacency_differentiator_to_differentiator( $context ),
		// Support-feature arch path (non-diffs).
		e2e_build_adjacency_white_to_support_feature( $context ),
	);

	$markup = implode( "\n", $scenarios );

	return e2e_wire_core_site_blocks_in_content( $markup, $core_map );
}

/**
 * @param string $scenario_id   Stable HTML id for the scenario wrapper.
 * @param string $inner_markup  Block markup for the pair/stack.
 * @return string
 */
function e2e_wrap_adjacency_scenario( string $scenario_id, string $inner_markup ): string {
	$escaped_id = esc_attr( $scenario_id );

	return <<<MARKUP
<!-- wp:group {"anchor":"{$escaped_id}"} -->
<div class="wp-block-group" id="{$escaped_id}">
{$inner_markup}
</div>
<!-- /wp:group -->
MARKUP;
}

/**
 * @param array<string, mixed> $context Shared seed context.
 * @return string
 */
function e2e_build_adjacency_white_to_xlight( array $context ): string {
	return e2e_wrap_adjacency_scenario(
		'e2e-adj-scenario-white-to-xlight',
		e2e_adjacency_body_section( 'e2e-adj-white-to-xlight-from', 'E2E adj white to xlight (from)' )
		. "\n"
		. e2e_adjacency_listing_section( 'e2e-adj-white-to-xlight', 'E2E adj white to xlight' )
	);
}

/**
 * @param array<string, mixed> $context Shared seed context.
 * @return string
 */
function e2e_build_adjacency_white_to_accent( array $context ): string {
	return e2e_wrap_adjacency_scenario(
		'e2e-adj-scenario-white-to-accent',
		e2e_adjacency_body_section( 'e2e-adj-white-to-accent-from', 'E2E adj white to accent (from)' )
		. "\n"
		. e2e_adjacency_contact_section(
			'E2E adj white to accent',
			(int) $context['profile_id']
		)
	);
}

/**
 * @param array<string, mixed> $context Shared seed context.
 * @return string
 */
function e2e_build_adjacency_white_to_brutus( array $context ): string {
	return e2e_wrap_adjacency_scenario(
		'e2e-adj-scenario-white-to-brutus',
		e2e_adjacency_body_section( 'e2e-adj-white-to-brutus-from', 'E2E adj white to brutus (from)' )
		. "\n"
		. e2e_adjacency_degrees_section(
			'E2E adj white to brutus',
			$context['program_ids']
		)
	);
}

/**
 * @param array<string, mixed> $context Shared seed context.
 * @return string
 */
function e2e_build_adjacency_white_to_rainy( array $context ): string {
	return e2e_wrap_adjacency_scenario(
		'e2e-adj-scenario-white-to-rainy',
		e2e_adjacency_body_section( 'e2e-adj-white-to-rainy-from', 'E2E adj white to rainy (from)' )
		. "\n"
		. e2e_adjacency_tabs_section( 'e2e-adj-white-to-rainy', 'E2E adj white to rainy' )
	);
}

/**
 * White → arch (divider hide when next sibling is .arch-shape).
 *
 * @param array<string, mixed> $context Shared seed context.
 * @return string
 */
function e2e_build_adjacency_white_to_arch( array $context ): string {
	return e2e_wrap_adjacency_scenario(
		'e2e-adj-scenario-white-to-arch',
		e2e_adjacency_body_section( 'e2e-adj-white-to-arch-from', 'E2E adj white to arch (from)' )
		. "\n"
		. e2e_adjacency_differentiator_section( 'E2E adj white to arch' )
	);
}

/**
 * @param array<string, mixed> $context Shared seed context.
 * @return string
 */
function e2e_build_adjacency_xlight_to_xlight( array $context ): string {
	return e2e_wrap_adjacency_scenario(
		'e2e-adj-scenario-xlight-to-xlight',
		e2e_adjacency_listing_section( 'e2e-adj-xlight-to-xlight-from', 'E2E adj xlight to xlight (from)' )
		. "\n"
		. e2e_adjacency_listing_section( 'e2e-adj-xlight-to-xlight', 'E2E adj xlight to xlight' )
	);
}

/**
 * Flat rainy → rainy+swiper (media gallery) for same-color border + swiper signature.
 *
 * @param array<string, mixed> $context Shared seed context.
 * @return string
 */
function e2e_build_adjacency_rainy_to_rainy( array $context ): string {
	return e2e_wrap_adjacency_scenario(
		'e2e-adj-scenario-rainy-to-rainy',
		e2e_adjacency_tabs_section( 'e2e-adj-rainy-to-rainy-from', 'E2E adj rainy to rainy (from)' )
		. "\n"
		. e2e_adjacency_media_gallery_section(
			'E2E adj rainy to rainy',
			(int) $context['attachment_id']
		)
	);
}

/**
 * @param array<string, mixed> $context Shared seed context.
 * @return string
 */
function e2e_build_adjacency_xlight_to_differentiator( array $context ): string {
	return e2e_wrap_adjacency_scenario(
		'e2e-adj-scenario-xlight-to-differentiator',
		e2e_adjacency_listing_section(
			'e2e-adj-xlight-to-differentiator-from',
			'E2E adj xlight to differentiator (from)'
		)
		. "\n"
		. e2e_adjacency_differentiator_section( 'E2E adj xlight to differentiator' )
	);
}

/**
 * @param array<string, mixed> $context Shared seed context.
 * @return string
 */
function e2e_build_adjacency_brutus_to_differentiator( array $context ): string {
	return e2e_wrap_adjacency_scenario(
		'e2e-adj-scenario-brutus-to-differentiator',
		e2e_adjacency_degrees_section(
			'E2E adj brutus to differentiator (from)',
			$context['program_ids']
		)
		. "\n"
		. e2e_adjacency_differentiator_section( 'E2E adj brutus to differentiator' )
	);
}

/**
 * @param array<string, mixed> $context Shared seed context.
 * @return string
 */
function e2e_build_adjacency_accent_to_differentiator( array $context ): string {
	return e2e_wrap_adjacency_scenario(
		'e2e-adj-scenario-accent-to-differentiator',
		e2e_adjacency_contact_section(
			'E2E adj accent to differentiator (from)',
			(int) $context['profile_id']
		)
		. "\n"
		. e2e_adjacency_differentiator_section( 'E2E adj accent to differentiator' )
	);
}

/**
 * Rainy flat → differentiator: arch should be display:none.
 *
 * @param array<string, mixed> $context Shared seed context.
 * @return string
 */
function e2e_build_adjacency_rainy_to_differentiator( array $context ): string {
	return e2e_wrap_adjacency_scenario(
		'e2e-adj-scenario-rainy-to-differentiator',
		e2e_adjacency_tabs_section(
			'e2e-adj-rainy-to-differentiator-from',
			'E2E adj rainy to differentiator (from)'
		)
		. "\n"
		. e2e_adjacency_differentiator_section( 'E2E adj rainy to differentiator' )
	);
}

/**
 * @param array<string, mixed> $context Shared seed context.
 * @return string
 */
function e2e_build_adjacency_differentiator_to_rainy( array $context ): string {
	return e2e_wrap_adjacency_scenario(
		'e2e-adj-scenario-differentiator-to-rainy',
		e2e_adjacency_differentiator_section( 'E2E adj differentiator to rainy (from)' )
		. "\n"
		. e2e_adjacency_tabs_section(
			'e2e-adj-differentiator-to-rainy',
			'E2E adj differentiator to rainy'
		)
	);
}

/**
 * @param array<string, mixed> $context Shared seed context.
 * @return string
 */
function e2e_build_adjacency_differentiator_to_differentiator( array $context ): string {
	return e2e_wrap_adjacency_scenario(
		'e2e-adj-scenario-differentiator-to-differentiator',
		e2e_adjacency_differentiator_section( 'E2E adj differentiator to differentiator (from)' )
		. "\n"
		. e2e_adjacency_differentiator_section( 'E2E adj differentiator to differentiator' )
	);
}

/**
 * @param array<string, mixed> $context Shared seed context.
 * @return string
 */
function e2e_build_adjacency_white_to_support_feature( array $context ): string {
	return e2e_wrap_adjacency_scenario(
		'e2e-adj-scenario-white-to-support-feature',
		e2e_adjacency_body_section(
			'e2e-adj-white-to-support-from',
			'E2E adj white to support (from)'
		)
		. "\n"
		. e2e_adjacency_support_feature_section( 'E2E adj white to support' )
	);
}

/**
 * @param string $anchor  Block HTML anchor.
 * @param string $heading Visible heading text.
 * @return string
 */
function e2e_adjacency_body_section( string $anchor, string $heading ): string {
	$escaped_heading = esc_html( $heading );
	$escaped_anchor  = esc_attr( $anchor );

	return <<<MARKUP
<!-- wp:bc-sitka-spruce/body-section {"anchor":"{$escaped_anchor}"} -->
<!-- wp:bc-sitka-spruce/body-section-content -->
<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">{$escaped_heading}</h3>
<!-- /wp:heading -->
<!-- /wp:bc-sitka-spruce/body-section-content -->
<!-- /wp:bc-sitka-spruce/body-section -->
MARKUP;
}

/**
 * @param string $anchor  Block HTML anchor.
 * @param string $heading Visible heading text.
 * @return string
 */
function e2e_adjacency_listing_section( string $anchor, string $heading ): string {
	$escaped_heading = esc_html( $heading );
	$escaped_anchor  = esc_attr( $anchor );

	return <<<MARKUP
<!-- wp:bc-sitka-spruce/listing-section {"title":"{$escaped_heading}","anchor":"{$escaped_anchor}"} -->
<!-- wp:bc-sitka-spruce/listing-section-list-item {"title":"E2E listing item"} -->
<!-- wp:paragraph -->
<p>E2E listing item body.</p>
<!-- /wp:paragraph -->
<!-- /wp:bc-sitka-spruce/listing-section-list-item -->
<!-- /wp:bc-sitka-spruce/listing-section -->
MARKUP;
}

/**
 * @param string $heading    Visible heading text.
 * @param int    $profile_id Profile post ID.
 * @return string
 */
function e2e_adjacency_contact_section( string $heading, int $profile_id ): string {
	$escaped_heading = esc_html( $heading );
	$profile_ref     = $profile_id > 0 ? (string) $profile_id : '';

	return <<<MARKUP
<!-- wp:bc-sitka-spruce/contact-selector {"name":"bc-sitka-spruce/contact-selector","data":{"title":"{$escaped_heading}","_title":"field_66a7e30d7a047","description":"E2E contact selector section.","_description":"field_66a7e33a7a048","profiles":{$profile_ref},"_profiles":"field_669061d99346c"},"mode":"preview"} /-->
MARKUP;
}

/**
 * @param string $heading     Visible heading / ACF title.
 * @param int[]  $program_ids Local program post IDs.
 * @return string
 */
function e2e_adjacency_degrees_section( string $heading, array $program_ids ): string {
	$escaped_heading = esc_html( $heading );
	$degrees_markup  = <<<MARKUP
<!-- wp:bc-sitka-spruce/degrees-certificates-section {"name":"bc-sitka-spruce/degrees-certificates-section","data":{"field_671a6f98ffac1":"{$escaped_heading}","field_671a6fccffac2":"","field_671a6fe2ffac3":{"row-0":{"field_671a7041ffac4":"Degree Options","field_671a7062ffac5":"","field_671a706dffac6":""}}},"mode":"auto"} /-->
MARKUP;

	return e2e_wire_degrees_block_programs( $degrees_markup, $program_ids );
}

/**
 * @param string $anchor  Block HTML anchor.
 * @param string $heading Visible heading text.
 * @return string
 */
function e2e_adjacency_tabs_section( string $anchor, string $heading ): string {
	$escaped_heading = esc_html( $heading );
	$escaped_anchor  = esc_attr( $anchor );

	return <<<MARKUP
<!-- wp:bc-sitka-spruce/tabs-section {"title":"{$escaped_heading}","anchor":"{$escaped_anchor}"} -->
<!-- wp:bc-sitka-spruce/tabcordion {"blockId":"{$escaped_anchor}","headingLevel":"h3"} -->
<!-- wp:bc-sitka-spruce/tabcordion-list -->
<!-- wp:bc-sitka-spruce/tabcordion-list-tab {"tabActive":true,"tabId":"{$escaped_anchor}-tab","tabTitle":"E2E Tab","tabDefault":true} /-->
<!-- /wp:bc-sitka-spruce/tabcordion-list -->
<!-- wp:bc-sitka-spruce/tabcordion-content -->
<!-- wp:bc-sitka-spruce/tabcordion-content-panel {"tabActive":true,"tabId":"{$escaped_anchor}-tab","tabTitle":"E2E Tab","tabDefault":true} -->
<!-- wp:paragraph -->
<p>E2E rainy section tab body.</p>
<!-- /wp:paragraph -->
<!-- /wp:bc-sitka-spruce/tabcordion-content-panel -->
<!-- /wp:bc-sitka-spruce/tabcordion-content -->
<!-- /wp:bc-sitka-spruce/tabcordion -->
<!-- /wp:bc-sitka-spruce/tabs-section -->
MARKUP;
}

/**
 * @param string $heading       Visible heading / ACF title.
 * @param int    $attachment_id Image attachment ID.
 * @return string
 */
function e2e_adjacency_media_gallery_section( string $heading, int $attachment_id ): string {
	$escaped_heading = esc_html( $heading );
	$image_field     = $attachment_id > 0 ? (string) $attachment_id : '""';

	return <<<MARKUP
<!-- wp:bc-sitka-spruce/media-gallery-section {"name":"bc-sitka-spruce/media-gallery-section","data":{"field_66ec949460565":"{$escaped_heading}","field_66ec94b860566":"E2E media gallery adjacency intro.","field_66ec94c860567":{"row-0":{"field_66ec94e515757":{$image_field},"field_66ec952b15758":"","field_66ec954815759":"","field_66ec955b1575a":""}}},"mode":"auto"} /-->
MARKUP;
}

/**
 * Differentiator child IDs are filled by e2e_wire_core_site_blocks_in_content.
 *
 * @param string $heading Section title.
 * @return string
 */
function e2e_adjacency_differentiator_section( string $heading ): string {
	$escaped_heading = esc_html( $heading );

	return <<<MARKUP
<!-- wp:bc-sitka-spruce/differentiator-section {"title":"{$escaped_heading}"} -->
<!-- wp:bc-sitka-spruce/differentiator /-->
<!-- /wp:bc-sitka-spruce/differentiator-section -->
MARKUP;
}

/**
 * Support posts are filled by e2e_wire_core_site_blocks_in_content (first match).
 *
 * @param string $heading Section heading attribute.
 * @return string
 */
function e2e_adjacency_support_feature_section( string $heading ): string {
	$escaped_heading = esc_html( $heading );

	return <<<MARKUP
<!-- wp:bc-sitka-spruce/support-feature {"heading":"{$escaped_heading}","sectionId":"e2e-adj-support-feature"} /-->
MARKUP;
}
