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
<!-- /wp:mayflower-blocks/lead --></div>
<!-- /wp:bc-sitka-spruce/narrow-content -->

<!-- wp:bc-sitka-spruce/tabs-section {"title":"E2E Tabs Section"} -->
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
<!-- wp:code -->
<pre class="wp-block-code"><code>E2E code sample</code></pre>
<!-- /wp:code -->
<!-- wp:details -->
<details class="wp-block-details"><summary>E2E details summary</summary><!-- wp:paragraph -->
<p>E2E details body.</p>
<!-- /wp:paragraph --></details>
<!-- /wp:details -->
<!-- wp:preformatted -->
<pre class="wp-block-preformatted">E2E preformatted</pre>
<!-- /wp:preformatted -->
<!-- wp:table -->
<figure class="wp-block-table"><table class="has-fixed-layout"><tbody><tr><td>E2E core table</td></tr></tbody></table></figure>
<!-- /wp:table -->
<!-- wp:tablepress/table {"id":"{$tablepress_id}","align":"wide"} /-->
<!-- wp:image -->
<figure class="wp-block-image"><img alt="E2E test image" src="/wp-content/themes/bc-sitka-spruce-department-theme/tests/fixtures/test-image-260x174.png"/></figure>
<!-- /wp:image -->
<!-- wp:gallery {"linkTo":"none"} -->
<figure class="wp-block-gallery has-nested-images columns-default is-cropped"><!-- wp:image -->
<figure class="wp-block-image"><img alt="" src="/wp-content/themes/bc-sitka-spruce-department-theme/tests/fixtures/test-image-260x174.png"/></figure>
<!-- /wp:image --></figure>
<!-- /wp:gallery -->
<!-- wp:audio /-->
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
<!-- /wp:paragraph --></div><figure class="wp-block-media-text__media"><img alt="" src="/wp-content/themes/bc-sitka-spruce-department-theme/tests/fixtures/test-image-260x174.png"/></figure></div>
<!-- /wp:media-text -->
<!-- wp:embed {"url":"{$embed_url}","type":"video","providerNameSlug":"youtube"} -->
<figure class="wp-block-embed is-type-video is-provider-youtube wp-block-embed-youtube"><div class="wp-block-embed__wrapper">
{$embed_url}
</div></figure>
<!-- /wp:embed -->
<!-- wp:html -->
<div class="e2e-custom-html">E2E custom HTML block</div>
<!-- /wp:html -->
<!-- wp:separator -->
<hr class="wp-block-separator has-alpha-channel-opacity"/>
<!-- /wp:separator -->
<!-- wp:spacer {"height":"24px"} -->
<div style="height:24px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->
<!-- wp:shortcode -->
[e2e_marker]
<!-- /wp:shortcode -->
<!-- wp:group -->
<div class="wp-block-group"><!-- wp:paragraph -->
<p>E2E grouped paragraph.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->
<!-- wp:mayflower-blocks/alert {"alertClass":"info","activeAlert":"info"} -->
<div class="wp-block-mayflower-blocks-alert alert alert-info"><!-- wp:paragraph -->
<p>E2E Mayflower alert.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:mayflower-blocks/alert -->
<!-- wp:mayflower-blocks/button {"buttonText":"E2E Mayflower Button","isBootstrap5":true} -->
<div class="wp-block-mayflower-blocks-button"><a class="btn btn-primary" href="https://example.com/e2e-button">E2E Mayflower Button</a></div>
<!-- /wp:mayflower-blocks/button -->
<!-- wp:mayflower-blocks/panel {"panelTitle":"E2E Panel"} -->
<div class="wp-block-mayflower-blocks-panel card"><div class="card-body"><!-- wp:paragraph -->
<p>E2E panel body.</p>
<!-- /wp:paragraph --></div></div>
<!-- /wp:mayflower-blocks/panel -->
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
<!-- wp:mayflower-blocks/well -->
<div class="wp-block-mayflower-blocks-well well"><!-- wp:paragraph -->
<p>E2E well content.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:mayflower-blocks/well -->
<!-- wp:mayflower-blocks/jumbotron {"jumbotronHeading":"E2E Jumbotron"} -->
<div class="wp-block-mayflower-blocks-jumbotron jumbotron"><!-- wp:paragraph -->
<p>E2E jumbotron text.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:mayflower-blocks/jumbotron -->
<!-- wp:mayflower-blocks/course {"courseTitle":"E2E Course Block"} -->
<div class="wp-block-mayflower-blocks-course"><p>E2E course block.</p></div>
<!-- /wp:mayflower-blocks/course -->
<!-- /wp:bc-sitka-spruce/body-section-content -->
<!-- /wp:bc-sitka-spruce/body-section -->
MARKUP;
}
