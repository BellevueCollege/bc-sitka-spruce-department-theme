import { setTimeout as delay } from 'node:timers/promises';
import { expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { normalizeE2eUrlForPlaywright } from './e2e-navigation.js';

const VISIT_INTEGRATION_MAX_ATTEMPTS = 6;
const VISIT_INTEGRATION_BASE_RETRY_DELAY_MS = 1_000;

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
	const normalized = normalizeE2eUrlForPlaywright( url );

	for ( let attempt = 1; attempt <= VISIT_INTEGRATION_MAX_ATTEMPTS; attempt++ ) {
		const response = await page.goto( normalized, {
			waitUntil: 'domcontentloaded',
		} );
		const status = response?.status() ?? 0;

		// #region agent log
		fetch( 'http://127.0.0.1:7247/ingest/cdee1a20-8a01-40a2-b3ce-d42ed32a62b2', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Debug-Session-Id': '6a545d',
			},
			body: JSON.stringify( {
				sessionId: '6a545d',
				location: 'page-integration.js:visitIntegrationPage',
				message: 'goto attempt',
				data: { attempt, status, normalized },
				timestamp: Date.now(),
				hypothesisId: 'H1',
			} ),
		} ).catch( () => {} );
		// #endregion

		if ( status > 0 && status < 500 ) {
			break;
		}

		if ( attempt === VISIT_INTEGRATION_MAX_ATTEMPTS ) {
			throw new Error(
				`visitIntegrationPage failed after ${ VISIT_INTEGRATION_MAX_ATTEMPTS } attempts (HTTP ${ status }): ${ normalized }`
			);
		}

		await delay( VISIT_INTEGRATION_BASE_RETRY_DELAY_MS * attempt );
	}

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
