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
		const programStats = page.getByRole( 'region', { name: 'Stats Relevant to this Program' } );
		await expect( programStats ).toContainText( 'E2E Stat 1' );
		await expect( programStats ).not.toContainText( 'E2E Stat 2' );
		await expect( programStats ).not.toContainText( 'E2E Stat 3' );
		await expect( page.getByRole( 'heading', { name: 'Featured Experience' } ) ).toBeVisible();
		await expect( page.locator( '.testimonial-section img' ) ).toBeVisible();
		await expect( page.getByRole( 'link', { name: 'E2E BC Pathway' } ) ).toBeVisible();
		await expect( page.getByRole( 'link', { name: 'E2E Focus Area' } ) ).toBeVisible();
	} );

	test( 'shows related programs region', async ( { page } ) => {
		const main = page.locator( 'main, .site-content, #content' ).first();
		await expect(
			main.getByRole( 'heading', { name: 'Programs in this Department' } )
		).toBeVisible();
		const betaProgramCard = main.locator( '.related-program-card' ).filter( {
			has: page.getByRole( 'link', { name: 'E2E Beta' } ),
		} );
		await expect( betaProgramCard ).toBeVisible();
		await expect( betaProgramCard ).toContainText( 'E2E BC Pathway' );
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
