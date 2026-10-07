import { test, expect } from '../fixtures/test.js';
import {
	FULL_PAGE_SCREENSHOT_OPTIONS,
	runAxeOnSelector,
	visitIntegrationPage,
} from '../helpers/page-integration.js';
import { skipDuplicateBlockViewport } from '../helpers/viewports.js';
import {
	applyHomepageVariant,
	seedIntegrationData,
	seedSiteChromeData,
} from '../helpers/wp-cli.js';

let pageUrl;

test.describe( 'Department homepage integration', () => {
	test.beforeAll( () => {
		seedSiteChromeData();
		seedIntegrationData();
		pageUrl = applyHomepageVariant( 'dept' ).pageUrl;
	} );

	test.beforeEach( async ( { page } ) => {
		await visitIntegrationPage( page, pageUrl );
	} );

	test( 'renders primary sections in pattern order', async ( { page } ) => {
		const main = page.locator( 'main, .site-content, #content' ).first();
		await expect( main.getByRole( 'heading', { name: /Department Homepage/i } ) ).toBeVisible();
		await expect( main.getByRole( 'heading', { name: /Why \[X\] at Bellevue College/i } ) ).toBeVisible();
		await expect( main.getByRole( 'heading', { name: 'Stats about BC' } ) ).toBeVisible();
		await expect( main.getByRole( 'heading', { name: 'Degrees and Certificates' } ) ).toBeVisible();
		await expect( main.getByRole( 'heading', { name: 'Support Section' } ) ).toBeVisible();
		await expect( main.getByRole( 'heading', { name: 'News Section' } ) ).toBeVisible();
		await expect( main.getByRole( 'heading', { name: 'Listing Section' } ) ).toBeVisible();
		await expect( main.getByRole( 'heading', { name: 'Accordion Section' } ) ).toBeVisible();
		await expect( main.getByText( 'Media Gallery' ) ).toBeVisible();
		await expect( main.getByText( 'Profiles Section' ) ).toBeVisible();
		await expect( main.getByText( 'Checkerboards Headline' ) ).toBeVisible();
	} );

	test( 'opens an accordion panel', async ( { page } ) => {
		const accordionButton = page.locator( '.accordion-button' ).first();
		await accordionButton.click();
		await expect( accordionButton ).toHaveAttribute( 'aria-expanded', 'true' );
	} );

	test( 'frontend aria snapshot @aria', async ( { page }, testInfo ) => {
		skipDuplicateBlockViewport( testInfo );
		await expect( page.locator( 'body' ) ).toMatchAriaSnapshot( {
			name: 'department-homepage-frontend.yml',
		} );
	} );

	test( 'main content passes axe', async ( { page } ) => {
		const results = await runAxeOnSelector( page, '.listing-section-wrapper' );
		expect( results.violations ).toEqual( [] );
	} );

	test( 'full page snapshot @visual', async ( { page } ) => {
		await expect( page ).toHaveScreenshot(
			'department-homepage-full.png',
			FULL_PAGE_SCREENSHOT_OPTIONS
		);
	} );
} );
