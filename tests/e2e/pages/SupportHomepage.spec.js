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

test.describe( 'Support homepage integration', () => {
	test.beforeAll( () => {
		seedSiteChromeData();
		seedIntegrationData();
		pageUrl = applyHomepageVariant( 'suppt' ).pageUrl;
	} );

	test.beforeEach( async ( { page } ) => {
		await visitIntegrationPage( page, pageUrl );
	} );

	test( 'renders support sections in order', async ( { page } ) => {
		const main = page.locator( 'main, .site-content, #content' ).first();
		await expect( main.getByRole( 'heading', { name: /Student Support Homepage/i } ) ).toBeVisible();
		await expect( main.getByRole( 'heading', { name: 'Our Services' } ) ).toBeVisible();
		await expect( main.getByText( 'Featured Experience' ) ).toBeVisible();
		await expect( main.getByText( 'Checkerboards Headline' ) ).toBeVisible();
		await expect( main.getByRole( 'heading', { name: 'Resources/FAQs' } ) ).toBeVisible();
		await expect( main.getByRole( 'heading', { name: 'Support Section' } ) ).toBeVisible();
		await expect( main.getByRole( 'heading', { name: 'Specialized Resources and Support' } ) ).toBeVisible();
		await expect( main.getByRole( 'heading', { name: 'News Section' } ) ).toBeVisible();
		await expect( main.getByRole( 'heading', { name: /Why \[X\] at Bellevue College/i } ) ).toBeVisible();
	} );

	test( 'renders seeded dynamic block content', async ( { page }, testInfo ) => {
		const main = page.locator( 'main, .site-content, #content' ).first();
		await expect( main.getByRole( 'link', { name: /Ada Lovelace/i } ).first() ).toBeVisible();
		await expect( main.getByText( 'No employees found!' ) ).toHaveCount( 0 );

		if ( testInfo.project.name === 'desktop' ) {
			await expect( main.getByRole( 'heading', { name: 'E2E Support Tab' } ) ).toBeVisible();
			await expect( main.getByText( 'E2E support tab summary content.' ) ).toBeVisible();
		}
	} );

	test( 'opens an accordion panel', async ( { page } ) => {
		const accordionButton = page.locator( '.accordion-button' ).first();
		await accordionButton.click();
		await expect( accordionButton ).toHaveAttribute( 'aria-expanded', 'true' );
	} );

	test( 'frontend aria snapshot @aria', async ( { page }, testInfo ) => {
		skipDuplicateBlockViewport( testInfo );
		await expect( page.locator( 'body' ) ).toMatchAriaSnapshot( {
			name: 'support-homepage-frontend.yml',
		} );
	} );

	test( 'main content passes axe', async ( { page } ) => {
		const results = await runAxeOnSelector( page, '.testimonial-section-wrapper, .testimonial-section' );
		expect( results.violations ).toEqual( [] );
	} );

	test( 'full page snapshot @visual', async ( { page } ) => {
		await expect( page ).toHaveScreenshot(
			'support-homepage-full.png',
			FULL_PAGE_SCREENSHOT_OPTIONS
		);
	} );
} );
