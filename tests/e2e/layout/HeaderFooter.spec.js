/**
 * Header and footer layout tests.
 *
 * Depends on seed-site-chrome.php to configure WordPress menus (main-menu,
 * cta-menu) and ACF Site Options before tests run. Visual snapshots are stored
 * per Playwright project under __snapshots__/ (container-desktop, container-tablet,
 * container-mobile when run via test:e2e:visual).
 */
import { test, expect } from '../fixtures/test.js';
import AxeBuilder from '@axe-core/playwright';
import {
	expandMainNavSubmenu,
	openHeaderMenuIfCollapsed,
} from '../helpers/header.js';
import { settleLocatorForScreenshot } from '../helpers/editor.js';
import { normalizeE2eUrlForPlaywright } from '../helpers/e2e-navigation.js';
import { seedChromeVariant, seedSiteChromeData } from '../helpers/wp-cli.js';

/** WCAG 2.x tags passed to axe-core scoped audits. */
const WCAG_TAGS = [ 'wcag2a', 'wcag2aa', 'wcag22a', 'wcag22aa', 'best-practice' ];

/** Allow minor cross-environment rendering variance in visual snapshots. */
const SCREENSHOT_OPTIONS = { maxDiffPixelRatio: 0.02 };

let seed;

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} url
 */
async function visitDefaultChromePage( page, url ) {
	await page.goto( normalizeE2eUrlForPlaywright( url ) );
	await page.locator( '#header-wrapper' ).waitFor( { state: 'visible' } );
	await page.locator( 'footer.footer' ).waitFor( { state: 'visible' } );
}

test.describe( 'Header and Footer', () => {
	test.beforeAll( () => {
		seed = seedSiteChromeData();
		seedChromeVariant( 'default' );
	} );

	test.afterAll( () => {
		seedChromeVariant( 'default' );
	} );

	test.describe( 'Header', () => {
		test.beforeEach( async ( { page } ) => {
			await visitDefaultChromePage( page, seed.pageUrl );
		} );

		test( 'renders top-level main navigation links @viewport', async ( { page } ) => {
			await openHeaderMenuIfCollapsed( page );
			const mainNav = page.locator( '#site-header--main-nav' );

			for ( const label of seed.mainMenuTopLevelLabels ) {
				await expect(
					mainNav.getByRole( 'link', { name: label } )
				).toBeVisible();
			}
		} );

		// Child items live in a collapsed submenu; hover reveals them on desktop.
		test( 'renders child link when submenu is expanded @viewport', async ( { page } ) => {
			await openHeaderMenuIfCollapsed( page );
			await expandMainNavSubmenu( page, 'Programs' );

			const mainNav = page.locator( '#site-header--main-nav' );
			await expect(
				mainNav.getByRole( 'link', { name: seed.mainMenuChildLabel } )
			).toBeVisible();
		} );

		test( 'renders CTA menu buttons @viewport', async ( { page } ) => {
			await openHeaderMenuIfCollapsed( page );
			const ctaNav = page.locator( '#site-header--cta' );

			for ( const label of seed.ctaMenuLabels ) {
				await expect(
					ctaNav.getByRole( 'link', { name: label } )
				).toBeVisible();
			}
		} );

		test( 'renders site title', async ( { page } ) => {
			await expect(
				page.locator( '#site-header--site-title' ).getByRole( 'link', {
					name: seed.siteTitle,
				} )
			).toBeVisible();
		} );

		test( 'header snapshot — default state @visual', async ( { page } ) => {
			const header = page.locator( '#header-wrapper' );
			await expect( header ).toBeVisible();
			await expect( header ).toHaveScreenshot(
				'header-default.png',
				SCREENSHOT_OPTIONS
			);
		} );
	} );

	test.describe( 'Footer', () => {
		test.beforeEach( async ( { page } ) => {
			await visitDefaultChromePage( page, seed.pageUrl );
		} );

		test( 'renders site title, address, and phone contact', async ( { page } ) => {
			const footer = page.locator( 'footer.footer' );
			// Scope address assertions to the contact column to avoid copyright matches.
			const contactColumn = footer.locator( '.col-md-6.col-lg-3' ).first();

			await expect(
				footer.getByRole( 'heading', { level: 2, name: seed.siteTitle } )
			).toBeVisible();
			await expect( contactColumn.getByText( seed.addressLine ) ).toBeVisible();
			await expect(
				contactColumn.getByText( 'Bellevue, WA 98007-6406' )
			).toBeVisible();
			await expect(
				footer.getByRole( 'link', { name: seed.phoneDisplay } )
			).toHaveAttribute( 'href', 'tel:+14255641000' );
		} );

		test( 'renders top-level main navigation links', async ( { page } ) => {
			const footerMainNav = page.locator( '.footer-menu-main' );

			for ( const label of seed.mainMenuTopLevelLabels ) {
				await expect(
					footerMainNav.getByRole( 'link', { name: label } )
				).toBeVisible();
			}
		} );

		test( 'renders social media links', async ( { page } ) => {
			const socialLinks = page.locator( 'footer.footer .social-links a' );
			await expect( socialLinks ).toHaveCount( 3 );
		} );

		test( 'footer snapshot — default state @visual', async ( { page } ) => {
			const footer = page.locator( 'footer.footer' );
			await expect( footer ).toBeVisible();
			await settleLocatorForScreenshot( footer );
			await expect( footer ).toHaveScreenshot(
				'footer-default.png',
				SCREENSHOT_OPTIONS
			);
		} );
	} );

	test.describe( 'ARIA snapshots', () => {
		test.beforeEach( async ( { page } ) => {
			await visitDefaultChromePage( page, seed.pageUrl );
		} );

		test( 'header — default state @aria', async ( { page } ) => {
			const header = page.locator( '#header-wrapper' );
			await expect( header ).toBeVisible();
			await expect( header ).toMatchAriaSnapshot( {
				name: 'header-default.yml',
			} );
		} );

		test( 'footer — default state @aria', async ( { page } ) => {
			const footer = page.locator( 'footer.footer' );
			await expect( footer ).toBeVisible();
			await expect( footer ).toMatchAriaSnapshot( {
				name: 'footer-default.yml',
			} );
		} );
	} );

	test.describe( 'Chrome option variants', () => {
		test( 'renders sitewide notice when enabled', async ( { page } ) => {
			const chrome = seedChromeVariant( 'notice' );
			await page.goto( normalizeE2eUrlForPlaywright( chrome.pageUrl ) );
			await expect( page.getByText( 'E2E sitewide notice message.' ) ).toBeVisible();
		} );

		test( 'header snapshot — expanded main menu @visual', async ( { page } ) => {
			seedChromeVariant( 'default' );
			await page.goto( normalizeE2eUrlForPlaywright( seed.pageUrl ) );
			await openHeaderMenuIfCollapsed( page );
			await expandMainNavSubmenu( page, 'Programs' );
			const header = page.locator( '#header-wrapper' );
			await expect( header ).toHaveScreenshot(
				'header-menu-expanded.png',
				SCREENSHOT_OPTIONS
			);
		} );

		test( 'footer snapshot — email contact @visual', async ( { page } ) => {
			const chrome = seedChromeVariant( 'emailFooter' );
			await page.goto( normalizeE2eUrlForPlaywright( chrome.pageUrl ) );
			const footer = page.locator( 'footer.footer' );
			await expect(
				footer.getByRole( 'link', { name: 'e2e-footer@example.com' } )
			).toBeVisible();
			await settleLocatorForScreenshot( footer );
			await expect( footer ).toHaveScreenshot(
				'footer-email-only.png',
				SCREENSHOT_OPTIONS
			);
		} );

		test( 'sock shows location and CTA when configured', async ( { page } ) => {
			const chrome = seedChromeVariant( 'sock' );
			await page.goto( normalizeE2eUrlForPlaywright( chrome.pageUrl ) );
			await expect( page.getByText( 'E2E Sock CTA' ) ).toBeVisible();
			await expect( page.getByText( '123 Test Street' ) ).toBeVisible();
		} );

		test( 'sock snapshot when configured @visual', async ( { page } ) => {
			const chrome = seedChromeVariant( 'sock' );
			await page.goto( normalizeE2eUrlForPlaywright( chrome.pageUrl ) );
			const sock = page.locator( 'aside.sock' );
			await expect( sock ).toBeVisible();
			await expect( sock ).toHaveScreenshot(
				'sock-standard.png',
				SCREENSHOT_OPTIONS
			);
		} );
	} );

	test.describe( 'Accessibility', () => {
		test.beforeEach( async ( { page } ) => {
			await visitDefaultChromePage( page, seed.pageUrl );
		} );

		test( 'passes axe audit — header', async ( { page } ) => {
			const header = page.locator( '#header-wrapper' );
			await expect( header ).toBeVisible();

			const results = await new AxeBuilder( { page } )
				.include( '#header-wrapper' )
				.withTags( WCAG_TAGS )
				.analyze();

			expect( results.violations ).toEqual( [] );
		} );

		test( 'passes axe audit — footer', async ( { page } ) => {
			const footer = page.locator( 'footer.footer' );
			await expect( footer ).toBeVisible();

			const results = await new AxeBuilder( { page } )
				.include( 'footer.footer' )
				.withTags( WCAG_TAGS )
				.analyze();

			expect( results.violations ).toEqual( [] );
		} );
	} );
} );
