import { test, expect } from '../fixtures/test.js';
import {
	FULL_PAGE_SCREENSHOT_OPTIONS,
	runAxeOnSelector,
	visitIntegrationPage,
} from '../helpers/page-integration.js';
import { skipDuplicateBlockViewport } from '../helpers/viewports.js';
import { seedIntegrationData, seedSiteChromeData } from '../helpers/wp-cli.js';

let pageUrl;

test.describe( 'Application guide integration', () => {
	test.beforeAll( () => {
		seedSiteChromeData();
		const seed = seedIntegrationData();
		pageUrl = seed.applicationGuideUrl;
	} );

	test.beforeEach( async ( { page } ) => {
		await visitIntegrationPage( page, pageUrl );
	} );

	test( 'uses the no-sidebar template', async ( { page } ) => {
		await expect( page.locator( '.nav-sidebar' ) ).toHaveCount( 0 );
		await expect( page.getByRole( 'heading', { name: 'Setup Instructions:' } ) ).toHaveCount( 0 );
		await expect( page.getByRole( 'heading', { name: 'Application Steps' } ) ).toBeVisible();
		await expect( page.getByRole( 'heading', { name: 'Additional Resources' } ) ).toBeVisible();
		await expect( page.getByRole( 'heading', { name: 'More Info' } ) ).toBeVisible();
		await expect( page.getByRole( 'heading', { name: 'Support Available' } ) ).toBeVisible();
		await expect( page.getByRole( 'heading', { name: 'Department Feature' } ) ).toBeVisible();
	} );

	test( 'shows application steps as tabs on desktop', async ( { page }, testInfo ) => {
		if ( testInfo.project.name !== 'desktop' ) {
			testInfo.skip( true, 'Tab list is hidden below the theme md breakpoint (769px).' );
		}

		await expect( page.getByRole( 'tab', { name: 'Student Type 1' } ) ).toBeVisible();
	} );

	test( 'shows the first application step @viewport', async ( { page }, testInfo ) => {
		// Theme md is 769px, so the 768px tablet project renders the accordion, not tabs.
		if ( testInfo.project.name !== 'desktop' ) {
			await page.getByRole( 'button', { name: 'Student Type 1' } ).click();
		}

		await expect( page.getByText( 'Step 1: Step Title' ) ).toBeVisible();
	} );

	test( 'frontend aria snapshot @aria', async ( { page }, testInfo ) => {
		skipDuplicateBlockViewport( testInfo );
		await expect( page.locator( 'body' ) ).toMatchAriaSnapshot( {
			name: 'application-guide-frontend.yml',
		} );
	} );

	test( 'main content passes axe', async ( { page } ) => {
		const results = await runAxeOnSelector( page, '.body-section-wrapper' );
		expect( results.violations ).toEqual( [] );
	} );

	test( 'full page snapshot @visual', async ( { page } ) => {
		await expect( page ).toHaveScreenshot(
			'application-guide-full.png',
			FULL_PAGE_SCREENSHOT_OPTIONS
		);
	} );
} );
