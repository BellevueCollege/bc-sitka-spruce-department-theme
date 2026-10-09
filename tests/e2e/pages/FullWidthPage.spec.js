import { test, expect } from '../fixtures/test.js';
import {
	FULL_PAGE_SCREENSHOT_OPTIONS,
	runAxeOnSelector,
	visitIntegrationPage,
} from '../helpers/page-integration.js';
import { skipDuplicateBlockViewport } from '../helpers/viewports.js';
import { seedIntegrationData, seedSiteChromeData } from '../helpers/wp-cli.js';

let pageUrl;
let introMatrix;

test.describe( 'Full width page integration', () => {
	test.beforeAll( () => {
		seedSiteChromeData();
		const seed = seedIntegrationData();
		pageUrl = seed.fullWidthPageUrl;
		introMatrix = seed.fullWidthIntroMatrix;
	} );

	test.beforeEach( async ( { page } ) => {
		await visitIntegrationPage( page, pageUrl );
	} );

	test( 'uses the no-sidebar template without nav sidebar', async ( { page } ) => {
		await expect( page.locator( '.nav-sidebar' ) ).toHaveCount( 0 );
		await expect( page.getByRole( 'heading', { name: 'E2E Full Width Heading' } ) ).toBeVisible();
		await expect( page.getByText( 'E2E full width body copy without navigation sidebar.' ) ).toBeVisible();
	} );

	test( 'shows intro text and header image', async ( { page } ) => {
		await expect( page.getByText( 'E2E full width page intro summary.' ) ).toBeVisible();
		await expect( page.locator( '.flexible-page-header-image img' ) ).toBeVisible();
	} );

	test( 'main content passes axe', async ( { page } ) => {
		const results = await runAxeOnSelector( page, '.flexible-page' );
		expect( results.violations ).toEqual( [] );
	} );

	test( 'frontend aria snapshot @aria', async ( { page }, testInfo ) => {
		skipDuplicateBlockViewport( testInfo );
		await expect( page.locator( 'body' ) ).toMatchAriaSnapshot( {
			name: 'full-width-page-frontend.yml',
		} );
	} );

	test( 'full page snapshot @visual', async ( { page } ) => {
		await expect( page ).toHaveScreenshot(
			'full-width-page-full.png',
			FULL_PAGE_SCREENSHOT_OPTIONS
		);
	} );
} );

test.describe( 'Full width page intro matrix', () => {
	test.beforeAll( () => {
		seedSiteChromeData();
		const seed = seedIntegrationData();
		introMatrix = seed.fullWidthIntroMatrix;
	} );

	test( 'intro-only matrix page shows intro copy', async ( { page } ) => {
		await visitIntegrationPage( page, introMatrix.introOnlyUrl );
		await expect( page.getByText( 'E2E intro matrix intro only.' ) ).toBeVisible();
	} );
} );
