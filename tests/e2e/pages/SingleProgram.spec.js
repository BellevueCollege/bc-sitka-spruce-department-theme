import { test, expect } from '../fixtures/test.js';
import {
	expectFullPageScreenshot,
	runAxeOnSelector,
	visitIntegrationPage,
} from '../helpers/page-integration.js';
import { skipDuplicateBlockViewport } from '../helpers/viewports.js';
import { seedIntegrationData, seedSiteChromeData } from '../helpers/wp-cli.js';

let programUrl;

test.describe( 'Single program integration', () => {
	test.beforeAll( () => {
		seedSiteChromeData();
		const seed = seedIntegrationData();
		programUrl = seed.programUrl;
	} );

	test.beforeEach( async ( { page } ) => {
		await visitIntegrationPage( page, programUrl );
	} );

	test( 'renders program template without fatal errors', async ( { page } ) => {
		await expect( page.locator( 'body' ) ).not.toContainText( 'fatal error' );
		await expect( page.locator( 'main, .site-content, #content' ).first() ).toBeVisible();
	} );

	test( 'shows enriched program body sections from seed', async ( { page } ) => {
		await expect( page.getByText( 'E2E core program overview.' ) ).toBeVisible();
		await expect( page.getByRole( 'heading', { name: 'Learning Areas' } ) ).toBeVisible();
		await expect( page.getByText( 'E2E learning list item one.' ) ).toBeVisible();
		await expect( page.getByRole( 'heading', { name: 'Program Highlights' } ) ).toBeVisible();
		await expect( page.getByRole( 'heading', { name: 'Highlight 1' } ) ).toBeVisible();
		await expect(
			page.getByRole( 'region', { name: 'Stats Relevant to this Program' } )
		).toContainText( 'E2E Stat 1' );
		await expect( page.getByRole( 'heading', { name: 'Featured Experience' } ) ).toBeVisible();
		await expect( page.locator( '.testimonial-section img' ) ).toBeVisible();
	} );

	test( 'shows related programs region with slider navigation when multiple related programs exist', async ( {
		page,
	} ) => {
		const main = page.locator( 'main, .site-content, #content' ).first();
		const relatedProgramsSection = main.locator( '.related-programs-wrapper' );
		await expect(
			main.getByRole( 'heading', { name: 'Programs in this Department' } )
		).toBeVisible();
		await expect( relatedProgramsSection.locator( '.slider-navigation' ) ).toBeVisible();
		await expect( relatedProgramsSection.locator( '.swiper-slide' ) ).toHaveCount( 4 );
		const relatedProgramLinks = relatedProgramsSection.locator(
			'.related-program-card .card-title a'
		);
		await expect( relatedProgramLinks ).toHaveCount( 4 );
		await expect( relatedProgramLinks.filter( { hasText: 'E2E Beta' } ) ).toBeVisible();
		// Swiper marks off-screen slides aria-hidden; assert they are in the DOM, not in the a11y viewport.
		await expect( relatedProgramLinks.filter( { hasText: 'E2E Gamma' } ) ).toBeAttached();
		await expect( relatedProgramLinks.filter( { hasText: 'E2E Delta' } ) ).toBeAttached();
		await expect( relatedProgramLinks.filter( { hasText: 'E2E Epsilon' } ) ).toBeAttached();
		await expect( main.getByText( 'E2E Degree' ).first() ).toBeVisible();
		await expect( main.getByText( '2 years' ).first() ).toBeVisible();
		await expect( main.getByRole( 'link', { name: /Ada Lovelace/i } ).first() ).toBeVisible();
		await expect( main.getByText( 'No employees found!' ) ).toHaveCount( 0 );
	} );

	test( 'full page snapshot @visual', async ( { page } ) => {
		await expectFullPageScreenshot( page, 'single-program-full.png' );
	} );

	test( 'frontend aria snapshot @aria', async ( { page }, testInfo ) => {
		skipDuplicateBlockViewport( testInfo );
		await expect( page.locator( 'body' ) ).toMatchAriaSnapshot( {
			name: 'single-program-frontend.yml',
		} );
	} );

	test( 'main content passes axe', async ( { page } ) => {
		const results = await runAxeOnSelector( page, '.flexible-page, main' );
		expect( results.violations ).toEqual( [] );
	} );
} );
