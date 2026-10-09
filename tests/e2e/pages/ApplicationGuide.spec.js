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

test.describe( 'Application guide integration', () => {
	test.beforeAll( () => {
		seedSiteChromeData();
		const seed = seedIntegrationData();
		pageUrl = seed.applicationGuideUrl;
		introMatrix = seed.applicationGuideIntroMatrix;
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
		await expect( page.getByRole( 'tab', { name: 'Student Type 2' } ) ).toBeVisible();
	} );

	test( 'shows enriched step bodies and step-one callout', async ( { page }, testInfo ) => {
		if ( testInfo.project.name !== 'desktop' ) {
			await page.getByRole( 'button', { name: 'Student Type 1' } ).click();
		}

		await expect( page.getByText( 'E2E application step one body copy.' ) ).toBeVisible();
		await expect( page.getByText( 'E2E application step two body without callout.' ) ).toBeVisible();
		await expect( page.getByRole( 'heading', { name: 'E2E Step Callout' } ) ).toBeVisible();
	} );

	test( 'shows second student type steps when selected', async ( { page }, testInfo ) => {
		if ( testInfo.project.name === 'desktop' ) {
			await page.getByRole( 'tab', { name: 'Student Type 2' } ).click();
		} else {
			await page.getByRole( 'button', { name: 'Student Type 2' } ).click();
		}

		await expect( page.getByText( 'Step 1: Type Two Step' ) ).toBeVisible();
		await expect( page.getByText( 'E2E application step for student type two.' ) ).toBeVisible();
	} );

	test( 'shows accordion FAQ panels and accordion callout', async ( { page } ) => {
		await expect( page.getByRole( 'button', { name: 'E2E FAQ One' } ) ).toBeVisible();
		await expect( page.getByText( 'E2E FAQ panel one body (open by default).' ) ).toBeVisible();
		await expect( page.getByRole( 'button', { name: 'E2E FAQ Two' } ) ).toBeVisible();
		await expect( page.getByRole( 'heading', { name: 'E2E Accordion Callout' } ) ).toBeVisible();
	} );

	test( 'shows populated additional resource cards', async ( { page } ) => {
		await expect( page.getByRole( 'heading', { name: 'E2E Resource Card One' } ) ).toBeVisible();
		await expect( page.getByRole( 'heading', { name: 'E2E Resource Card Two' } ) ).toBeVisible();
		await expect( page.getByText( 'E2E additional resource card one body.' ) ).toBeVisible();
	} );

	test( 'wires dual identity-support tabs and primary support link', async ( { page }, testInfo ) => {
		if ( testInfo.project.name !== 'desktop' ) {
			testInfo.skip( true, 'Support feature tabs are desktop-only in this assertion set.' );
		}

		await expect(
			page.getByRole( 'tab', { name: 'E2E Core Identity Support', exact: true } )
		).toBeVisible();
		await expect( page.getByRole( 'tab', { name: 'E2E Core Identity Support Two' } ) ).toBeVisible();
		await expect( page.getByRole( 'heading', { name: 'E2E Support Tab' } ) ).toBeVisible();
		await expect( page.getByRole( 'link', { name: 'E2E Support Resource' } ) ).toBeVisible();
	} );

	test( 'shows the first application step @viewport', async ( { page }, testInfo ) => {
		if ( testInfo.project.name !== 'desktop' ) {
			await page.getByRole( 'button', { name: 'Student Type 1' } ).click();
		}

		await expect( page.getByText( 'Step 1: Step Title' ) ).toBeVisible();
	} );

	test( 'frontend aria snapshot @aria', async ( { page }, testInfo ) => {
		skipDuplicateBlockViewport( testInfo );

		if ( testInfo.project.name === 'desktop' ) {
			await expect( page.getByRole( 'tab', { name: 'Student Type 1' } ) ).toBeVisible();
		}

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

test.describe( 'Application guide page intro matrix', () => {
	test.beforeAll( () => {
		seedSiteChromeData();
		const seed = seedIntegrationData();
		pageUrl = seed.applicationGuideUrl;
		introMatrix = seed.applicationGuideIntroMatrix;
	} );

	test( 'canonical guide shows intro text and header image', async ( { page } ) => {
		await visitIntegrationPage( page, pageUrl );
		await expect( page.getByText( 'E2E application guide intro summary.' ) ).toBeVisible();
		await expect( page.getByRole( 'img', { name: 'E2E hero fixture image' } ).first() ).toBeVisible();
	} );

	test( 'intro-only matrix page shows intro without duplicate hero in intro region', async ( { page } ) => {
		await visitIntegrationPage( page, introMatrix.introOnlyUrl );
		await expect( page.getByText( 'E2E intro matrix intro only.' ) ).toBeVisible();
	} );

	test( 'image-only matrix page shows hero image with matrix placeholder copy', async ( { page } ) => {
		await visitIntegrationPage( page, introMatrix.imageOnlyUrl );
		await expect( page.getByText( 'E2E no-sidebar intro matrix placeholder.' ) ).toBeVisible();
		await expect( page.getByRole( 'img', { name: 'E2E hero fixture image' } ).first() ).toBeVisible();
	} );
} );
