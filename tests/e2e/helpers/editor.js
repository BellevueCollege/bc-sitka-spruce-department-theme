import path from 'path';
import { normalizeE2eUrlForPlaywright } from './e2e-navigation.js';

// Theme root is process.cwd() for Playwright / wp-scripts (no import.meta — CJS load).
const SCREENSHOT_STABILITY_CSS_PATH = path.join(
	process.cwd(),
	'tests/e2e/helpers/screenshot-stability.css'
);

/** @type {WeakSet<import('@playwright/test').Page>} */
const pagesWithScreenshotStabilityStyles = new WeakSet();

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
const DEFAULT_FULL_PAGE_LAZY_LOAD_SCROLL_STEP_PX = 800;

/**
 * Browser-side: wait for `<img>` load + decode under a root node.
 * Passed into Playwright `evaluate` (locator or page). Does not cover CSS backgrounds.
 *
 * @param {ParentNode} root
 * @param {number} timeoutMs
 * @return {Promise<void>}
 */
async function settleImagesInRootForScreenshot( root, timeoutMs ) {
	const images = [ ...root.querySelectorAll( 'img' ) ];

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
							new Promise( ( raceResolve ) => {
								window.setTimeout( raceResolve, timeoutMs );
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
}

/**
 * Apply screenshot-stability.css before measuring/snapping an element.
 *
 * Playwright `stylePath` injects that file only during `toHaveScreenshot`,
 * which is too late: snap would measure pre-stylePath layout, then capture
 * grows/shrinks by 1–2px when `display:block` (etc.) applies. Same file as
 * stylePath — not a second rule set.
 *
 * @param {import('@playwright/test').Page} page
 * @return {Promise<void>}
 */
export async function ensureScreenshotStabilityStyles( page ) {
	if ( pagesWithScreenshotStabilityStyles.has( page ) ) {
		return;
	}

	await page.addStyleTag( { path: SCREENSHOT_STABILITY_CSS_PATH } );
	pagesWithScreenshotStabilityStyles.add( page );
}

/**
 * Align the locator to integer CSS pixels for element screenshots.
 *
 * Applies screenshot-stability.css first (see ensureScreenshotStabilityStyles),
 * then capture-only:
 * 1) `translateY` so the top edge is on an integer pixel
 * 2) `min-height` / `min-width` set to `Math.ceil` of the *measured* box
 *
 * The ceil is derived from the live layout each run — not a magic pixel
 * constant — so real design size changes still change the screenshot size.
 * Call after settle, before `toHaveScreenshot`.
 *
 * @param {import('@playwright/test').Locator} locator
 * @return {Promise<void>}
 */
export async function snapLocatorToIntegerCssPixel( locator ) {
	const page = locator.page();
	await ensureScreenshotStabilityStyles( page );

	await locator.evaluate( ( element ) => {
		const FLOAT_EPSILON = 1e-6;
		const beforeSnap = element.getBoundingClientRect();
		const fractionalY = beforeSnap.top - Math.floor( beforeSnap.top );

		if ( fractionalY > FLOAT_EPSILON ) {
			element.style.setProperty(
				'transform',
				`translateY(${ -fractionalY }px)`,
				'important'
			);
		}

		const afterYSnap = element.getBoundingClientRect();
		const heightCeil = Math.ceil( afterYSnap.height - FLOAT_EPSILON );
		const widthCeil = Math.ceil( afterYSnap.width - FLOAT_EPSILON );

		if ( heightCeil > afterYSnap.height + FLOAT_EPSILON ) {
			element.style.setProperty( 'box-sizing', 'border-box', 'important' );
			element.style.setProperty(
				'min-height',
				`${ heightCeil }px`,
				'important'
			);
		}

		if ( widthCeil > afterYSnap.width + FLOAT_EPSILON ) {
			element.style.setProperty( 'box-sizing', 'border-box', 'important' );
			element.style.setProperty(
				'min-width',
				`${ widthCeil }px`,
				'important'
			);
		}
	} );
}

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
		settleImagesInRootForScreenshot,
		perImageTimeoutMs
	);
}

/**
 * Lazy-load scroll the document, then settle all `<img>` load + decode for full-page shots.
 *
 * Used by [`prepareFullPageScreenshot`](./page-integration.js). Image settle stays in this
 * file (tests/AGENTS.md) and reuses `settleLocatorForScreenshot` on `body`.
 *
 * @param {import('@playwright/test').Page} page
 * @param {{ perImageTimeoutMs?: number, scrollStepPx?: number }} [options]
 * @return {Promise<void>}
 */
export async function settlePageImagesForScreenshot( page, options = {} ) {
	const perImageTimeoutMs =
		options.perImageTimeoutMs ?? DEFAULT_IMAGE_SETTLE_TIMEOUT_MS;
	const scrollStepPx =
		options.scrollStepPx ?? DEFAULT_FULL_PAGE_LAZY_LOAD_SCROLL_STEP_PX;

	await page.evaluate( async ( stepPx ) => {
		const delay = ( ms ) =>
			new Promise( ( resolve ) => {
				window.setTimeout( resolve, ms );
			} );

		const maxScroll = Math.max(
			document.body.scrollHeight,
			document.documentElement.scrollHeight
		);
		for ( let y = 0; y <= maxScroll; y += stepPx ) {
			window.scrollTo( 0, y );
			await delay( 50 );
		}
	}, scrollStepPx );

	await settleLocatorForScreenshot( page.locator( 'body' ), {
		perImageTimeoutMs,
	} );

	await page.evaluate( () => window.scrollTo( 0, 0 ) );
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
