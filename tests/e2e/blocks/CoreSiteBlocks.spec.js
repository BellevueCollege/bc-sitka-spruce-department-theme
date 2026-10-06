import { test, expect } from '../fixtures/test.js';
import { prepareEditorPage } from '../helpers/editor.js';
import { skipDuplicateBlockViewport } from '../helpers/viewports.js';

const CORE_SITE_BLOCKS = [
	'bc-sitka-spruce/degrees-certificates-section',
	'bc-sitka-spruce/department-feature',
	'bc-sitka-spruce/differentiator-section',
	'bc-sitka-spruce/news-feature-core',
	'bc-sitka-spruce/support-feature',
	'bc-sitka-spruce/template-program-info',
];

test.describe( 'Core-site blocks (editor load only)', () => {
	test.beforeEach( async ( { admin, editor, page }, testInfo ) => {
		skipDuplicateBlockViewport( testInfo );
		await prepareEditorPage( { admin, editor, page } );
	} );

	for ( const blockName of CORE_SITE_BLOCKS ) {
		test( `inserts ${ blockName } without fatal error`, async ( { editor } ) => {
			await editor.insertBlock( { name: blockName } );
			await expect(
				editor.canvas.locator( `[data-type="${ blockName }"]` )
			).toBeVisible();
		} );
	}

	test( 'inserts differentiator child inside differentiator section', async ( {
		editor,
	} ) => {
		await editor.insertBlock( { name: 'bc-sitka-spruce/differentiator-section' } );
		await expect(
			editor.canvas.locator(
				'[data-type="bc-sitka-spruce/differentiator-section"]'
			)
		).toBeVisible();
	} );
} );
