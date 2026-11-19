import { expect } from '@playwright/test';

/**
 * Assert main-nav expand buttons are shown via Sitka's `(hover: none)` CSS.
 *
 * Sitka does not use Bellevue's Modernizr `.touchevents` class for the main
 * menu. Expand affordances appear under `@media (hover: none)` in
 * `src/scss/menus/_accessible-menus.scss`. Playwright enables that media
 * feature when the context has `hasTouch: true` (`test.use({ hasTouch: true })`).
 *
 * @param {import('@playwright/test').Page} page
 */
export async function expectMainNavExpandButtonsVisibleForTouch( page ) {
	const hoverNone = await page.evaluate(
		() => window.matchMedia( '(hover: none)' ).matches
	);
	expect(
		hoverNone,
		'Expected (hover: none) — use test.use({ hasTouch: true }) for this case'
	).toBe( true );

	const expandButton = page
		.locator( '#site-header--main-nav .menu-item__button' )
		.first();
	await expect( expandButton ).toBeVisible();
	await expect( expandButton ).toHaveCSS( 'opacity', '1' );
}

/**
 * Assert desktop main-nav expand buttons use pointer-target chrome while
 * keyboard focus is in the nav (`#site-header--main-nav:has(:focus-visible)`).
 *
 * @param {import('@playwright/test').Page} page
 */
export async function expectMainNavExpandButtonsVisibleForKeyboard( page ) {
	await openHeaderMenuIfCollapsed( page );

	const expandButtons = page.locator(
		'#site-header--main-nav .menu-item__button'
	);
	const expandButtonCount = await expandButtons.count();

	expect(
		expandButtonCount,
		'Expected seeded main nav to include expand buttons'
	).toBeGreaterThan( 0 );

	await expandButtons.first().focus();

	for ( let index = 0; index < expandButtonCount; index += 1 ) {
		await expect( expandButtons.nth( index ) ).toHaveCSS( 'opacity', '1' );
	}
}

/**
 * Open the header hamburger menu when navigation is collapsed (tablet/mobile).
 *
 * @param {import('@playwright/test').Page} page
 */
export async function openHeaderMenuIfCollapsed( page ) {
	const menuToggle = page.locator( '#site-header--site-title .menu-toggle' );

	if ( ! ( await menuToggle.isVisible() ) ) {
		return;
	}

	await menuToggle.click();
	// Bootstrap offcanvas, not a body.menu-expanded class.
	await expect( page.locator( '#site-header--offcanvas' ) ).toBeVisible();
	await expect( page.locator( '#site-header--main-nav' ) ).toBeVisible();
}

/**
 * Reveal a submenu in the main header navigation.
 *
 * Desktop uses hover; tablet/mobile use the accessible menu toggle button.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} parentLabel Top-level menu link label with children.
 */
export async function expandMainNavSubmenu( page, parentLabel ) {
	const mainNav = page.locator( '#site-header--main-nav' );
	const menuToggle = page.locator( '#site-header--site-title .menu-toggle' );

	if ( await menuToggle.isVisible() ) {
		await mainNav
			.getByRole( 'button', { name: `Toggle the ${ parentLabel } menu` } )
			.click();
		return;
	}

	await mainNav.getByRole( 'link', { name: parentLabel } ).hover();
}
