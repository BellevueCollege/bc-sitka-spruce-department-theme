// tests/e2e/blocks/PostsFeature.spec.js
import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import AxeBuilder from '@axe-core/playwright';
import {
	getVisualSnapshotSkipReason,
	publishAndGetUrl,
	prepareEditorPage,
	shouldSkipVisualSnapshot,
} from '../helpers/editor.js';
import { seedPostsFeatureData } from '../helpers/wp-cli.js';

const BLOCK_NAME = 'bc-sitka-spruce/posts-feature';

const SECTION_TITLE = 'Department News';
const SECTION_DESCRIPTION = 'Latest stories from our department.';

const FIXTURE = {
	empty: () => ( {
		title: '',
		description: '',
		linkTitle: '',
		linkUrl: '',
		largeStoryId: 0,
		smallStoryTypes: [],
	} ),
	featuredOnly: ( seed ) => ( {
		title: SECTION_TITLE,
		description: SECTION_DESCRIPTION,
		linkTitle: '',
		linkUrl: '',
		largeStoryId: seed.featuredPostId,
		smallStoryTypes: [],
	} ),
	listOnly: ( seed ) => ( {
		title: 'Recent Updates',
		description: '',
		linkTitle: '',
		linkUrl: '',
		largeStoryId: 0,
		smallStoryTypes: [ seed.categoryId ],
	} ),
	full: ( seed ) => ( {
		title: SECTION_TITLE,
		description: SECTION_DESCRIPTION,
		linkTitle: 'View all news',
		linkUrl: 'https://example.com/news',
		largeStoryId: seed.featuredPostId,
		smallStoryTypes: [ seed.categoryId ],
	} ),
};

let seed;

test.describe( 'Posts Feature Block', () => {
	test.beforeAll( () => {
		seed = seedPostsFeatureData();
	} );

	test.beforeEach( async ( { admin, editor, page } ) => {
		await prepareEditorPage( { admin, editor, page } );
	} );

	test.describe( 'Editor', () => {
		test( 'inserts block into editor', async ( { editor } ) => {
			await editor.insertBlock( { name: BLOCK_NAME } );

			await expect(
				editor.canvas.locator( `[data-type="${ BLOCK_NAME }"]` )
			).toBeVisible();
		} );

		test( 'shows empty state when no post or categories are selected', async ( {
			editor,
		} ) => {
			await editor.insertBlock( {
				name: BLOCK_NAME,
				attributes: FIXTURE.empty(),
			} );

			await expect(
				editor.canvas.getByText( 'No Story or Story Types Selected!' )
			).toBeVisible();
		} );

		test( 'renders CTA and featured post from block attributes', async ( {
			editor,
		} ) => {
			await editor.insertBlock( {
				name: BLOCK_NAME,
				attributes: FIXTURE.full( seed ),
			} );

			await expect(
				editor.canvas.getByRole( 'link', { name: 'View all news' } )
			).toBeVisible();
			await waitForFeaturedPostInEditor( editor, seed.featuredPostTitle );
		} );

		test( 'loads featured post preview when largeStoryId is set', async ( {
			editor,
		} ) => {
			await editor.insertBlock( {
				name: BLOCK_NAME,
				attributes: FIXTURE.featuredOnly( seed ),
			} );

			await waitForFeaturedPostInEditor( editor, seed.featuredPostTitle );
		} );

		test( 'loads list previews when categories are selected', async ( {
			editor,
		} ) => {
			await editor.insertBlock( {
				name: BLOCK_NAME,
				attributes: FIXTURE.listOnly( seed ),
			} );

			await waitForListPostsInEditor( editor, seed.listPostTitles );
		} );

		test( 'editor snapshot — full configuration @visual', async ( {
			editor,
		}, testInfo ) => {
			test.skip(
				shouldSkipVisualSnapshot( testInfo.project ),
				getVisualSnapshotSkipReason( testInfo.project )
			);

			await editor.insertBlock( {
				name: BLOCK_NAME,
				attributes: FIXTURE.full( seed ),
			} );

			const block = editor.canvas.locator(
				`[data-type="${ BLOCK_NAME }"]`
			);
			await waitForFeaturedPostInEditor( editor, seed.featuredPostTitle );
			await waitForListPostsInEditor( editor, seed.listPostTitles );
			await expect( block ).toHaveScreenshot(
				'posts-feature-editor-full.png',
				{ maxDiffPixelRatio: 0.02 }
			);
		} );
	} );

	test.describe( 'Frontend', () => {
		test( 'does not render when block has no configuration', async ( {
			editor,
			page,
		} ) => {
			await editor.insertBlock( {
				name: BLOCK_NAME,
				attributes: FIXTURE.empty(),
			} );

			const url = await publishAndGetUrl( editor, page );
			await page.goto( url );

			await expect( page.locator( 'section.news-feature' ) ).toHaveCount(
				0
			);
		} );

		test( 'renders featured story, list items, and CTA link', async ( {
			editor,
			page,
		} ) => {
			await editor.insertBlock( {
				name: BLOCK_NAME,
				attributes: FIXTURE.full( seed ),
			} );

			const url = await publishAndGetUrl( editor, page );
			await page.goto( url );

			const section = getPostsFeatureLocator( page );
			await expect( section ).toBeVisible();
			await expect(
				section.getByRole( 'heading', { level: 2, name: SECTION_TITLE } )
			).toBeVisible();
			await expect(
				section.getByRole( 'link', { name: 'View all news' } )
			).toHaveAttribute( 'href', 'https://example.com/news' );
			await expect(
				section.getByRole( 'link', { name: seed.featuredPostTitle } )
			).toBeVisible();
			await expect( section.locator( '.news-feature--featured-item img' ) ).toBeVisible();

			const list = section.locator( '.news-feature--list .news-feature--item' );
			await expect( list ).toHaveCount( 3 );

			for ( const title of seed.listPostTitles ) {
				await expect(
					section.getByRole( 'link', { name: title } )
				).toBeVisible();
			}

			await expect(
				section.getByRole( 'link', { name: seed.featuredPostTitle } )
			).toHaveCount( 1 );
		} );

		test( 'renders list-only configuration without featured story', async ( {
			editor,
			page,
		} ) => {
			await editor.insertBlock( {
				name: BLOCK_NAME,
				attributes: FIXTURE.listOnly( seed ),
			} );

			const url = await publishAndGetUrl( editor, page );
			await page.goto( url );

			const section = getPostsFeatureLocator( page );
			await expect( section ).toBeVisible();
			await expect(
				section.locator( '.news-feature--featured-item' )
			).toHaveCount( 0 );
			await expect(
				section.locator( '.news-feature--list .news-feature--item' )
			).toHaveCount( 3 );
		} );

		test( 'frontend snapshot — full configuration @visual', async ( {
			editor,
			page,
		}, testInfo ) => {
			test.skip(
				shouldSkipVisualSnapshot( testInfo.project ),
				getVisualSnapshotSkipReason( testInfo.project )
			);

			await editor.insertBlock( {
				name: BLOCK_NAME,
				attributes: FIXTURE.full( seed ),
			} );

			const url = await publishAndGetUrl( editor, page );
			await page.goto( url );

			const section = getPostsFeatureLocator( page );
			await expect( section ).toBeVisible();
			await expect( section ).toHaveScreenshot(
				'posts-feature-frontend-full.png',
				{ maxDiffPixelRatio: 0.02 }
			);
		} );
	} );

	test.describe( 'Accessibility', () => {
		test( 'passes axe audit — full configuration', async ( {
			editor,
			page,
		} ) => {
			await editor.insertBlock( {
				name: BLOCK_NAME,
				attributes: FIXTURE.full( seed ),
			} );

			const url = await publishAndGetUrl( editor, page );
			await page.goto( url );

			const section = getPostsFeatureLocator( page );
			await expect( section ).toBeVisible();

			const results = await new AxeBuilder( { page } )
				.include( 'section.news-feature' )
				.withTags( [ 'wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa' ] )
				.analyze();

			expect( results.violations ).toEqual( [] );
		} );
	} );
} );

async function waitForFeaturedPostInEditor( editor, postTitle ) {
	await editor.canvas
		.getByRole( 'link', { name: postTitle } )
		.first()
		.waitFor( { state: 'visible', timeout: 15000 } );
}

async function waitForListPostsInEditor( editor, postTitles ) {
	for ( const title of postTitles ) {
		await editor.canvas
			.getByRole( 'link', { name: title } )
			.first()
			.waitFor( { state: 'visible', timeout: 15000 } );
	}
}

function getPostsFeatureLocator( page ) {
	return page.locator( 'section.news-feature' );
}
