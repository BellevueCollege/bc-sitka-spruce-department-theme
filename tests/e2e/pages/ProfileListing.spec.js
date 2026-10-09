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

	test( 'renders OHO listing results without empty-state message', async ( { page } ) => {
		const results = page.locator( '.profile-results, #oho-views-results-profile-listing' );
		await expect( results ).toBeVisible();
		await expect( page.getByText( 'No people matching your search.' ) ).toHaveCount( 0 );
		await expect( page.getByText( 'Our Faculty and Staff' ) ).toHaveCount( 0 );
	} );

	test( 'shows search filters and profile links in listing results', async ( { page } ) => {
		await expect( page.getByLabel( 'Search by Name' ) ).toBeVisible();
		await expect( page.getByRole( 'combobox', { name: 'Office or Department' } ) ).toBeVisible();
		await expect( page.getByText( 'Profile Type' ) ).toBeVisible();

		const profileLink = page
			.locator( '.profile-results, #oho-views-results-profile-listing' )
			.getByRole( 'link', { name: /Ada Lovelace/i } );
		await expect( profileLink.first() ).toBeVisible();
		await profileLink.first().click();
		await expect( page ).toHaveURL(
			new RegExp( profileUrl.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' ) )
		);
	} );

	test( 'frontend aria snapshot @aria', async ( { page }, testInfo ) => {
		skipDuplicateBlockViewport( testInfo );
		await expect( page.locator( 'body' ) ).toMatchAriaSnapshot( {
			name: 'profile-listing-frontend.yml',
		} );
	} );

	test( 'listing region passes axe', async ( { page } ) => {
		const results = await runAxeOnSelector(
			page,
			'.profile-listing-page .profile-results, #oho-views-results-profile-listing'
		);
		expect( results.violations ).toEqual( [] );
	} );

	test( 'full page snapshot @visual', async ( { page } ) => {
		await expect( page ).toHaveScreenshot(
			'profile-listing-full.png',
			FULL_PAGE_SCREENSHOT_OPTIONS
		);
	} );
} );
