import { normalizeE2eUrlForPlaywright } from './e2e-navigation.js';

/**
 * Exit the code editor and return to the visual block editor if active.
 */
export async function exitCodeEditor( page ) {
	const exitButton = page.getByRole( 'button', { name: 'Exit code editor' } );
	if ( await exitButton.isVisible() ) {
		await exitButton.click();
	}
}

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
	const viewPageLink = page.locator(
		'.editor-post-publish-panel a:has-text("View Page")'
	);
	await viewPageLink.waitFor( { state: 'visible', timeout: 30_000 } );
	const href = await viewPageLink.getAttribute( 'href' );

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
	await page.goto( url, { waitUntil: 'domcontentloaded' } );
}

/**
 * Dismiss the "Choose a pattern" starter modal if it appears.
 *
 * Preferences should prevent it; this is a defensive fallback when multisite
 * preference meta was not seeded for the current blog.
 *
 * @param {import('@playwright/test').Page} page
 * @return {Promise<boolean>} Whether a modal was dismissed.
 */
export async function dismissStarterPatternModal( page ) {
	const dialog = page.getByRole( 'dialog', { name: /choose a pattern/i } );
	if ( ! ( await dialog.isVisible().catch( () => false ) ) ) {
		return false;
	}

	const closeButton = dialog.getByRole( 'button', { name: /close/i } );
	if ( await closeButton.isVisible().catch( () => false ) ) {
		await closeButton.click();
	} else {
		await page.keyboard.press( 'Escape' );
	}

	await dialog.waitFor( { state: 'hidden', timeout: 5_000 } ).catch( () => {} );
	return true;
}

/**
 * Prepare a new page in the block editor.
 */
export async function prepareEditorPage( { admin, editor, page } ) {
	await admin.createNewPost( { postType: 'page' } );
	await exitCodeEditor( page );
	await dismissStarterPatternModal( page );
	await editor.canvas.locator( 'body' ).waitFor( { state: 'visible' } );
}

const EDITOR_SETTINGS_SIDEBAR_SELECTORS = [
	'.interface-complementary-area',
	'.editor-sidebar',
	'.edit-post-sidebar',
].join( ', ' );

/**
 * @param {import('@playwright/test').Page} page
 * @return {Promise<boolean>}
 */
async function isEditorSettingsSidebarOpen( page ) {
	return page
		.locator( EDITOR_SETTINGS_SIDEBAR_SELECTORS )
		.first()
		.isVisible()
		.catch( () => false );
}

/**
 * Close the block inspector so editor screenshots use the full canvas width.
 *
 * WordPress versions differ: some expose "Close Settings", others only a pressed
 * Settings toolbar toggle or a generic Close control inside the sidebar.
 *
 * @param {import('@playwright/test').Page} page
 * @return {Promise<void>}
 */
export async function closeEditorSettingsSidebar( page ) {
	if ( ! ( await isEditorSettingsSidebarOpen( page ) ) ) {
		return;
	}

	const closeSettingsButton = page.getByRole( 'button', {
		name: 'Close Settings',
	} );
	const closeSettingsVisible =
		( await closeSettingsButton.count() ) > 0 &&
		( await closeSettingsButton.first().isVisible() );

	if ( closeSettingsVisible ) {
		await closeSettingsButton.first().click();
	} else {
		const pressedSettingsToggle = page.getByRole( 'button', {
			name: /settings/i,
			pressed: true,
		} );
		if (
			( await pressedSettingsToggle.count() ) > 0 &&
			( await pressedSettingsToggle.first().isVisible() )
		) {
			await pressedSettingsToggle.first().click();
		} else {
			const sidebarCloseButton = page
				.locator( EDITOR_SETTINGS_SIDEBAR_SELECTORS )
				.getByRole( 'button', { name: /^Close$/i } )
				.first();
			if ( await sidebarCloseButton.isVisible().catch( () => false ) ) {
				await sidebarCloseButton.click();
			}
		}
	}

	await page
		.locator( EDITOR_SETTINGS_SIDEBAR_SELECTORS )
		.first()
		.waitFor( { state: 'hidden', timeout: 5_000 } )
		.catch( () => {} );
}

/**
 * Hide core meta boxes below the canvas so tall blocks are not covered on narrow viewports.
 *
 * @param {import('@playwright/test').Page} page
 * @return {Promise<void>}
 */
export async function hideEditorMetaBoxesForScreenshot( page ) {
	await page.evaluate( () => {
		const hideTargets = [
			'.edit-post-meta-boxes-area',
			'.edit-post-meta-boxes-main',
			'.interface-interface-skeleton__footer',
		];

		for ( const selector of hideTargets ) {
			document.querySelectorAll( selector ).forEach( ( element ) => {
				if ( element instanceof HTMLElement ) {
					element.style.display = 'none';
				}
			} );
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
	await dismissStarterPatternModal( page );
	await closeEditorSettingsSidebar( page );

	if ( testInfo?.project?.name === 'mobile' ) {
		await hideEditorMetaBoxesForScreenshot( page );
	}
}

const DEFAULT_IMAGE_SETTLE_TIMEOUT_MS = 5_000;

/**
 * Wait until images inside a screenshot target have finished loading.
 *
 * @param {import('@playwright/test').Locator} locator
 * @param {{ perImageTimeoutMs?: number }} [options]
 * @return {Promise<void>}
 */
export async function settleLocatorForScreenshot( locator, options = {} ) {
	const perImageTimeoutMs =
		options.perImageTimeoutMs ?? DEFAULT_IMAGE_SETTLE_TIMEOUT_MS;

	await locator.evaluate(
		async ( element, timeoutMs ) => {
			const images = [ ...element.querySelectorAll( 'img' ) ];
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
							window.setTimeout( done, timeoutMs );
						} )
				)
			);
		},
		perImageTimeoutMs
	);
}
