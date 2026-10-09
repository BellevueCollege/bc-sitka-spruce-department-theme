<?php
/**
 * Block markup for the E2E flexible page (sidebar + WYSIWYG stack).
 *
 * @package BcSitkaSpruce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @param string $tablepress_id TablePress table id for the tablepress/table block.
 * @return string
 */
function e2e_flexible_page_block_markup( string $tablepress_id ): string {
	$embed_url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

	return <<<MARKUP
<!-- wp:bc-sitka-spruce/narrow-content -->
<div class="wp-block-bc-sitka-spruce-narrow-content narrow-content"><!-- wp:mayflower-blocks/lead -->
<p class="wp-block-mayflower-blocks-lead lead">E2E Flexible lead paragraph.</p>
<!-- /wp:mayflower-blocks/lead -->

<!-- wp:mayflower-blocks/alert {"alertClass":"warning","activeAlert":"warning"} -->
<div class="wp-block-mayflower-blocks-alert alert alert-warning"><!-- wp:paragraph -->
<p>E2E narrow column warning alert.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:mayflower-blocks/alert -->

<!-- wp:mayflower-blocks/button {"buttonText":"E2E Narrow Button","buttonStyle":"secondary","isBootstrap5":true} -->
<div class="wp-block-mayflower-blocks-button"><a class="btn btn-secondary" href="https://example.com/e2e-narrow-button">E2E Narrow Button</a></div>
<!-- /wp:mayflower-blocks/button --></div>
<!-- /wp:bc-sitka-spruce/narrow-content -->

<!-- wp:bc-sitka-spruce/tabs-section {"title":"E2E Tabs Section","description":"E2E tabs section intro copy.","linkTitle":"E2E tabs section link","linkUrl":"https://example.com/e2e-tabs","anchor":"e2e-flex-tabs-section"} -->
<!-- wp:bc-sitka-spruce/tabcordion {"blockId":"e2e-flex-tabcordion","headingLevel":"h3"} -->
<!-- wp:bc-sitka-spruce/tabcordion-list -->
<!-- wp:bc-sitka-spruce/tabcordion-list-tab {"tabActive":true,"tabId":"e2e-tab-one","tabTitle":"E2E Tab One","tabDefault":true} /-->
<!-- wp:bc-sitka-spruce/tabcordion-list-tab {"tabId":"e2e-tab-two","tabTitle":"E2E Tab Two"} /-->
<!-- /wp:bc-sitka-spruce/tabcordion-list -->
<!-- wp:bc-sitka-spruce/tabcordion-content -->
<!-- wp:bc-sitka-spruce/tabcordion-content-panel {"tabActive":true,"tabId":"e2e-tab-one","tabTitle":"E2E Tab One","tabDefault":true} -->
<!-- wp:paragraph -->
<p>E2E tab panel one content.</p>
<!-- /wp:paragraph -->
<!-- /wp:bc-sitka-spruce/tabcordion-content-panel -->
<!-- wp:bc-sitka-spruce/tabcordion-content-panel {"tabId":"e2e-tab-two","tabTitle":"E2E Tab Two"} -->
<!-- wp:paragraph -->
<p>E2E tab panel two content.</p>
<!-- /wp:paragraph -->
<!-- /wp:bc-sitka-spruce/tabcordion-content-panel -->
<!-- /wp:bc-sitka-spruce/tabcordion-content -->
<!-- /wp:bc-sitka-spruce/tabcordion -->
<!-- /wp:bc-sitka-spruce/tabs-section -->

<!-- wp:bc-sitka-spruce/body-section -->
<!-- wp:bc-sitka-spruce/body-section-content -->
<!-- wp:paragraph -->
<p>E2E flexible paragraph.</p>
<!-- /wp:paragraph -->
<!-- wp:heading -->
<h2 class="wp-block-heading">E2E Flexible Heading</h2>
<!-- /wp:heading -->
<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li>E2E list item</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->
<!-- wp:quote -->
<blockquote class="wp-block-quote"><!-- wp:paragraph -->
<p>E2E quote text.</p>
<!-- /wp:paragraph --></blockquote>
<!-- /wp:quote -->
<!-- wp:table -->
<figure class="wp-block-table"><table class="has-fixed-layout"><tbody><tr><td>E2E core table</td></tr></tbody></table></figure>
<!-- /wp:table -->
<!-- wp:tablepress/table {"id":"{$tablepress_id}","align":"wide"} /-->
<!-- wp:image -->
<figure class="wp-block-image"><img alt="E2E test image" src="/wp-content/themes/bc-sitka-spruce-department-theme/tests/fixtures/test-image-260x174.png"/></figure>
<!-- /wp:image -->
<!-- wp:gallery {"linkTo":"none"} -->
<figure class="wp-block-gallery has-nested-images columns-default is-cropped"><!-- wp:image -->
<figure class="wp-block-image"><img alt="E2E gallery fixture image" src="/wp-content/themes/bc-sitka-spruce-department-theme/tests/fixtures/test-image-260x174.png"/></figure>
<!-- /wp:image --></figure>
<!-- /wp:gallery -->
<!-- wp:cover {"overlayColor":"black","dimRatio":50,"isUserOverlayColor":true} -->
<div class="wp-block-cover"><span aria-hidden="true" class="wp-block-cover__background has-black-background-color has-background-dim"></span><div class="wp-block-cover__inner-container"><!-- wp:paragraph {"align":"center"} -->
<p class="has-text-align-center">E2E cover inner</p>
<!-- /wp:paragraph --></div></div>
<!-- /wp:cover -->
<!-- wp:file -->
<div class="wp-block-file"><a href="https://example.com/e2e-sample.pdf">E2E sample file</a></div>
<!-- /wp:file -->
<!-- wp:media-text {"mediaPosition":"right"} -->
<div class="wp-block-media-text is-stacked-on-mobile"><div class="wp-block-media-text__content"><!-- wp:paragraph -->
<p>E2E media-text content.</p>
<!-- /wp:paragraph --></div><figure class="wp-block-media-text__media"><img alt="E2E media-text fixture image" src="/wp-content/themes/bc-sitka-spruce-department-theme/tests/fixtures/test-image-260x174.png"/></figure></div>
<!-- /wp:media-text -->
<!-- wp:embed {"url":"{$embed_url}","type":"video","providerNameSlug":"youtube"} -->
<figure class="wp-block-embed is-type-video is-provider-youtube wp-block-embed-youtube"><div class="wp-block-embed__wrapper">
{$embed_url}
</div></figure>
<!-- /wp:embed -->
<!-- wp:separator -->
<hr class="wp-block-separator has-alpha-channel-opacity"/>
<!-- /wp:separator -->
<!-- wp:spacer {"height":"24px"} -->
<div style="height:24px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->
<!-- wp:shortcode -->
[e2e_marker]
<!-- /wp:shortcode -->
<!-- wp:mayflower-blocks/alert {"alertClass":"info","activeAlert":"info"} -->
<div class="wp-block-mayflower-blocks-alert alert alert-info"><!-- wp:paragraph -->
<p>E2E Mayflower alert.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:mayflower-blocks/alert -->
<!-- wp:mayflower-blocks/alert {"alertClass":"danger","activeAlert":"danger"} -->
<div class="wp-block-mayflower-blocks-alert alert alert-danger"><!-- wp:paragraph -->
<p>E2E Mayflower danger alert.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:mayflower-blocks/alert -->
<!-- wp:mayflower-blocks/button {"buttonText":"E2E Mayflower Button","isBootstrap5":true} -->
<div class="wp-block-mayflower-blocks-button"><a class="btn btn-primary" href="https://example.com/e2e-button">E2E Mayflower Button</a></div>
<!-- /wp:mayflower-blocks/button -->
<!-- wp:mayflower-blocks/button {"buttonText":"E2E Secondary Button","buttonStyle":"secondary","isBootstrap5":true} -->
<div class="wp-block-mayflower-blocks-button"><a class="btn btn-secondary" href="https://example.com/e2e-secondary-button">E2E Secondary Button</a></div>
<!-- /wp:mayflower-blocks/button -->
<!-- wp:mayflower-blocks/button-group {"_btnDisableBlockInline":true,"_btnTypeDefault":"primary"} -->
<div class="wp-block-mayflower-blocks-button-group btn-group"><!-- wp:mayflower-blocks/button {"buttonText":"E2E Group Button One","isBootstrap5":true} -->
<div class="wp-block-mayflower-blocks-button"><a class="btn btn-primary" href="https://example.com/e2e-group-one">E2E Group Button One</a></div>
<!-- /wp:mayflower-blocks/button -->
<!-- wp:mayflower-blocks/button {"buttonText":"E2E Group Button Two","buttonStyle":"secondary","isBootstrap5":true} -->
<div class="wp-block-mayflower-blocks-button"><a class="btn btn-secondary" href="https://example.com/e2e-group-two">E2E Group Button Two</a></div>
<!-- /wp:mayflower-blocks/button --></div>
<!-- /wp:mayflower-blocks/button-group -->
<!-- wp:mayflower-blocks/panel {"panelTitle":"E2E Panel"} -->
<div class="wp-block-mayflower-blocks-panel card"><div class="card-body"><!-- wp:paragraph -->
<p>E2E panel body.</p>
<!-- /wp:paragraph --></div></div>
<!-- /wp:mayflower-blocks/panel -->
<!-- wp:mayflower-blocks/collapsibles {"currentBlockClientId":"e2e-flex-collapsibles","isBootstrap5":true} -->
<div class="wp-block-mayflower-blocks-collapsibles accordion" id="accordion_e2e-flex-collapsibles"><!-- wp:mayflower-blocks/collapse {"currentBlockClientId":"e2e-flex-collapse-one","parentBlockClientId":"e2e-flex-collapsibles","isBootstrap5":true} -->
<div class="wp-block-mayflower-blocks-collapse accordion-item"><h3 class="accordion-header mb-0" id="heading_e2e-flex-collapse-one"><button class="accordion-button bg-default text-bg-default" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_e2e-flex-collapse-one" aria-expanded="true" aria-controls="collapse_e2e-flex-collapse-one">E2E Flexible Collapse One</button></h3><div id="collapse_e2e-flex-collapse-one" class="accordion-collapse collapse show" aria-labelledby="heading_e2e-flex-collapse-one" data-bs-parent="#accordion_e2e-flex-collapsibles"><div class="accordion-body bg-default text-bg-default"><p>E2E flexible collapsible panel one.</p></div></div></div>
<!-- /wp:mayflower-blocks/collapse -->
<!-- wp:mayflower-blocks/collapse {"currentBlockClientId":"e2e-flex-collapse-two","parentBlockClientId":"e2e-flex-collapsibles","isBootstrap5":true} -->
<div class="wp-block-mayflower-blocks-collapse accordion-item"><h3 class="accordion-header mb-0" id="heading_e2e-flex-collapse-two"><button class="accordion-button bg-default text-bg-default collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_e2e-flex-collapse-two" aria-expanded="false" aria-controls="collapse_e2e-flex-collapse-two">E2E Flexible Collapse Two</button></h3><div id="collapse_e2e-flex-collapse-two" class="accordion-collapse collapse" aria-labelledby="heading_e2e-flex-collapse-two" data-bs-parent="#accordion_e2e-flex-collapsibles"><div class="accordion-body bg-default text-bg-default"><p>E2E flexible collapsible panel two.</p></div></div></div>
<!-- /wp:mayflower-blocks/collapse --></div>
<!-- /wp:mayflower-blocks/collapsibles -->
<!-- wp:mayflower-blocks/row -->
<div class="wp-block-mayflower-blocks-row row"><!-- wp:mayflower-blocks/column -->
<div class="wp-block-mayflower-blocks-column col-md-6"><!-- wp:paragraph -->
<p>E2E column one.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:mayflower-blocks/column -->
<!-- wp:mayflower-blocks/column -->
<div class="wp-block-mayflower-blocks-column col-md-6"><!-- wp:paragraph -->
<p>E2E column two.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:mayflower-blocks/column --></div>
<!-- /wp:mayflower-blocks/row -->
<!-- wp:mayflower-blocks/course {"courseTitle":"E2E Course Block"} -->
<div class="wp-block-mayflower-blocks-course"><p>E2E course block.</p></div>
<!-- /wp:mayflower-blocks/course -->
<!-- /wp:bc-sitka-spruce/body-section-content -->
<!-- /wp:bc-sitka-spruce/body-section -->
MARKUP;
}
