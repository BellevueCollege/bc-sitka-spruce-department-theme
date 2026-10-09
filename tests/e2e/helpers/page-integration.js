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
/** Remote LambdaTest full-page captures need longer stability polling than the default 5s. */
const FULL_PAGE_SCREENSHOT_TIMEOUT_MS = 60_000;

export const FULL_PAGE_SCREENSHOT_OPTIONS = {
	fullPage: true,
	maxDiffPixelRatio: 0.02,
	timeout: FULL_PAGE_SCREENSHOT_TIMEOUT_MS,
};

/**
 * Wait for load, images, and non-sticky header before full-page visual baselines.
 *
 * @param {import('@playwright/test').Page} page
 * @return {Promise<void>}
 */
const FULL_PAGE_IMAGE_SETTLE_TIMEOUT_MS = 3_000;
const FULL_PAGE_LAZY_LOAD_SCROLL_STEP_PX = 800;

/**
 * Scroll the page and wait for images (including lazy-loaded) before full-page capture.
 *
 * @param {import('@playwright/test').Page} page
 * @return {Promise<void>}
 */
async function settleFullPageImages( page ) {
	await page.evaluate(
		async ( { scrollStepPx, perImageTimeoutMs } ) => {
			const delay = ( ms ) =>
				new Promise( ( resolve ) => {
					window.setTimeout( resolve, ms );
				} );

			const maxScroll = Math.max(
				document.body.scrollHeight,
				document.documentElement.scrollHeight
			);
			for ( let y = 0; y <= maxScroll; y += scrollStepPx ) {
				window.scrollTo( 0, y );
				await delay( 50 );
			}

			const images = [ ...document.querySelectorAll( 'img' ) ];
			await Promise.all(
				images.map(
					( image ) =>
						new Promise( ( resolve ) => {
							if ( image.complete ) {
								resolve( undefined );
								return;
							}

							const done = () => resolve( undefined );
							image.addEventListener( 'load', done, { once: true } );
							image.addEventListener( 'error', done, { once: true } );
							window.setTimeout( done, perImageTimeoutMs );
						} )
				)
			);

			window.scrollTo( 0, 0 );
		},
		{
			scrollStepPx: FULL_PAGE_LAZY_LOAD_SCROLL_STEP_PX,
			perImageTimeoutMs: FULL_PAGE_IMAGE_SETTLE_TIMEOUT_MS,
		}
	);
}

export async function prepareFullPageScreenshot( page ) {
	await settleFullPageImages( page );
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} snapshotName
 * @return {Promise<void>}
 */
export async function expectFullPageScreenshot( page, snapshotName ) {
	await prepareFullPageScreenshot( page );
	await expect( page ).toHaveScreenshot( snapshotName, FULL_PAGE_SCREENSHOT_OPTIONS );
}

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
 * Disable sticky site header for tall element screenshots.
 *
 * Playwright stitches element screenshots by scrolling; a sticky
 * `#header-wrapper` is re-painted on each slice and appears mid-capture.
 *
 * @param {import('@playwright/test').Page} page
 * @return {Promise<void>}
 */
export async function prepareAdjacencyScreenshot( page ) {
	await page.addStyleTag( {
		content: `
			#header-wrapper {
				position: relative !important;
				top: auto !important;
			}
		`,
	} );
	await page.evaluate( () => window.scrollTo( 0, 0 ) );
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
