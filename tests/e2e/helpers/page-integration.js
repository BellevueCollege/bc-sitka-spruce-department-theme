import { setTimeout as delay } from 'node:timers/promises';
import { expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { settlePageImagesForScreenshot } from './editor.js';
import { normalizeE2eUrlForPlaywright } from './e2e-navigation.js';

const VISIT_INTEGRATION_MAX_ATTEMPTS = 6;
const VISIT_INTEGRATION_BASE_RETRY_DELAY_MS = 1_000;

/**
 * @param {unknown} error
 * @return {boolean}
 */
function isRetryableNavigationError( error ) {
	if ( ! ( error instanceof Error ) ) {
		return false;
	}

	return (
		error.name === 'TimeoutError' ||
		error.message.includes( 'page.goto: Timeout' ) ||
		error.message.includes( 'net::ERR_' )
	);
}

/** WCAG tags for scoped page integration axe runs. */
export const WCAG_TAGS = [
	'wcag2a',
	'wcag2aa',
	'wcag22a',
	'wcag22aa',
	'best-practice',
];

/**
 * axe-core ships WCAG 2.2 rules (including target-size / 2.5.8) disabled.
 * Enable them explicitly whenever we audit with WCAG_TAGS.
 */
export const AXE_RULE_OPTIONS = {
	rules: {
		'target-size': { enabled: true },
	},
};

/**
 * Build a tagged AxeBuilder with WCAG 2.2 target-size enabled.
 *
 * @param {import('@playwright/test').Page} page
 * @return {import('@axe-core/playwright').default}
 */
export function createAxeBuilder( page ) {
	return new AxeBuilder( { page } )
		.withTags( WCAG_TAGS )
		.options( AXE_RULE_OPTIONS );
}

/**
 * Summarize axe nodes for readable Playwright failure output.
 *
 * @param {import('axe-core').Result[]} rules
 * @return {string}
 */
export function formatAxeRuleFindings( rules ) {
	if ( ! rules.length ) {
		return '(none)';
	}

	return rules
		.map( ( rule ) => {
			const nodes = rule.nodes
				.map( ( node ) => {
					const target = node.target.join( ' ' );
					const summary = node.failureSummary || node.message || '';
					return `  - ${ target }${ summary ? `: ${ summary }` : '' }`;
				} )
				.join( '\n' );

			return `${ rule.id } (${ rule.impact || 'unknown' }): ${ rule.help }\n${ nodes }`;
		} )
		.join( '\n' );
}

/**
 * Fail when axe reports violations, or target-size incompletes that need review.
 *
 * @param {import('axe-core').AxeResults} results
 */
export function expectNoAxeViolations( results ) {
	const targetSizeIncomplete = results.incomplete.filter(
		( rule ) => rule.id === 'target-size'
	);

	expect(
		results.violations,
		`axe violations:\n${ formatAxeRuleFindings( results.violations ) }`
	).toEqual( [] );

	expect(
		targetSizeIncomplete,
		`axe target-size incomplete (needs review):\n${ formatAxeRuleFindings(
			targetSizeIncomplete
		) }`
	).toEqual( [] );
}

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
 * Disable sticky site header so full-page / tall element stitches do not repaint it mid-capture.
 *
 * Shared by [`prepareFullPageScreenshot`] and [`prepareAdjacencyScreenshot`]. Image settle
 * lives in `editor.js` (see tests/AGENTS.md). This is not a `screenshot-stability.css` pin.
 *
 * @param {import('@playwright/test').Page} page
 * @return {Promise<void>}
 */
async function disableStickySiteHeaderForScreenshot( page ) {
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
 * Prepare the page for a full-page visual baseline (image settle + fonts).
 *
 * Does not pin layout metrics (footer rem, image box sizes). Sticky-off stays
 * on [`prepareAdjacencyScreenshot`] for tall element stitches only.
 *
 * @param {import('@playwright/test').Page} page
 * @return {Promise<void>}
 */
export async function prepareFullPageScreenshot( page ) {
	await settlePageImagesForScreenshot( page );
	await page.evaluate( () => document.fonts.ready );
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
		let response;
		try {
			response = await page.goto( normalized, {
				waitUntil: 'domcontentloaded',
			} );
		} catch ( gotoError ) {
			if (
				isRetryableNavigationError( gotoError ) &&
				attempt < VISIT_INTEGRATION_MAX_ATTEMPTS
			) {
				await delay( VISIT_INTEGRATION_BASE_RETRY_DELAY_MS * attempt );
				continue;
			}

			throw gotoError;
		}

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
 * Click a tabcordion tab or accordion control after scrolling it clear of the
 * sticky `#header-wrapper`. Playwright's built-in scroll-into-view can leave the
 * control under the sticky header, so Bootstrap never receives the click.
 *
 * @param {import('@playwright/test').Locator} locator
 * @return {Promise<void>}
 */
export async function clickTabcordionControl( locator ) {
	await locator.evaluate( ( element ) => {
		element.scrollIntoView( { block: 'center', inline: 'nearest' } );
	} );
	await locator.click();
}

/**
 * Run a scoped axe audit with WCAG tags and target-size enabled.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} selector
 * @return {Promise<import('axe-core').AxeResults>}
 */
export async function runAxeOnSelector( page, selector ) {
	return createAxeBuilder( page ).include( selector ).analyze();
}

/**
 * Run a document-wide axe audit with WCAG tags and target-size enabled.
 *
 * Prefer this when the situation should cover header, main, footer, and
 * unexpected chrome — not a single content region.
 *
 * @param {import('@playwright/test').Page} page
 * @return {Promise<import('axe-core').AxeResults>}
 */
export async function runAxeOnPage( page ) {
	return createAxeBuilder( page ).analyze();
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
	await disableStickySiteHeaderForScreenshot( page );
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
