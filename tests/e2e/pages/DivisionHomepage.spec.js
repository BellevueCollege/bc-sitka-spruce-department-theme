import { test, expect } from '../fixtures/test.js';
import {
	expectFullPageScreenshot,
	runAxeOnSelector,
	visitIntegrationPage,
} from '../helpers/page-integration.js';
import { skipDuplicateBlockViewport } from '../helpers/viewports.js';
import {
	applyHomepageVariant,
	applyLocationAndHours,
	seedIntegrationData,
	seedSiteChromeData,
} from '../helpers/wp-cli.js';

let pageUrl;
let noHeroUrl;

test.describe( 'Division homepage integration', () => {
	test.beforeAll( () => {
		seedSiteChromeData();
		const integration = seedIntegrationData();
		applyLocationAndHours( false );
		pageUrl = applyHomepageVariant( 'div' ).pageUrl;
		noHeroUrl = integration.homepages.div.withoutHero;
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
		await expect( main.getByRole( 'heading', { name: 'Stats about BC' } ) ).toBeVisible();
		await expect( main.getByRole( 'heading', { name: 'News Section Title' } ) ).toBeVisible();
		await expect( main.getByText( 'Division Staff' ) ).toBeVisible();
	} );

	test( 'shows hero and hides location sidebar when location is off', async ( { page } ) => {
		const main = page.locator( 'main, .site-content, #content' ).first();
		await expect( main.locator( '.hero img' ).first() ).toBeVisible();
		await expect( page.locator( '.location-and-hours' ) ).toHaveCount( 0 );
	} );

	test( 'no-hero sibling page omits hero image', async ( { page } ) => {
		await visitIntegrationPage( page, noHeroUrl );
		await expect( page.locator( 'main .hero img' ) ).toHaveCount( 0 );
	} );

	test( 'card section renders populated cards', async ( { page } ) => {
		await expect( page.locator( '.card-section .cards' ) ).toBeVisible();
		await expect( page.getByRole( 'heading', { name: 'E2E Division Card One' } ) ).toBeVisible();
		await expect( page.getByRole( 'heading', { name: 'E2E Division Card Two' } ) ).toBeVisible();
	} );

	test( 'renders seeded dynamic block content', async ( { page }, testInfo ) => {
		const main = page.locator( 'main, .site-content, #content' ).first();
		await expect( main.getByRole( 'region', { name: 'Stats about BC' } ) ).toContainText(
			'E2E Stat 1'
		);
		await expect( main.getByRole( 'heading', { name: 'E2E Listing Item One' } ) ).toBeVisible();
		await expect( main.getByRole( 'heading', { name: 'E2E Checkerboard One' } ) ).toBeVisible();
		await expect( main.getByRole( 'link', { name: /Ada Lovelace/i } ).first() ).toBeVisible();
		await expect( main.getByRole( 'heading', { name: 'Full-Time Faculty' } ) ).toBeVisible();
		await expect( main.getByText( 'No employees found!' ) ).toHaveCount( 0 );

		if ( testInfo.project.name === 'desktop' ) {
			await expect( main.getByRole( 'link', { name: 'E2E Core News Story Two' } ) ).toBeVisible();
		}
	} );

	test( 'frontend aria snapshot @aria', async ( { page }, testInfo ) => {
		skipDuplicateBlockViewport( testInfo );
		await expect( page.locator( 'body' ) ).toMatchAriaSnapshot( {
			name: 'division-homepage-frontend.yml',
		} );
	} );

	test( 'main content passes axe', async ( { page } ) => {
		const results = await runAxeOnSelector( page, '.card-section-wrapper, .card-section' );
		expect( results.violations ).toEqual( [] );
	} );

	test( 'full page snapshot @visual', async ( { page } ) => {
		await expectFullPageScreenshot( page, 'division-homepage-full.png' );
	} );
} );
