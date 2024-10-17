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
			const templateSlug = getEditedPostAttribute('template');
			if ( templateSlug ) {
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
