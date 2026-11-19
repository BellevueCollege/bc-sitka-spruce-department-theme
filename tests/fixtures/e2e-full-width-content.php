<?php
/**
 * Full-width (no-sidebar) page markup for Playwright integration tests.
 *
 * @package BcSitkaSpruce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @return string
 */
function e2e_full_width_page_block_markup(): string {
	return <<<'MARKUP'
<!-- wp:bc-sitka-spruce/body-section -->
<!-- wp:bc-sitka-spruce/body-section-content -->
<!-- wp:heading -->
<h2 class="wp-block-heading">E2E Full Width Heading</h2>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>E2E full width body copy without navigation sidebar.</p>
<!-- /wp:paragraph -->
<!-- /wp:bc-sitka-spruce/body-section-content -->
<!-- /wp:bc-sitka-spruce/body-section -->
MARKUP;
}
