import { test, expect } from '../fixtures/test.js';
import {
	FULL_PAGE_SCREENSHOT_OPTIONS,
	runAxeOnSelector,
	visitIntegrationPage,
} from '../helpers/page-integration.js';
import { skipDuplicateBlockViewport } from '../helpers/viewports.js';
import { seedIntegrationData, seedSiteChromeData } from '../helpers/wp-cli.js';

let listingUrl;
let profileUrl;

test.describe( 'Profile listing integration', () => {
	test.beforeAll( () => {
		seedSiteChromeData();
		const seed = seedIntegrationData();
		listingUrl = seed.profileListingUrl;
		profileUrl = seed.profileUrl;
	} );

	test.beforeEach( async ( { page } ) => {
		await visitIntegrationPage( page, listingUrl );
	} );

	test( 'renders the OHO Views listing and links to a profile', async ( {
		page,
	} ) => {
		await expect( page.locator( '.profile-listing-page' ) ).toBeVisible();
		await expect( page.getByText( 'Our Faculty and Staff' ) ).toBeVisible();
		const profileLink = page.getByRole( 'link', { name: /Ada Lovelace/i } );
		await expect( profileLink.first() ).toBeVisible();
		await profileLink.first().click();
		await expect( page ).toHaveURL(
			new RegExp( profileUrl.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' ) )
		);
		await expect( page.getByText( 'No employees found!' ) ).toHaveCount( 0 );
	} );

	test( 'frontend aria snapshot @aria', async ( { page }, testInfo ) => {
		skipDuplicateBlockViewport( testInfo );
		await expect( page.locator( 'body' ) ).toMatchAriaSnapshot( {
			name: 'profile-listing-frontend.yml',
		} );
	} );

	test( 'main content passes axe', async ( { page } ) => {
		const results = await runAxeOnSelector( page, '.profiles-section-wrapper, .profiles-section' );
		expect( results.violations ).toEqual( [] );
	} );

	test( 'full page snapshot @visual', async ( { page } ) => {
		await expect( page ).toHaveScreenshot(
			'profile-listing-full.png',
			FULL_PAGE_SCREENSHOT_OPTIONS
		);
	} );
} );
