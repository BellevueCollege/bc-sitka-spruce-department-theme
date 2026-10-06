import { expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { normalizeE2eUrlForPlaywright } from './e2e-navigation.js';
import { skipDuplicateBlockViewport } from './viewports.js';

/** WCAG tags for scoped page integration axe runs. */
export const WCAG_TAGS = [
	'wcag2a',
	'wcag2aa',
	'wcag22a',
	'wcag22aa',
	'best-practice',
];

/**
 * Page screenshot options for long templates.
 *
 * `toHaveScreenshot` on a page captures only the viewport unless `fullPage` is set.
 */
export const FULL_PAGE_SCREENSHOT_OPTIONS = {
	fullPage: true,
	maxDiffPixelRatio: 0.02,
};

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} url
 */
export async function visitIntegrationPage( page, url ) {
	await page.goto( normalizeE2eUrlForPlaywright( url ) );
	await page.locator( '#header-wrapper' ).waitFor( { state: 'visible' } );
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} selector
 */
export async function runAxeOnSelector( page, selector ) {
	const results = await new AxeBuilder( { page } )
		.include( selector )
		.withTags( WCAG_TAGS )
		.analyze();

	return results;
}

/**
 * @param {import('@playwright/test').TestInfo} testInfo
 */
export function skipAriaOnDuplicateViewport( testInfo ) {
	skipDuplicateBlockViewport( testInfo );
}

/**
 * Assert headings appear in document order.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string[]} texts
 */
export async function expectHeadingOrder( page, texts ) {
	let previousY = -1;

	for ( const text of texts ) {
		const heading = page.getByRole( 'heading', { name: text } ).first();
		await heading.waitFor( { state: 'visible' } );
		const box = await heading.boundingBox();
		const y = box?.y ?? 0;
		if ( previousY >= 0 ) {
			expect( y ).toBeGreaterThanOrEqual( previousY );
		}
		previousY = y;
	}
}
