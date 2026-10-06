import { test, expect } from '../fixtures/test.js';
import {
	FULL_PAGE_SCREENSHOT_OPTIONS,
	runAxeOnSelector,
	skipAriaOnDuplicateViewport,
	visitIntegrationPage,
} from '../helpers/page-integration.js';
import {
	applyHomepageVariant,
	seedIntegrationData,
	seedSiteChromeData,
} from '../helpers/wp-cli.js';

let pageUrl;

test.describe( 'Division homepage integration', () => {
	test.beforeAll( () => {
		seedSiteChromeData();
		seedIntegrationData();
		pageUrl = applyHomepageVariant( 'div' ).pageUrl;
	} );

	test.beforeEach( async ( { page } ) => {
		await visitIntegrationPage( page, pageUrl );
	} );

	test( 'renders division sections in order', async ( { page } ) => {
		const main = page.locator( 'main, .site-content, #content' ).first();
		await expect( main.getByRole( 'heading', { name: /Division Name/i } ) ).toBeVisible();
		await expect( main.getByText( 'Announcement Banner' ) ).toBeVisible();
		await expect( main.getByRole( 'heading', { name: 'Our Departments/Sub-units' } ) ).toBeVisible();
		await expect( main.getByRole( 'heading', { name: 'Our Services/Facilities' } ) ).toBeVisible();
		await expect( main.getByText( 'Division Staff' ) ).toBeVisible();
	} );

	test( 'card section renders cards', async ( { page } ) => {
		await expect( page.locator( '.card-section .cards' ) ).toBeVisible();
	} );

	test( 'frontend aria snapshot @aria', async ( { page }, testInfo ) => {
		skipAriaOnDuplicateViewport( testInfo );
		await expect( page.locator( 'body' ) ).toMatchAriaSnapshot( {
			name: 'division-homepage-frontend.yml',
		} );
	} );

	test( 'main content passes axe', async ( { page } ) => {
		const results = await runAxeOnSelector( page, '.card-section-wrapper, .card-section' );
		expect( results.violations ).toEqual( [] );
	} );

	test( 'full page snapshot @visual', async ( { page } ) => {
		await expect( page ).toHaveScreenshot(
			'division-homepage-full.png',
			FULL_PAGE_SCREENSHOT_OPTIONS
		);
	} );
} );
