import { dispatch, select } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import { isNewPost, isFrontPage, pageTemplate, getAllBlocks, forcePatternToTop } from './core/editor-data-helpers';


// Thanks to https://github.com/WordPress/gutenberg/issues/28032#issuecomment-772720637 for the dom ready code!
wp.domReady( async function () {

	const blocks = await getAllBlocks();

	if ( await isNewPost() ) {
		console.log('Editing a New Post - No migration needed');
		return;
	}

	// Check if we are editing the front page
	if ( await isFrontPage() ) {
		forcePatternToTop( blocks, 'bc-sitka-spruce/template-homepage', 'bc-sitka-spruce/page-homepage' );
		return;
	}

	// Check if we are editing a page using the default template
	if ( await pageTemplate() === 'default' ) {
		forcePatternToTop( blocks, 'bc-sitka-spruce/narrow-content', 'bc-sitka-spruce/page' );
	}

	// Check if narrow content section exists somewhere on the 'no nav sidebar' page
	if ( await pageTemplate() === 'template--no-sidebar.php' ) {
		const templateIndex = blocks.findIndex( ( block ) => {
			return block.name === 'bc-sitka-spruce/narrow-content';
		});

		// Move children out of the narrow content section and delete it
		if ( -1 !== templateIndex ) {
			const children = select( 'core/block-editor' ).getClientIdsOfDescendants( blocks[templateIndex].clientId );
			dispatch( 'core/block-editor' ).moveBlocksToPosition( children, blocks[templateIndex].clientId, '', 0 );
			dispatch( 'core/block-editor' ).removeBlock( blocks[templateIndex].clientId );
		}
	}

});

