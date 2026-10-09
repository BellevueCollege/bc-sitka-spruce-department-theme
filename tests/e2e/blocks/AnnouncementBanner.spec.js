// tests/e2e/blocks/AnnouncementBanner.spec.js
import { test, expect } from '../fixtures/test.js';
import AxeBuilder from '@axe-core/playwright';
import {
	prepareEditorCanvasForScreenshot,
	prepareEditorPage,
	settleLocatorForScreenshot,
	visitPublishedFrontend,
} from '../helpers/editor.js';
import { skipDuplicateBlockViewport } from '../helpers/viewports.js';
import { seedBlockFrontendPages, uploadTestImage } from '../helpers/wp-cli.js';

const BLOCK_NAME = 'bc-sitka-spruce/announcement-banner';

const ACF_FIELDS = {
	TITLE: 'field_66e4c35bcf5ea',
	DESCRIPTION: 'field_66e4c38bcf5eb',
	IMAGE: 'field_66e4c50d2ef34',
	BUTTON: 'field_66e4c39ecf5ec',
	LINKS: 'field_66e4c40bcf5ed',
};

const FIXTURE = {
	withButton: ( imageId ) => ( {
		[ ACF_FIELDS.TITLE ]: 'Test Announcement',
		[ ACF_FIELDS.DESCRIPTION ]:
			'This is a test announcement description for visual regression.',
		[ ACF_FIELDS.IMAGE ]: imageId,
		[ ACF_FIELDS.BUTTON ]: {
			title: 'Learn More',
			url: 'https://example.com',
			target: '_blank',
		},
		[ ACF_FIELDS.LINKS ]: '',
	} ),
	withLinks: ( imageId ) => ( {
		[ ACF_FIELDS.TITLE ]: 'Test Announcement',
		[ ACF_FIELDS.DESCRIPTION ]:
			'This is a test announcement description for visual regression.',
		[ ACF_FIELDS.IMAGE ]: imageId,
		[ ACF_FIELDS.BUTTON ]: { title: '', url: '', target: '' },
		[ ACF_FIELDS.LINKS ]: [
			{
				field_66e4c419cf5ee: {
					title: 'Link One',
					url: 'https://example.com/one',
					target: '',
				},
			},
			{
				field_66e4c419cf5ee: {
					title: 'Link Two',
					url: 'https://example.com/two',
					target: '',
				},
			},
			{
				field_66e4c419cf5ee: {
					title: 'Link Three',
					url: 'https://example.com/three',
					target: '_blank',
				},
			},
		],
	} ),
	noImage: () => ( {
		[ ACF_FIELDS.TITLE ]: 'Test Announcement No Image',
		[ ACF_FIELDS.DESCRIPTION ]: 'This announcement has no image set.',
		[ ACF_FIELDS.IMAGE ]: '',
		[ ACF_FIELDS.BUTTON ]: {
			title: 'Learn More',
			url: 'https://example.com',
			target: '_blank',
		},
		[ ACF_FIELDS.LINKS ]: '',
	} ),
};

/** @type {Record<string, { pageUrl: string }>} */
let frontendPages;

test.describe( 'Announcement Banner Block', () => {
	test.beforeAll( () => {
		const imageId = uploadTestImage();
		frontendPages = seedBlockFrontendPages( BLOCK_NAME, {
			withButton: {
				attributes: { data: FIXTURE.withButton( imageId ) },
			},
			withLinks: {
				attributes: { data: FIXTURE.withLinks( imageId ) },
			},
			noImage: {
				attributes: { data: FIXTURE.noImage() },
			},
		} );
	} );

	test.describe( 'Editor', () => {
		test.beforeEach( async ( { admin, editor, page }, testInfo ) => {
			skipDuplicateBlockViewport( testInfo );
			await prepareEditorPage( { admin, editor, page } );
		} );

		test( 'inserts block into editor', async ( { editor } ) => {
			await editor.insertBlock( { name: BLOCK_NAME } );

			await expect(
				editor.canvas.locator( `[data-type="${ BLOCK_NAME }"]` )
			).toBeVisible();
		} );

		test( 'editor snapshot — with button and image @visual', async ( {
			editor,
			page,
		}, testInfo ) => {
			const imageId = uploadTestImage();
			await editor.insertBlock( {
				name: BLOCK_NAME,
				attributes: { data: FIXTURE.withButton( imageId ) },
			} );

			const block = editor.canvas.locator(
				`[data-type="${ BLOCK_NAME }"]`
			);
			await waitForBlockToRender( editor, BLOCK_NAME );
			await prepareEditorCanvasForScreenshot( page, testInfo );
			await settleLocatorForScreenshot( block );
			await expect( block ).toBeVisible();
			await expect( block ).toHaveScreenshot( 'editor-with-button.png', {
				maxDiffPixelRatio: 0.02,
			} );
		} );

		test( 'editor — with button and image @aria', async ( { editor } ) => {
			const imageId = uploadTestImage();
			await editor.insertBlock( {
				name: BLOCK_NAME,
				attributes: { data: FIXTURE.withButton( imageId ) },
			} );

			const block = editor.canvas.locator(
				`[data-type="${ BLOCK_NAME }"]`
			);
			await waitForBlockToRender( editor, BLOCK_NAME );
			await expect( block ).toBeVisible();
			await expect( block ).toMatchAriaSnapshot( {
				name: 'editor-with-button.yml',
			} );
		} );
	} );

	test.describe( 'Frontend', () => {
		test( 'frontend snapshot — with button and image @visual', async ( {
			page,
		} ) => {
			const banner = getBannerLocator( page, 'Test Announcement' );
			await visitPublishedFrontend(
				page,
				frontendPages.withButton.pageUrl
			);
			await expect( banner ).toBeVisible();
			await settleLocatorForScreenshot( banner );
			await expect( banner ).toHaveScreenshot(
				'frontend-with-button.png',
				{
					maxDiffPixelRatio: 0.02,
				}
			);
		} );

		test( 'renders button with correct href and target', async ( {
			page,
		} ) => {
			await visitPublishedFrontend(
				page,
				frontendPages.withButton.pageUrl
			);
			const button = getBannerLocator(
				page,
				'Test Announcement'
			).getByRole( 'link', { name: 'Learn More' } );

			await expect( button ).toBeVisible();
			await expect( button ).toHaveAttribute(
				'href',
				'https://example.com'
			);
			await expect( button ).toHaveAttribute( 'target', '_blank' );
		} );

		test( 'renders all links in repeater', async ( { page } ) => {
			await visitPublishedFrontend( page, frontendPages.withLinks.pageUrl );
			const banner = getBannerLocator( page, 'Test Announcement' );
			await expect(
				banner.getByRole( 'link', { name: 'Link One' } )
			).toBeVisible();
			await expect(
				banner.getByRole( 'link', { name: 'Link Two' } )
			).toBeVisible();
			await expect(
				banner.getByRole( 'link', { name: 'Link Three' } )
			).toBeVisible();
			await expect(
				banner.getByRole( 'link', { name: 'Link Three' } )
			).toHaveAttribute( 'target', '_blank' );
		} );

		test( 'renders image when provided', async ( { page } ) => {
			await visitPublishedFrontend(
				page,
				frontendPages.withButton.pageUrl
			);
			const banner = getBannerLocator( page, 'Test Announcement' );
			await expect( banner.locator( 'img' ) ).toBeVisible();
		} );

		test( 'renders without image when not provided', async ( { page } ) => {
			await visitPublishedFrontend( page, frontendPages.noImage.pageUrl );
			const banner = getBannerLocator(
				page,
				'Test Announcement No Image'
			);
			await expect( banner ).toBeVisible();
			await expect( banner.locator( 'img' ) ).toHaveCount( 0 );
		} );

		test( 'frontend — with button and image @aria', async ( { page } ) => {
			await visitPublishedFrontend(
				page,
				frontendPages.withButton.pageUrl
			);
			const banner = getBannerLocator( page, 'Test Announcement' );
			await expect( banner ).toBeVisible();
			await expect( banner ).toMatchAriaSnapshot( {
				name: 'frontend-with-button.yml',
			} );
		} );
	} );

	test.describe( 'Accessibility', () => {
		test( 'passes axe audit — with button and image', async ( { page } ) => {
			await visitPublishedFrontend(
				page,
				frontendPages.withButton.pageUrl
			);
			await expect(
				getBannerLocator( page, 'Test Announcement' )
			).toBeVisible();

			const results = await new AxeBuilder( { page: page } )
				.include( 'article' )
				.withTags( [ 'wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa' ] )
				.analyze();

			expect( results.violations ).toEqual( [] );
		} );

		test( 'passes axe audit — with links and image', async ( { page } ) => {
			await visitPublishedFrontend( page, frontendPages.withLinks.pageUrl );
			await expect(
				getBannerLocator( page, 'Test Announcement' )
			).toBeVisible();

			const results = await new AxeBuilder( { page: page } )
				.include( 'article' )
				.withTags( [ 'wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa' ] )
				.analyze();

			expect( results.violations ).toEqual( [] );
		} );

		test( 'passes axe audit — no image', async ( { page } ) => {
			await visitPublishedFrontend( page, frontendPages.noImage.pageUrl );
			await expect(
				getBannerLocator( page, 'Test Announcement No Image' )
			).toBeVisible();

			const results = await new AxeBuilder( { page: page } )
				.include( 'article' )
				.withTags( [ 'wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa' ] )
				.analyze();

			expect( results.violations ).toEqual( [] );
		} );
	} );
} );

async function waitForBlockToRender( editor, blockName ) {
	await editor.canvas
		.locator( `[data-type="${ blockName }"] h2` )
		.waitFor( { state: 'visible', timeout: 10000 } );
}

function getBannerLocator( page, title ) {
	return page.locator( 'article' ).filter( {
		has: page.locator( 'h2', { hasText: title } ),
	} );
}
