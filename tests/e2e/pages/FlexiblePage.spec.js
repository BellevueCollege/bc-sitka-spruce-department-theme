import { test, expect } from '../fixtures/test.js';
import {
	FULL_PAGE_SCREENSHOT_OPTIONS,
	runAxeOnSelector,
	visitIntegrationPage,
} from '../helpers/page-integration.js';
import { skipDuplicateBlockViewport } from '../helpers/viewports.js';
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
		skipDuplicateBlockViewport( testInfo );
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

	test( 'tabs section snapshot @visual', async ( { page }, testInfo ) => {
		skipDuplicateBlockViewport( testInfo );

		if ( testInfo.project.name !== 'desktop' ) {
			await page.getByRole( 'button', { name: 'E2E Tab One' } ).click();
		}

		const tabsSection = page.locator( '.tabs-section-component' );
		await expect( tabsSection ).toBeVisible();
		await expect( tabsSection ).toHaveScreenshot( 'flexible-page-tabs-section.png', {
			maxDiffPixelRatio: 0.02,
		} );
	} );

	test( 'narrow content snapshot @visual', async ( { page }, testInfo ) => {
		skipDuplicateBlockViewport( testInfo );
		const narrowContent = page.locator( '.narrow-content' );
		await expect( narrowContent ).toBeVisible();
		await expect( narrowContent ).toHaveScreenshot(
			'flexible-page-narrow-content.png',
			{ maxDiffPixelRatio: 0.02 }
		);
	} );

	test( 'mayflower row snapshot @visual', async ( { page }, testInfo ) => {
		skipDuplicateBlockViewport( testInfo );
		const row = page.locator( '.wp-block-mayflower-blocks-row' ).first();
		await expect( row ).toBeVisible();
		await expect( row ).toHaveScreenshot( 'flexible-page-mayflower-row.png', {
			maxDiffPixelRatio: 0.02,
		} );
	} );

	test( 'mayflower panel snapshot @visual', async ( { page }, testInfo ) => {
		skipDuplicateBlockViewport( testInfo );
		const panel = page.locator( '.wp-block-mayflower-blocks-panel' ).first();
		await expect( panel ).toBeVisible();
		await expect( panel ).toHaveScreenshot( 'flexible-page-mayflower-panel.png', {
			maxDiffPixelRatio: 0.02,
		} );
	} );
} );
