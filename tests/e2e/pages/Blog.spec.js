import { test, expect } from '../fixtures/test.js';
import {
	expectFullPageScreenshot,
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
let introMatrix;
let postsSeed;
let samplePostTitle;

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} postTitle
 */
function postListRow( page, postTitle ) {
	return page.locator( '.post-list-element' ).filter( {
		has: page.getByRole( 'link', { name: postTitle, exact: true } ),
	} );
}

test.describe( 'Blog templates integration', () => {
	test.beforeAll( () => {
		seedSiteChromeData();
		seedChromeVariant( 'default' );
		postsSeed = seedPostsFeatureData();
		const integration = seedIntegrationData();
		blogIndexUrl = integration.blogIndexUrl;
		introMatrix = integration.blogIntroMatrix;
		samplePostTitle = postsSeed.listPostTitles[ 0 ];
	} );

	test( 'post index lists seeded posts', async ( { page } ) => {
		await visitIntegrationPage( page, blogIndexUrl );
		await expect( page.getByRole( 'link', { name: samplePostTitle } ).first() ).toBeVisible();
	} );

	test( 'shows blog index intro summary and hero image', async ( { page } ) => {
		await visitIntegrationPage( page, blogIndexUrl );
		await expect( page.getByText( 'E2E blog index intro summary.' ) ).toBeVisible();
		await expect( page.getByRole( 'img', { name: 'E2E hero fixture image' } ).first() ).toBeVisible();
	} );

	test( 'renders featured media variants and a post without list thumbnail', async ( { page } ) => {
		await visitIntegrationPage( page, blogIndexUrl );

		await expect(
			postListRow( page, postsSeed.mediaVariantTitles.vertical ).locator( 'img' )
		).toBeVisible();
		await expect(
			postListRow( page, postsSeed.mediaVariantTitles.video ).locator( 'img' )
		).toBeVisible();

		await page.locator( '#sitka-pagination-post-listing' ).getByRole( 'link', { name: '2' } ).click();
		await expect(
			postListRow( page, postsSeed.mediaVariantTitles.missingImage ).locator( 'img' )
		).toHaveCount( 0 );
	} );

	test( 'paginates the post index', async ( { page } ) => {
		await visitIntegrationPage( page, blogIndexUrl );

		const pagination = page.locator( '#sitka-pagination-post-listing' );
		await expect( pagination ).toBeVisible();
		await pagination.getByRole( 'link', { name: '2' } ).click();

		await expect( page ).toHaveURL( /\/page\/2\/?/ );
		await expect( page.getByRole( 'link', { name: 'E2E Featured Post' } ) ).toBeVisible();
	} );

	test( 'filters posts by secondary category', async ( { page } ) => {
		await visitIntegrationPage( page, blogIndexUrl );

		await page.locator( '#post-category-filter' ).selectOption( {
			label: postsSeed.secondaryCategoryName,
		} );
		await page.getByRole( 'button', { name: 'Filter by Category' } ).click();

		await expect( page.getByRole( 'heading', { name: postsSeed.secondaryCategoryName } ) ).toBeVisible();
		await expect(
			page.getByRole( 'link', { name: postsSeed.mediaVariantTitles.missingImage, exact: true } )
		).toBeVisible();
		await expect( page.getByRole( 'link', { name: 'E2E List Post 1', exact: true } ) ).toHaveCount( 0 );
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

	test( 'full page snapshot @visual', async ( { page } ) => {
		await visitIntegrationPage( page, blogIndexUrl );
		await expectFullPageScreenshot( page, 'blog-index-full.png' );
	} );
} );

test.describe( 'Blog intro matrix pages', () => {
	test.beforeAll( () => {
		seedSiteChromeData();
		const integration = seedIntegrationData();
		introMatrix = integration.blogIntroMatrix;
	} );

	test( 'intro-only matrix page shows intro copy', async ( { page } ) => {
		await visitIntegrationPage( page, introMatrix.introOnlyUrl );
		await expect( page.getByText( 'E2E intro matrix intro only.' ) ).toBeVisible();
	} );

	test( 'image-only matrix page shows hero with placeholder body', async ( { page } ) => {
		await visitIntegrationPage( page, introMatrix.imageOnlyUrl );
		await expect( page.getByText( 'E2E no-sidebar intro matrix placeholder.' ) ).toBeVisible();
		await expect( page.getByRole( 'img', { name: 'E2E hero fixture image' } ).first() ).toBeVisible();
	} );
} );
