import { expect } from '@playwright/test';

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
	await expect( page.locator( 'body' ) ).toHaveClass( /menu-expanded/ );
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
