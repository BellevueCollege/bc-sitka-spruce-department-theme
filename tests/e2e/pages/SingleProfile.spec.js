import { test, expect } from '../fixtures/test.js';
import {
	FULL_PAGE_SCREENSHOT_OPTIONS,
	runAxeOnSelector,
	visitIntegrationPage,
} from '../helpers/page-integration.js';
import { skipDuplicateBlockViewport } from '../helpers/viewports.js';
import { seedIntegrationData, seedSiteChromeData } from '../helpers/wp-cli.js';

let pageUrl;

test.describe( 'Single profile integration', () => {
	test.beforeAll( () => {
		seedSiteChromeData();
		const seed = seedIntegrationData();
		pageUrl = seed.profileUrl;
	} );

	test.beforeEach( async ( { page } ) => {
		await visitIntegrationPage( page, pageUrl );
	} );

	test( 'renders bio and listing sections', async ( { page } ) => {
		await expect( page.getByRole( 'heading', { name: 'About Me' } ) ).toBeVisible();
		await expect( page.getByText( 'Optional Callout' ) ).toBeVisible();
		await expect( page.getByRole( 'heading', { name: 'Support Services' } ) ).toBeVisible();
		await expect( page.getByRole( 'heading', { name: 'In the News' } ) ).toBeVisible();
	} );

	test( 'frontend aria snapshot @aria', async ( { page }, testInfo ) => {
		skipDuplicateBlockViewport( testInfo );
		await expect( page.locator( 'body' ) ).toMatchAriaSnapshot( {
			name: 'single-profile-frontend.yml',
		} );
	} );

	test( 'main content passes axe', async ( { page } ) => {
		const results = await runAxeOnSelector( page, '.bio-section-wrapper, .bio-section' );
		expect( results.violations ).toEqual( [] );
	} );

	test( 'full page snapshot @visual', async ( { page } ) => {
		await expect( page ).toHaveScreenshot(
			'single-profile-full.png',
			FULL_PAGE_SCREENSHOT_OPTIONS
		);
	} );
} );
