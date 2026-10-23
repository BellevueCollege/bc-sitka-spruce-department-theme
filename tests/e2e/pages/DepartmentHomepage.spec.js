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

test.describe( 'Department homepage integration', () => {
	test.beforeAll( () => {
		seedSiteChromeData();
		const integration = seedIntegrationData();
		applyLocationAndHours( true );
		pageUrl = applyHomepageVariant( 'dept' ).pageUrl;
		noHeroUrl = integration.homepages.dept.withoutHero;
	} );

	test.beforeEach( async ( { page } ) => {
		await visitIntegrationPage( page, pageUrl );
	} );

	test( 'renders primary sections in pattern order', async ( { page } ) => {
		const main = page.locator( 'main, .site-content, #content' ).first();
		await expect( main.getByRole( 'heading', { name: /Department Homepage/i } ) ).toBeVisible();
		await expect( main.getByText( 'Announcement Banner' ) ).toBeVisible();
		await expect( main.getByRole( 'heading', { name: /Why \[X\] at Bellevue College/i } ) ).toBeVisible();
		await expect( main.getByRole( 'heading', { name: 'Stats about BC' } ) ).toBeVisible();
		await expect( main.getByRole( 'heading', { name: 'Degrees and Certificates' } ) ).toBeVisible();
		await expect( main.getByRole( 'heading', { name: 'Support Section' } ) ).toBeVisible();
		await expect( main.getByRole( 'heading', { name: 'News Section' } ) ).toBeVisible();
		await expect( main.getByRole( 'heading', { name: 'Listing Section' } ) ).toBeVisible();
		await expect( main.getByRole( 'heading', { name: 'Accordion Section' } ) ).toBeVisible();
		await expect( main.getByRole( 'heading', { name: 'Media Gallery' } ) ).toBeVisible();
		await expect( main.getByRole( 'heading', { name: 'Profiles Section' } ) ).toBeVisible();
		await expect( main.getByText( 'Checkerboards Headline' ) ).toBeVisible();
	} );

	test( 'shows hero image and location sidebar when enabled', async ( { page } ) => {
		const main = page.locator( 'main, .site-content, #content' ).first();
		await expect( main.locator( '.hero img' ).first() ).toBeVisible();
		await expect( page.locator( '.location-and-hours' ) ).toBeVisible();
		await expect( page.locator( '.location-and-hours' ).getByText( /E2E Location/ ) ).toBeVisible();
	} );

	test( 'no-hero sibling page omits hero image', async ( { page } ) => {
		await visitIntegrationPage( page, noHeroUrl );
		await expect( page.locator( 'main .hero img' ) ).toHaveCount( 0 );
	} );

	test( 'renders seeded dynamic block content', async ( { page }, testInfo ) => {
		const main = page.locator( 'main, .site-content, #content' ).first();
		await expect( main.getByRole( 'link', { name: 'E2E Alpha' } ).first() ).toBeVisible();
		await expect( main.getByRole( 'link', { name: 'E2E Beta' } ).first() ).toBeVisible();
		const stats = main.getByRole( 'region', { name: 'Stats about BC' } );
		await expect( stats ).toContainText( 'E2E Stat 1' );
		await expect( stats.locator( '.fa-graduation-cap' ) ).toBeVisible();
		await expect( stats.locator( '.diff--hero__photo img' ) ).toBeVisible();
		await expect( main.getByRole( 'heading', { name: 'E2E Listing Item One' } ) ).toBeVisible();
		await expect( main.getByText( 'E2E department accordion panel one.' ) ).toBeVisible();
		await expect( main.getByRole( 'heading', { name: 'E2E Checkerboard One' } ) ).toBeVisible();
		await expect( main.getByRole( 'link', { name: /Ada Lovelace/i } ).first() ).toBeVisible();
		await expect( main.getByRole( 'link', { name: /Grace Hopper/i } ).first() ).toBeVisible();
		await expect( main.getByText( 'No employees found!' ) ).toHaveCount( 0 );

		const gallery = main.locator( '.media-gallery-wrapper' );
		await expect( gallery.locator( '.swiper-slide' ) ).toHaveCount( 3 );
		await expect( gallery.locator( '.slider-navigation__next' ) ).toBeVisible();
		await expect( gallery.locator( 'a.image-overlay[data-fancybox]' ) ).toHaveCount( 1 );
		await expect( gallery.getByRole( 'heading', { name: 'E2E Gallery Video Slide' } ) ).toBeAttached();
		await expect( gallery.getByText( 'E2E gallery caption slide description.' ) ).toBeAttached();
		await gallery.locator( '.slider-navigation__next' ).click();
		await expect( gallery.getByRole( 'heading', { name: 'E2E Gallery Video Slide' } ) ).toBeVisible();

		if ( testInfo.project.name === 'desktop' ) {
			await expect( main.getByText( 'E2E featured news summary' ) ).toBeVisible();
			await expect( main.getByRole( 'link', { name: 'E2E Core News Story Two' } ) ).toBeVisible();
			await expect( main.getByRole( 'link', { name: 'E2E Core News Story Three' } ) ).toBeVisible();
			await expect( main.getByRole( 'link', { name: 'E2E Core News Story Four' } ) ).toBeVisible();
			await expect(
				main.getByRole( 'tab', { name: 'E2E Core Identity Support', exact: true } )
			).toBeVisible();
		}
	} );

	test( 'frontend aria snapshot @aria', async ( { page }, testInfo ) => {
		skipDuplicateBlockViewport( testInfo );
		await visitIntegrationPage( page, applyHomepageVariant( 'dept' ).pageUrl );
		await expect( page.locator( 'body' ) ).toMatchAriaSnapshot( {
			name: 'department-homepage-frontend.yml',
		} );
	} );

	test( 'main content passes axe', async ( { page } ) => {
		const results = await runAxeOnSelector( page, '.listing-section-wrapper' );
		expect( results.violations ).toEqual( [] );
	} );

	test( 'full page snapshot @visual', async ( { page } ) => {
		await expectFullPageScreenshot( page, 'department-homepage-full.png' );
	} );
} );
