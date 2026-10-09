import { test, expect } from '../fixtures/test.js';
import {
	expectFullPageScreenshot,
	runAxeOnSelector,
	visitIntegrationPage,
} from '../helpers/page-integration.js';
import { skipDuplicateBlockViewport } from '../helpers/viewports.js';
import { seedIntegrationData, seedSiteChromeData } from '../helpers/wp-cli.js';

let pageUrl;
let profileNoPhotoUrl;

test.describe( 'Single profile integration', () => {
	test.beforeAll( () => {
		seedSiteChromeData();
		const seed = seedIntegrationData();
		pageUrl = seed.profileUrl;
		profileNoPhotoUrl = seed.profileNoPhotoUrl;
	} );

	test.beforeEach( async ( { page } ) => {
		await visitIntegrationPage( page, pageUrl );
	} );

	test( 'renders bio, demographics, and listing sections', async ( { page } ) => {
		await expect( page.getByRole( 'heading', { name: 'About Me' } ) ).toBeVisible();
		await expect( page.getByText( 'Optional Callout' ) ).toBeVisible();
		await expect( page.getByText( 'she/her' ) ).toBeVisible();
		await expect( page.getByRole( 'link', { name: 'ada.lovelace@example.com' } ) ).toBeVisible();
		await expect( page.locator( '.profile-overview img' ) ).toBeVisible();
		await expect( page.locator( '.profile-overview img' ) ).not.toHaveAttribute(
			'src',
			/basic-img\.svg/
		);
		await expect( page.getByRole( 'heading', { name: 'Support Services' } ) ).toBeVisible();
		await expect( page.getByRole( 'heading', { name: 'In the News' } ) ).toBeVisible();
	} );

	test( 'frontend aria snapshot @aria', async ( { page }, testInfo ) => {
		skipDuplicateBlockViewport( testInfo );
		await expect( page.locator( 'body' ) ).toMatchAriaSnapshot( {
			name: 'single-profile-frontend.yml',
		} );
	} );

	test( 'main content passes axe', async ( { page } ) => {
		const results = await runAxeOnSelector( page, '.bio-section-wrapper, .bio-section' );
		expect( results.violations ).toEqual( [] );
	} );

	test( 'full page snapshot @visual', async ( { page } ) => {
		await expectFullPageScreenshot( page, 'single-profile-full.png' );
	} );
} );

test.describe( 'Single profile without photo', () => {
	test.beforeAll( () => {
		seedSiteChromeData();
		const seed = seedIntegrationData();
		profileNoPhotoUrl = seed.profileNoPhotoUrl;
	} );

	test( 'uses placeholder image in overview', async ( { page } ) => {
		await visitIntegrationPage( page, profileNoPhotoUrl );
		await expect( page.locator( '.profile-overview img[src*="basic-img.svg"]' ) ).toBeVisible();
	} );

	test( 'full page snapshot @visual', async ( { page } ) => {
		await visitIntegrationPage( page, profileNoPhotoUrl );
		await expectFullPageScreenshot( page, 'single-profile-no-photo-full.png' );
	} );
} );
