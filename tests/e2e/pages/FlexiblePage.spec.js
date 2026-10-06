import { test, expect } from '../fixtures/test.js';
import {
	FULL_PAGE_SCREENSHOT_OPTIONS,
	runAxeOnSelector,
	skipAriaOnDuplicateViewport,
	visitIntegrationPage,
} from '../helpers/page-integration.js';
import {
	seedChromeVariant,
	seedIntegrationData,
	seedSiteChromeData,
} from '../helpers/wp-cli.js';

let pageUrl;

test.describe( 'Flexible page integration', () => {
	test.beforeAll( () => {
		seedSiteChromeData();
		const seed = seedIntegrationData();
		pageUrl = seed.flexiblePageUrl;
	} );

	test.beforeEach( async ( { page } ) => {
		seedChromeVariant( 'default' );
		await visitIntegrationPage( page, pageUrl );
	} );

	test( 'highlights the current page in the sidebar navigation', async ( {
		page,
	} ) => {
		const current = page.locator( '.current_page_item' );
		await expect( current ).toContainText( 'E2E Flexible Page' );
	} );

	test( 'renders narrow content, tabs, and WYSIWYG blocks', async ( {
		page,
	}, testInfo ) => {
		await expect( page.getByText( 'E2E Flexible lead paragraph.' ) ).toBeVisible();
		await expect( page.getByRole( 'heading', { name: 'E2E Tabs Section' } ) ).toBeVisible();

		// Below 769px the first panel stays collapsed until its accordion button is opened.
		if ( testInfo.project.name !== 'desktop' ) {
			await page.getByRole( 'button', { name: 'E2E Tab One' } ).click();
		}

		await expect( page.getByText( 'E2E tab panel one content.' ) ).toBeVisible();
		await expect( page.getByRole( 'heading', { name: 'E2E Flexible Heading' } ) ).toBeVisible();
		await expect( page.getByText( 'E2E shortcode output' ) ).toBeVisible();
		await expect( page.getByText( 'E2E Mayflower alert.' ) ).toBeVisible();
	} );

	test( 'switches tabcordion panels on desktop', async ( { page }, testInfo ) => {
		if ( testInfo.project.name !== 'desktop' ) {
			testInfo.skip( true, 'Tab list is hidden below the theme md breakpoint (769px).' );
		}

		await page.getByRole( 'tab', { name: 'E2E Tab Two' } ).click();
		await expect( page.getByText( 'E2E tab panel two content.' ) ).toBeVisible();
	} );

	test( 'opens tabcordion section below the tab breakpoint', async ( { page }, testInfo ) => {
		if ( testInfo.project.name === 'desktop' ) {
			testInfo.skip( true, 'Accordion behavior is validated on tablet and mobile.' );
		}

		await page.getByRole( 'button', { name: 'E2E Tab Two' } ).click();
		await expect( page.getByText( 'E2E tab panel two content.' ) ).toBeVisible();
	} );

	test( 'frontend aria snapshot @aria', async ( { page }, testInfo ) => {
		skipAriaOnDuplicateViewport( testInfo );
		await expect( page.locator( '.narrow-content' ) ).toMatchAriaSnapshot( {
			name: 'flexible-page-frontend.yml',
		} );
	} );

	test( 'main content passes axe', async ( { page } ) => {
		const results = await runAxeOnSelector( page, '.narrow-content' );
		expect( results.violations ).toEqual( [] );
	} );

	test( 'full page snapshot @visual', async ( { page } ) => {
		await expect( page ).toHaveScreenshot(
			'flexible-page-full.png',
			FULL_PAGE_SCREENSHOT_OPTIONS
		);
	} );
} );
