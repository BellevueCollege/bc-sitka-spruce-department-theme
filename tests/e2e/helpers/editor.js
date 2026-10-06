/**
 * Exit the code editor and return to the visual block editor if active.
 */
export async function exitCodeEditor( page ) {
	const exitButton = page.getByRole( 'button', { name: 'Exit code editor' } );
	if ( await exitButton.isVisible() ) {
		await exitButton.click();
	}
}

import { normalizeE2eUrlForPlaywright } from './e2e-navigation.js';

/**
 * @param {string | null} href
 * @return {string}
 */
function getAbsolutePublishedPageUrl( href ) {
	if ( ! href ) {
		throw new Error( 'Publish panel did not return a View Page link.' );
	}

	return normalizeE2eUrlForPlaywright( href );
}

/**
 * Publish the current post and return the frontend URL.
 */
export async function publishAndGetUrl( editor, page ) {
	await editor.publishPost();
	await page.waitForSelector( '.editor-post-publish-panel' );
	const href = await page
		.locator( '.editor-post-publish-panel a:has-text("View Page")' )
		.getAttribute( 'href' );

	return getAbsolutePublishedPageUrl( href );
}

/**
 * Open a published page and log whether banner images loaded.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} url
 * @return {Promise<void>}
 */
export async function visitPublishedFrontend( page, url ) {
	await page.goto( url );
}

/**
 * Prepare a new page in the block editor.
 */
export async function prepareEditorPage( { admin, editor, page } ) {
	await admin.createNewPost( { postType: 'page' } );
	await exitCodeEditor( page );
	await editor.canvas.locator( 'body' ).waitFor( { state: 'visible' } );
}

/**
 * Close the block inspector so editor screenshots use the full canvas width.
 *
 * @param {import('@playwright/test').Page} page
 * @return {Promise<void>}
 */
export async function closeEditorSettingsSidebar( page ) {
	const closeButton = page.getByRole( 'button', { name: 'Close Settings' } );
	if ( await closeButton.isVisible() ) {
		await closeButton.click();
	}
}

/**
 * Hide core meta boxes below the canvas so tall blocks are not covered on narrow viewports.
 *
 * @param {import('@playwright/test').Page} page
 * @return {Promise<void>}
 */
export async function hideEditorMetaBoxesForScreenshot( page ) {
	await page.evaluate( () => {
		const metaBoxesArea = document.querySelector(
			'.edit-post-meta-boxes-area'
		);
		if ( metaBoxesArea instanceof HTMLElement ) {
			metaBoxesArea.style.display = 'none';
		}
	} );
}

/**
 * Close the block sidebar and, on mobile, hide meta boxes before editor screenshots.
 *
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').TestInfo} [testInfo]
 * @return {Promise<void>}
 */
export async function prepareEditorCanvasForScreenshot( page, testInfo ) {
	await closeEditorSettingsSidebar( page );

	if ( testInfo?.project?.name === 'mobile' ) {
		await hideEditorMetaBoxesForScreenshot( page );
	}
}

/**
 * Wait until images inside a screenshot target have finished loading.
 *
 * @param {import('@playwright/test').Locator} locator
 * @return {Promise<void>}
 */
export async function settleLocatorForScreenshot( locator ) {
	await locator.evaluate( async ( element ) => {
		const images = [ ...element.querySelectorAll( 'img' ) ];
		await Promise.all(
			images.map(
				( image ) =>
					new Promise( ( resolve ) => {
						if ( image.complete ) {
							resolve( undefined );
							return;
						}
						image.addEventListener( 'load', () => resolve( undefined ), {
							once: true,
						} );
						image.addEventListener( 'error', () => resolve( undefined ), {
							once: true,
						} );
					} )
			)
		);
	} );
}
