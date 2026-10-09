<?php
/**
 * Enriched Application Guide block markup for e2e integration tests.
 *
 * @package BcSitkaSpruce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Build Application Guide post content (pattern minus setup alert, with populated blocks).
 *
 * @param int $card_image_attachment_id Attachment ID for card-section cards.
 * @return string
 */
function e2e_application_guide_block_markup( int $card_image_attachment_id ): string {
	$content = e2e_load_pattern_markup( 'page-application-guide-v0.php' );
	$content = e2e_strip_editor_setup_alert( $content );

	$content = e2e_application_guide_add_second_student_tab( $content );
	$content = e2e_application_guide_populate_step_bodies( $content );
	$content = e2e_application_guide_populate_accordion( $content );
	$content = e2e_application_guide_populate_resource_cards( $content, $card_image_attachment_id );
	$content = e2e_application_guide_populate_accordion_callout( $content );

	return $content;
}

/**
 * @param string $content Block markup.
 * @return string
 */
function e2e_application_guide_add_second_student_tab( string $content ): string {
	$tab_list_insert = '<!-- wp:bc-sitka-spruce/tabcordion-list-tab {"tabId":"e2e-student-type-two","tabTitle":"Student Type 2"} /-->';
	$content         = str_replace(
		'<!-- wp:bc-sitka-spruce/tabcordion-list-tab {"tabActive":true,"tabId":"c997ba31-e8a5-4915-a7af-b952317be01e","tabTitle":"Student Type 1","tabDefault":true} /-->',
		'<!-- wp:bc-sitka-spruce/tabcordion-list-tab {"tabActive":true,"tabId":"c997ba31-e8a5-4915-a7af-b952317be01e","tabTitle":"Student Type 1","tabDefault":true} /-->' . "\n" . $tab_list_insert,
		$content
	);

	$second_panel = <<<'MARKUP'

<!-- wp:bc-sitka-spruce/tabcordion-content-panel {"tabId":"e2e-student-type-two","tabTitle":"Student Type 2"} -->
<!-- wp:bc-sitka-spruce/application-step-single -->
<div class="wp-block-bc-sitka-spruce-application-step-single application-step-single"><div class="container-xl"><div class="row"><!-- wp:bc-sitka-spruce/application-step-single-content {"heading":"Step 1: Type Two Step"} -->
<div class="wp-block-bc-sitka-spruce-application-step-single-content application-step-single-content col-md-8"><h4 class="application-step-single-heading h2">Step 1: Type Two Step</h4><!-- wp:paragraph -->
<p>E2E application step for student type two.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:bc-sitka-spruce/application-step-single-content -->

<!-- wp:bc-sitka-spruce/callout {"name":"bc-sitka-spruce/callout","mode":"preview"} /--></div></div></div>
<!-- /wp:bc-sitka-spruce/application-step-single -->
<!-- /wp:bc-sitka-spruce/tabcordion-content-panel -->
MARKUP;

	$content = str_replace(
		'<!-- /wp:bc-sitka-spruce/tabcordion-content-panel -->' . "\n" . '<!-- /wp:bc-sitka-spruce/tabcordion-content -->',
		'<!-- /wp:bc-sitka-spruce/tabcordion-content-panel -->' . $second_panel . '<!-- /wp:bc-sitka-spruce/tabcordion-content -->',
		$content
	);

	return $content;
}

/**
 * @param string $content Block markup.
 * @return string
 */
function e2e_application_guide_populate_step_bodies( string $content ): string {
	$step_one_callout = '<!-- wp:bc-sitka-spruce/callout {"name":"bc-sitka-spruce/callout","data":{"display_callout":"1","_display_callout":"field_66b1334b05e6b","title":"E2E Step Callout","_title":"field_66b13323cdbd0","text":"E2E optional callout on step one only.","_text":"field_66b1337a05e6c","links":"","_links":"field_66b1338d05e6d","button":"","_button":"field_673bccabb8e8e"},"mode":"preview"} /-->';

	$content = preg_replace(
		'#(<h4 class="application-step-single-heading h2">Step 1: Step Title</h4><!-- wp:paragraph -->\s*)<p></p>#',
		'$1<p>E2E application step one body copy.</p>',
		$content,
		1
	) ?? $content;

	$step_one_callout_needle = '<!-- wp:bc-sitka-spruce/callout {"name":"bc-sitka-spruce/callout","mode":"preview"} /--></div></div></div>' . "\n"
		. '<!-- /wp:bc-sitka-spruce/application-step-single -->' . "\n\n"
		. '<!-- wp:bc-sitka-spruce/application-step-single -->';
	$step_one_callout_replace = $step_one_callout . '</div></div></div>' . "\n"
		. '<!-- /wp:bc-sitka-spruce/application-step-single -->' . "\n\n"
		. '<!-- wp:bc-sitka-spruce/application-step-single -->';
	$step_one_callout_position = strpos( $content, $step_one_callout_needle );
	if ( $step_one_callout_position !== false ) {
		$content = substr_replace( $content, $step_one_callout_replace, $step_one_callout_position, strlen( $step_one_callout_needle ) );
	}

	$content = preg_replace(
		'#(<h4 class="application-step-single-heading h2">Step 2: Step Title</h4><!-- wp:paragraph -->\s*)<p></p>#',
		'$1<p>E2E application step two body without callout.</p>',
		$content,
		1
	) ?? $content;

	return $content;
}

/**
 * @param string $content Block markup.
 * @return string
 */
function e2e_application_guide_populate_accordion( string $content ): string {
	$pattern_collapsibles = <<<'MARKUP'
<!-- wp:mayflower-blocks/collapsibles {"currentBlockClientId":"3eeb8244-33b7-4cd9-88d9-2313bc38afe2","isBootstrap5":true,"lock":{"move":false,"remove":false}} -->
<div class="wp-block-mayflower-blocks-collapsibles accordion" id="accordion_3eeb8244-33b7-4cd9-88d9-2313bc38afe2"><!-- wp:mayflower-blocks/collapse {"currentBlockClientId":"ffc42db3-fe3e-40a3-98ec-c70b41cf572d","parentBlockClientId":"3eeb8244-33b7-4cd9-88d9-2313bc38afe2","isBootstrap5":true} -->
<div class="wp-block-mayflower-blocks-collapse accordion-item"><h3 class="accordion-header mb-0" id="heading_ffc42db3-fe3e-40a3-98ec-c70b41cf572d"><button class="accordion-button bg-default text-bg-default
		 collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_ffc42db3-fe3e-40a3-98ec-c70b41cf572d" aria-expanded="false" aria-controls="collapse_ffc42db3-fe3e-40a3-98ec-c70b41cf572d"></button></h3><div id="collapse_ffc42db3-fe3e-40a3-98ec-c70b41cf572d" class="accordion-collapse collapse " aria-labelledby="heading_ffc42db3-fe3e-40a3-98ec-c70b41cf572d" data-parent="#accordion_3eeb8244-33b7-4cd9-88d9-2313bc38afe2" data-bs-parent="#accordion_3eeb8244-33b7-4cd9-88d9-2313bc38afe2"><div class="accordion-body bg-default text-bg-default
		"></div></div></div>
<!-- /wp:mayflower-blocks/collapse -->

<!-- wp:mayflower-blocks/collapse {"currentBlockClientId":"a518b84b-55e2-459b-9ebb-0199beecac81","parentBlockClientId":"3eeb8244-33b7-4cd9-88d9-2313bc38afe2","isBootstrap5":true} -->
<div class="wp-block-mayflower-blocks-collapse accordion-item"><h3 class="accordion-header mb-0" id="heading_a518b84b-55e2-459b-9ebb-0199beecac81"><button class="accordion-button bg-default text-bg-default
		 collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_a518b84b-55e2-459b-9ebb-0199beecac81" aria-expanded="false" aria-controls="collapse_a518b84b-55e2-459b-9ebb-0199beecac81"></button></h3><div id="collapse_a518b84b-55e2-459b-9ebb-0199beecac81" class="accordion-collapse collapse " aria-labelledby="heading_a518b84b-55e2-459b-9ebb-0199beecac81" data-parent="#accordion_3eeb8244-33b7-4cd9-88d9-2313bc38afe2" data-bs-parent="#accordion_3eeb8244-33b7-4cd9-88d9-2313bc38afe2"><div class="accordion-body bg-default text-bg-default
		"></div></div></div>
<!-- /wp:mayflower-blocks/collapse --></div>
<!-- /wp:mayflower-blocks/collapsibles -->
MARKUP;

	$replacement_collapsibles = <<<'MARKUP'
<!-- wp:mayflower-blocks/collapsibles {"currentBlockClientId":"3eeb8244-33b7-4cd9-88d9-2313bc38afe2","isBootstrap5":true,"lock":{"move":false,"remove":false}} -->
<div class="wp-block-mayflower-blocks-collapsibles accordion" id="accordion_3eeb8244-33b7-4cd9-88d9-2313bc38afe2"><!-- wp:mayflower-blocks/collapse {"currentBlockClientId":"ffc42db3-fe3e-40a3-98ec-c70b41cf572d","parentBlockClientId":"3eeb8244-33b7-4cd9-88d9-2313bc38afe2","isBootstrap5":true} -->
<div class="wp-block-mayflower-blocks-collapse accordion-item"><h3 class="accordion-header mb-0" id="heading_ffc42db3-fe3e-40a3-98ec-c70b41cf572d"><button class="accordion-button bg-default text-bg-default" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_ffc42db3-fe3e-40a3-98ec-c70b41cf572d" aria-expanded="true" aria-controls="collapse_ffc42db3-fe3e-40a3-98ec-c70b41cf572d">E2E FAQ One</button></h3><div id="collapse_ffc42db3-fe3e-40a3-98ec-c70b41cf572d" class="accordion-collapse collapse show" aria-labelledby="heading_ffc42db3-fe3e-40a3-98ec-c70b41cf572d" data-parent="#accordion_3eeb8244-33b7-4cd9-88d9-2313bc38afe2" data-bs-parent="#accordion_3eeb8244-33b7-4cd9-88d9-2313bc38afe2"><div class="accordion-body bg-default text-bg-default"><p>E2E FAQ panel one body (open by default).</p></div></div></div>
<!-- /wp:mayflower-blocks/collapse -->

<!-- wp:mayflower-blocks/collapse {"currentBlockClientId":"a518b84b-55e2-459b-9ebb-0199beecac81","parentBlockClientId":"3eeb8244-33b7-4cd9-88d9-2313bc38afe2","isBootstrap5":true} -->
<div class="wp-block-mayflower-blocks-collapse accordion-item"><h3 class="accordion-header mb-0" id="heading_a518b84b-55e2-459b-9ebb-0199beecac81"><button class="accordion-button bg-default text-bg-default collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_a518b84b-55e2-459b-9ebb-0199beecac81" aria-expanded="false" aria-controls="collapse_a518b84b-55e2-459b-9ebb-0199beecac81">E2E FAQ Two</button></h3><div id="collapse_a518b84b-55e2-459b-9ebb-0199beecac81" class="accordion-collapse collapse" aria-labelledby="heading_a518b84b-55e2-459b-9ebb-0199beecac81" data-parent="#accordion_3eeb8244-33b7-4cd9-88d9-2313bc38afe2" data-bs-parent="#accordion_3eeb8244-33b7-4cd9-88d9-2313bc38afe2"><div class="accordion-body bg-default text-bg-default"><p>E2E FAQ panel two body.</p></div></div></div>
<!-- /wp:mayflower-blocks/collapse --></div>
<!-- /wp:mayflower-blocks/collapsibles -->
MARKUP;

	return str_replace( $pattern_collapsibles, $replacement_collapsibles, $content );
}

/**
 * @param string $content Block markup.
 * @return string
 */
function e2e_application_guide_populate_accordion_callout( string $content ): string {
	$callout = '<!-- wp:bc-sitka-spruce/callout {"name":"bc-sitka-spruce/callout","data":{"display_callout":"1","_display_callout":"field_66b1334b05e6b","title":"E2E Accordion Callout","_title":"field_66b13323cdbd0","text":"E2E accordion section callout body.","_text":"field_66b1337a05e6c","links":"","_links":"field_66b1338d05e6d","button":"","_button":"field_673bccabb8e8e"},"mode":"preview"} /-->';

	return str_replace(
		'<!-- wp:bc-sitka-spruce/callout {"name":"bc-sitka-spruce/callout","mode":"preview"} /-->' . "\n" . '<!-- /wp:bc-sitka-spruce/accordion-section -->',
		$callout . "\n" . '<!-- /wp:bc-sitka-spruce/accordion-section -->',
		$content
	);
}

/**
 * @param string $content              Block markup.
 * @param int    $card_image_attachment_id Attachment ID.
 * @return string
 */
function e2e_application_guide_populate_resource_cards( string $content, int $card_image_attachment_id ): string {
	if ( $card_image_attachment_id <= 0 ) {
		return $content;
	}

	$card_one = '<!-- wp:bc-sitka-spruce/card-section-card {"cardTitle":"E2E Resource Card One","cardImageId":' . $card_image_attachment_id . '} -->' . "\n"
		. '<!-- wp:paragraph --><p>E2E additional resource card one body.</p><!-- /wp:paragraph -->' . "\n"
		. '<!-- /wp:bc-sitka-spruce/card-section-card -->';

	$card_two = '<!-- wp:bc-sitka-spruce/card-section-card {"cardTitle":"E2E Resource Card Two","cardImageId":' . $card_image_attachment_id . '} -->' . "\n"
		. '<!-- wp:paragraph --><p>E2E additional resource card two body.</p><!-- /wp:paragraph -->' . "\n"
		. '<!-- /wp:bc-sitka-spruce/card-section-card -->';

	$content = preg_replace(
		'#<!-- wp:bc-sitka-spruce/card-section-card /-->\s*<!-- wp:bc-sitka-spruce/card-section-card /-->\s*<!-- wp:bc-sitka-spruce/card-section-card /-->#',
		$card_one . "\n\n" . $card_two,
		$content,
		1
	) ?? $content;

	return $content;
}
