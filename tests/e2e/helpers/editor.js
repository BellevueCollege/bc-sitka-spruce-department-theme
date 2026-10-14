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
const DEFAULT_SCROLL_INTO_VIEW_TIMEOUT_MS = 30_000;

/**
 * Scroll a screenshot target into view and wait for descendant `<img>` elements
 * to finish loading and decode. Does not wait for CSS background images.
 *
 * @param {import('@playwright/test').Locator} locator
 * @param {{ perImageTimeoutMs?: number, scrollTimeoutMs?: number }} [options]
 * @return {Promise<void>}
 */
export async function settleLocatorForScreenshot( locator, options = {} ) {
	const perImageTimeoutMs =
		options.perImageTimeoutMs ?? DEFAULT_IMAGE_SETTLE_TIMEOUT_MS;
	const scrollTimeoutMs =
		options.scrollTimeoutMs ?? DEFAULT_SCROLL_INTO_VIEW_TIMEOUT_MS;

	await locator.scrollIntoViewIfNeeded( { timeout: scrollTimeoutMs } );

	await locator.evaluate(
		async ( element, timeoutMs ) => {
			const images = [ ...element.querySelectorAll( 'img' ) ];

			await Promise.all(
				images.map(
					( image ) =>
						new Promise( ( resolve ) => {
							let hasSettled = false;
							const finish = () => {
								if ( hasSettled ) {
									return;
								}
								hasSettled = true;
								resolve( undefined );
							};
							const deadline = Date.now() + timeoutMs;

							const isImageReady = () =>
								image.complete && image.naturalWidth > 0;

							const waitForDecode = () => {
								if ( typeof image.decode !== 'function' ) {
									finish();
									return;
								}

								// decode() can hang on remote browsers; cap wait per image.
								Promise.race( [
									image.decode().catch( () => undefined ),
									new Promise( ( resolve ) => {
										window.setTimeout( resolve, timeoutMs );
									} ),
								] ).then( finish );
							};

							if ( isImageReady() ) {
								waitForDecode();
								return;
							}

							const onLoadOrError = () => {
								if ( isImageReady() ) {
									waitForDecode();
									return;
								}

								finish();
							};

							image.addEventListener( 'load', onLoadOrError, {
								once: true,
							} );
							image.addEventListener( 'error', onLoadOrError, {
								once: true,
							} );

							const pollForNaturalWidth = () => {
								if ( hasSettled ) {
									return;
								}

								if ( isImageReady() ) {
									waitForDecode();
									return;
								}

								if ( Date.now() >= deadline ) {
									finish();
									return;
								}

								window.requestAnimationFrame( pollForNaturalWidth );
							};

							window.requestAnimationFrame( pollForNaturalWidth );
							window.setTimeout( finish, timeoutMs );
						} )
				)
			);
		},
		perImageTimeoutMs
	);
}

/**
 * Collect layout metrics for ±1px screenshot-dimension triage.
 *
 * Enable with `E2E_DEBUG_SCREENSHOT_GEOMETRY=1`. Logs target box, images, and
 * key computed styles without changing capture behavior.
 *
 * @param {import('@playwright/test').Locator} locator
 * @param {string} label
 * @return {Promise<void>}
 */
export async function logScreenshotGeometry( locator, label ) {
	if ( process.env.E2E_DEBUG_SCREENSHOT_GEOMETRY !== '1' ) {
		return;
	}

	const geometry = await locator.evaluate( ( element ) => {
		const targetStyles = window.getComputedStyle( element );
		const targetRect = element.getBoundingClientRect();

		const images = [ ...element.querySelectorAll( 'img' ) ].map(
			( image ) => {
				const imageRect = image.getBoundingClientRect();
				return {
					currentSrc: image.currentSrc,
					complete: image.complete,
					naturalWidth: image.naturalWidth,
					naturalHeight: image.naturalHeight,
					rect: {
						x: imageRect.x,
						y: imageRect.y,
						width: imageRect.width,
						height: imageRect.height,
					},
				};
			}
		);

		return {
			tagName: element.tagName,
			className: element.className,
			rect: {
				x: targetRect.x,
				y: targetRect.y,
				width: targetRect.width,
				height: targetRect.height,
				bottom: targetRect.bottom,
			},
			styles: {
				fontFamily: targetStyles.fontFamily,
				fontSize: targetStyles.fontSize,
				lineHeight: targetStyles.lineHeight,
				padding: targetStyles.padding,
				margin: targetStyles.margin,
			},
			images,
		};
	} );

	console.log(
		`[e2e] screenshot geometry (${ label }): ${ JSON.stringify( geometry ) }`
	);
}
