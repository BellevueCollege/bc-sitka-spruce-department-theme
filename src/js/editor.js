import { dispatch, select } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import { isNewPost, isFrontPage, pageTemplate, getAllBlocks, forcePatternToTop, deleteNarrowContentSection } from './core/editor-data-helpers';


// Thanks to https://github.com/WordPress/gutenberg/issues/28032#issuecomment-772720637 for the dom ready code!
wp.domReady( async function () {

	let blocks = await getAllBlocks();

	if ( await isNewPost() ) {
		console.log('Editing a New Post - No migration needed');
		return;
	}

	// Check if we are editing the front page
	if ( await isFrontPage() ) {
		console.log('Editing the Front Page - checking if block migration is needed');
		deleteNarrowContentSection( blocks );
		blocks = await getAllBlocks(); // update blocks
		forcePatternToTop( blocks, 'bc-sitka-spruce/template-homepage', 'bc-sitka-spruce/page-homepage' );
		return;
	}

	// Check if we are editing a page using the default template
	if ( await pageTemplate() === 'default' ) {
		console.log('Editing a page using the default template - checking if block migration is needed');
		forcePatternToTop( blocks, 'bc-sitka-spruce/narrow-content', 'bc-sitka-spruce/page' );
	}

	// Check if narrow content section exists somewhere on the 'no nav sidebar' page
	if ( await pageTemplate() === 'template--no-sidebar.php' ) {
		console.log('Editing a page using the no-nav-sidebar template - checking if block migration is needed');
		deleteNarrowContentSection( blocks );
	}

});

