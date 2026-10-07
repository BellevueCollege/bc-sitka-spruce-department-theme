import { test, expect } from '../fixtures/test.js';
import {
	FULL_PAGE_SCREENSHOT_OPTIONS,
	runAxeOnSelector,
	visitIntegrationPage,
} from '../helpers/page-integration.js';
import { skipDuplicateBlockViewport } from '../helpers/viewports.js';
import { seedIntegrationData, seedSiteChromeData } from '../helpers/wp-cli.js';

let governance;

test.describe( 'Governance templates integration', () => {
	test.beforeAll( () => {
		seedSiteChromeData();
		const seed = seedIntegrationData();
		governance = seed.governance;
	} );

	test( 'renders agenda single with related action item', async ( { page } ) => {
		test.skip( ! governance.agendaUrl, 'Trustees Agenda plugin not available.' );
		await visitIntegrationPage( page, governance.agendaUrl );
		await expect( page.getByRole( 'heading', { name: 'E2E Board Agenda' } ) ).toBeVisible();
		await expect( page.getByRole( 'link', { name: 'E2E Action Item' } ) ).toBeVisible();
	} );

	test( 'renders agendas archive', async ( { page } ) => {
		test.skip( ! governance.agendaArchiveUrl, 'Trustees Agenda plugin not available.' );
		await visitIntegrationPage( page, governance.agendaArchiveUrl );
		await expect( page.getByRole( 'link', { name: /January 15, 2026/i } ) ).toBeVisible();
	} );

	test( 'agenda archive aria snapshot @aria', async ( { page }, testInfo ) => {
		test.skip( ! governance.agendaArchiveUrl, 'Trustees Agenda plugin not available.' );
		skipDuplicateBlockViewport( testInfo );
		await visitIntegrationPage( page, governance.agendaArchiveUrl );
		await expect( page.locator( 'body' ) ).toMatchAriaSnapshot( {
			name: 'governance-agenda-archive-frontend.yml',
		} );
	} );

	test( 'agenda archive passes axe', async ( { page } ) => {
		test.skip( ! governance.agendaArchiveUrl, 'Trustees Agenda plugin not available.' );
		await visitIntegrationPage( page, governance.agendaArchiveUrl );
		const results = await runAxeOnSelector( page, 'main, .site-content, #content' );
		expect( results.violations ).toEqual( [] );
	} );

	test( 'agenda archive full page snapshot @visual', async ( { page } ) => {
		test.skip( ! governance.agendaArchiveUrl, 'Trustees Agenda plugin not available.' );
		await visitIntegrationPage( page, governance.agendaArchiveUrl );
		await expect( page ).toHaveScreenshot(
			'governance-agenda-archive-full.png',
			FULL_PAGE_SCREENSHOT_OPTIONS
		);
	} );

	test( 'agenda aria snapshot @aria', async ( { page }, testInfo ) => {
		test.skip( ! governance.agendaUrl, 'Trustees Agenda plugin not available.' );
		skipDuplicateBlockViewport( testInfo );
		await visitIntegrationPage( page, governance.agendaUrl );
		await expect( page.locator( 'body' ) ).toMatchAriaSnapshot( {
			name: 'governance-agenda-frontend.yml',
		} );
	} );

	test( 'agenda passes axe', async ( { page } ) => {
		test.skip( ! governance.agendaUrl, 'Trustees Agenda plugin not available.' );
		await visitIntegrationPage( page, governance.agendaUrl );
		const results = await runAxeOnSelector( page, '.single-agendas-page .col-lg-8' );
		expect( results.violations ).toEqual( [] );
	} );

	test( 'agenda full page snapshot @visual', async ( { page } ) => {
		test.skip( ! governance.agendaUrl, 'Trustees Agenda plugin not available.' );
		await visitIntegrationPage( page, governance.agendaUrl );
		await expect( page ).toHaveScreenshot(
			'governance-agenda-full.png',
			FULL_PAGE_SCREENSHOT_OPTIONS
		);
	} );
} );
