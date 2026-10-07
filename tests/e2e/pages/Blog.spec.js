import { test, expect } from '../fixtures/test.js';
import {
	runAxeOnSelector,
	visitIntegrationPage,
} from '../helpers/page-integration.js';
import { skipDuplicateBlockViewport } from '../helpers/viewports.js';
import {
	seedChromeVariant,
	seedIntegrationData,
	seedPostsFeatureData,
	seedSiteChromeData,
} from '../helpers/wp-cli.js';

let blogIndexUrl;
let samplePostTitle;

test.describe( 'Blog templates integration', () => {
	test.beforeAll( () => {
		seedSiteChromeData();
		seedChromeVariant( 'default' );
		const posts = seedPostsFeatureData();
		const integration = seedIntegrationData();
		blogIndexUrl = integration.blogIndexUrl;
		samplePostTitle = posts.listPostTitles[ 0 ];
	} );

	test( 'post index lists seeded posts', async ( { page } ) => {
		await visitIntegrationPage( page, blogIndexUrl );
		await expect( page.getByRole( 'link', { name: samplePostTitle } ).first() ).toBeVisible();
	} );

	test( 'single post renders title and content', async ( { page } ) => {
		await visitIntegrationPage( page, blogIndexUrl );
		await page.getByRole( 'link', { name: samplePostTitle } ).first().click();
		await expect( page.getByRole( 'heading', { name: samplePostTitle } ) ).toBeVisible();
	} );

	test( 'frontend aria snapshot @aria', async ( { page }, testInfo ) => {
		skipDuplicateBlockViewport( testInfo );
		await visitIntegrationPage( page, blogIndexUrl );
		await expect( page.locator( 'body' ) ).toMatchAriaSnapshot( {
			name: 'blog-index-frontend.yml',
		} );
	} );

	test( 'main content passes axe on index', async ( { page } ) => {
		await visitIntegrationPage( page, blogIndexUrl );
		const results = await runAxeOnSelector( page, '.post-list, .posts-list, .flexible-page' );
		expect( results.violations ).toEqual( [] );
	} );
} );
