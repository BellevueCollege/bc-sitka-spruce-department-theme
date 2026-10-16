import { test, expect } from '../fixtures/test.js';
import {
	expectFullPageScreenshot,
	runAxeOnSelector,
} from '../helpers/page-integration.js';
import { skipDuplicateBlockViewport } from '../helpers/viewports.js';
import { seedSiteChromeData } from '../helpers/wp-cli.js';

test.describe( '404 page integration', () => {
	test.beforeAll( () => {
		seedSiteChromeData();
	} );

	test.beforeEach( async ( { page } ) => {
		await page.goto( '/this-e2e-url-does-not-exist/' );
		await page.locator( '#header-wrapper' ).waitFor( { state: 'visible' } );
	} );

	test( 'renders the error page inside site chrome', async ( { page } ) => {
		await expect( page.locator( 'footer.footer' ) ).toBeVisible();
		await expect(
			page.getByRole( 'heading', { name: '404 Error: Page Not Found' } )
		).toBeVisible();
	} );

	test( 'frontend aria snapshot @aria', async ( { page }, testInfo ) => {
		skipDuplicateBlockViewport( testInfo );
		await expect( page.locator( 'body' ) ).toMatchAriaSnapshot( {
			name: 'not-found-frontend.yml',
		} );
	} );

	test( 'main content passes axe', async ( { page } ) => {
		const results = await runAxeOnSelector( page, '.flexible-page .container-xl' );
		expect( results.violations ).toEqual( [] );
	} );

	test( 'full page snapshot @visual', async ( { page } ) => {
		await expectFullPageScreenshot( page, 'not-found-full.png' );
	} );
} );
