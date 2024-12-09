import { useSelect, useDispatch, select, dispatch, subscribe } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';

export const isFrontPage = async () => {
	return new Promise( ( resolve ) => {
		const unsubscribe = subscribe( () => {

			// Front Page ID
			const siteStore = select('core');
			const frontPageId = siteStore.getEntityRecord('root', 'site')?.page_on_front;

			// Get current page ID
			const currentPostId = select( 'core/editor' ).getCurrentPostId();
			if ( frontPageId && currentPostId ) {
				unsubscribe();
				if ( frontPageId === currentPostId ) {
					resolve( true );
				} else {
					resolve( false );
				}
			}
		});
	} );
}


export const pageTemplate = async () => {
	return new Promise( ( resolve ) => {
		const unsubscribe = subscribe( () => {
			const { getEditedPostAttribute } = select('core/editor');
			let templateSlug = getEditedPostAttribute('template');
			if ( templateSlug !== undefined ) {
				templateSlug = templateSlug || 'default';
				unsubscribe();
				resolve( templateSlug );
			}
		});
	} );
}

export const isNewPost = async () => {
	return new Promise( ( resolve ) => {
		const unsubscribe = subscribe( () => {
			const isNewPost = select( 'core/editor' ).isCleanNewPost();
			if ( isNewPost ) {
				unsubscribe();
				resolve( isNewPost );
			} else {
				resolve( false );
			}
		});
	} );
}


export const getAllBlocks = async () => {
	return new Promise( ( resolve ) => {
		const unsubscribe = subscribe( () => {
			const blocks = select( 'core/block-editor' ).getBlocks();
			if ( blocks.length > 0 ) {
				unsubscribe();
				resolve( blocks );
			}
		});
	} );
}

/**
 * Ensure that a specific pattern is at the top of the editor
 *
 * @param {array} allBlocks - An array of all blocks in the editor
 * @param {string} blockName - The name of the block to check for
 * @param {string} patternName - The name of the pattern to insert
 */
export function forcePatternToTop( allBlocks, blockName, patternName ) {

	const templateIndex = allBlocks.findIndex( ( block ) => {
		return block.name === blockName;
	});

	// No template found - create one!
	if ( -1 === templateIndex ) {
		console.log('Notice: ' + blockName + ' not found; applying template.');
		const newBlock = createBlock( 'core/pattern', { 'slug': patternName } );
		dispatch( 'core/block-editor' ).insertBlock( newBlock, 0 );
		return;
	} else if ( templateIndex > 0 ) {
		console.log('Notice: ' + blockName + ' found at index', templateIndex, 'and will be migrated.');

		// Move other blocks after the template - we can't move the template because it's locked
		allBlocks.forEach( block => {
			dispatch('core/block-editor').moveBlockToPosition( block.clientId, '', '', templateIndex + 1 );
		});
	} else {
		console.log('Success: Block ' + blockName + ' found at index', templateIndex);
	}
}
