import { test, expect } from '../fixtures/test.js';
import {
	expectFullPageScreenshot,
	runAxeOnSelector,
	visitIntegrationPage,
} from '../helpers/page-integration.js';
import { skipDuplicateBlockViewport } from '../helpers/viewports.js';
import { seedIntegrationData, seedSiteChromeData } from '../helpers/wp-cli.js';

let pageUrl;

test.describe( 'Profiles block page integration', () => {
	test.beforeAll( () => {
		seedSiteChromeData();
		const seed = seedIntegrationData();
		pageUrl = seed.profilesBlockPageUrl;
	} );

	test.beforeEach( async ( { page } ) => {
		await visitIntegrationPage( page, pageUrl );
	} );

	test( 'renders profiles section without OHO listing chrome', async ( { page } ) => {
		await expect( page.locator( '.nav-sidebar' ) ).toHaveCount( 0 );
		await expect( page.getByText( 'Our Faculty and Staff' ) ).toBeVisible();
		await expect( page.getByRole( 'link', { name: /Ada Lovelace/i } ).first() ).toBeVisible();
		await expect( page.getByText( 'Search and Filter Directory' ) ).toHaveCount( 0 );
	} );

	test( 'frontend aria snapshot @aria', async ( { page }, testInfo ) => {
		skipDuplicateBlockViewport( testInfo );
		await expect( page.locator( 'body' ) ).toMatchAriaSnapshot( {
			name: 'profiles-block-page-frontend.yml',
		} );
	} );

	test( 'main content passes axe', async ( { page } ) => {
		const results = await runAxeOnSelector( page, '.profiles-section' );
		expect( results.violations ).toEqual( [] );
	} );

	test( 'full page snapshot @visual', async ( { page } ) => {
		await expectFullPageScreenshot( page, 'profiles-block-page-full.png' );
	} );
} );
