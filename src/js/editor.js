import { dispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import { pageTemplate, isNewPost, isFrontPage, getAllBlocks } from './core/editor-data-helpers';


// Thanks to https://github.com/WordPress/gutenberg/issues/28032#issuecomment-772720637 for the dom ready code!
wp.domReady( async function () {

	if ( await isNewPost() ) {
		console.log('Editing a New Post - No migration needed');
		return;
	}

	if ( ! await isFrontPage() ) {
		console.log('Not Editing the Front Page - No migration needed');
		return;
	}

	// Find index of bc-sitka-spruce/template-homepage block
	const blocks = await getAllBlocks();
	const templateIndex = blocks.findIndex( ( block ) => {
		return block.name === 'bc-sitka-spruce/template-homepage';
	});



	// No template found!
	if ( -1 === templateIndex ) {
		console.log('Notice: Homepage template not found; applying template.');
		const newBlock = createBlock( 'bc-sitka-spruce/template-homepage' );
		dispatch( 'core/block-editor' ).insertBlock(newBlock, 0);
		// dispatch( 'core/block-editor' ).savePost(); // we may want to save automatically
		console.log('Inserted Block!', newBlock);
		return;
	} else {
		console.log('Homepage template found at index', templateIndex);
	}
});

