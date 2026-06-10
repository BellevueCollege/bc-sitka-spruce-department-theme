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
import { seedSiteChromeData } from '../helpers/wp-cli.js';

/** WCAG 2.x tags passed to axe-core scoped audits. */
const WCAG_TAGS = [ 'wcag2a', 'wcag2aa', 'wcag22a', 'wcag22aa', 'best-practice' ];

/** Allow minor cross-environment rendering variance in visual snapshots. */
const SCREENSHOT_OPTIONS = { maxDiffPixelRatio: 0.02 };

let seed;

test.describe( 'Header and Footer', () => {
	test.beforeAll( () => {
		seed = seedSiteChromeData();
	} );

	test.beforeEach( async ( { page } ) => {
		await page.goto( seed.pageUrl );
		await page.locator( '#header-wrapper' ).waitFor( { state: 'visible' } );
		await page.locator( 'footer.footer' ).waitFor( { state: 'visible' } );
	} );

	test.describe( 'Header', () => {
		test( 'renders top-level main navigation links', async ( { page } ) => {
			await openHeaderMenuIfCollapsed( page );
			const mainNav = page.locator( '#site-header--main-nav' );

			for ( const label of seed.mainMenuTopLevelLabels ) {
				await expect(
					mainNav.getByRole( 'link', { name: label } )
				).toBeVisible();
			}
		} );

		// Child items live in a collapsed submenu; hover reveals them on desktop.
		test( 'renders child link when submenu is expanded', async ( { page } ) => {
			await openHeaderMenuIfCollapsed( page );
			await expandMainNavSubmenu( page, 'Programs' );

			const mainNav = page.locator( '#site-header--main-nav' );
			await expect(
				mainNav.getByRole( 'link', { name: seed.mainMenuChildLabel } )
			).toBeVisible();
		} );

		test( 'renders CTA menu buttons', async ( { page } ) => {
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
			await expect( footer ).toHaveScreenshot(
				'footer-default.png',
				SCREENSHOT_OPTIONS
			);
		} );
	} );

	test.describe( 'ARIA snapshots', () => {
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

	test.describe( 'Accessibility', () => {
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
