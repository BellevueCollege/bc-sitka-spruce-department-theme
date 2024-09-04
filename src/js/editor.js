import { useSelect, useDispatch, select, dispatch, subscribe } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';





// Thanks to https://github.com/WordPress/gutenberg/issues/28032#issuecomment-772720637 for the dom ready code!
wp.domReady(function () {

	async function isFrontPage() {
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

	async function pageTemplate() {
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

	async function isNewPost() {
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

	async function getAllBlocks() {
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

	//Not needed?
	async function getBlockRootClientId() {
		return new Promise( ( resolve ) => {
			const unsubscribe = subscribe( () => {
				const id = select( 'core/block-editor' ).getBlockRootClientId();
				if ( id ) {
					unsubscribe();
					resolve( id );
				}
			});
		} );
	}

	( async () => {

		// Find index of bc-sitka-spruce/template-homepage block
		const blocks = await getAllBlocks();
		const templateIndex = blocks.findIndex( ( block ) => {
			return block.name === 'bc-sitka-spruce/template-homepage';
		});

		if ( templateIndex > 0 ) {
			const clientId = blocks[ templateIndex ].clientId;
			console.log(`Moving ${clientId} to top`);
			dispatch( 'core/block-editor' ).moveBlockToPosition(
				clientId,
				'',
				'',
				0
			);
		}


		console.log('blocks',blocks);
		console.log('index of bc-sitka-spruce/template-homepage', templateIndex);
		console.log('isFrontPage', await isFrontPage());
		console.log('pageTemplate', await pageTemplate());
		console.log('isNewPost', await isNewPost());


	})();









	const isEditorReadyPromise = new Promise( ( resolve ) => {
		//approximate editor ready by checking for clean post/blocks loaded
		const unsubscribe = wp.data.subscribe( () => {

			// Get current page ID
			const currentPostId = select( 'core/editor' ).getCurrentPostId();

			// Is this a new post?
			const isNewPost = select( 'core/editor' ).isCleanNewPost();

			// Get current template
			const { getEditedPostAttribute } = select('core/editor');
			const templateSlug = getEditedPostAttribute('template');

			// // Get Front Page ID
			const siteStore = select('core');
			const frontPageId = siteStore.getEntityRecord('root', 'site')?.page_on_front;

			// Get page blocks
			const blocks = select( 'core/block-editor' ).getBlocks();


			if ( isNewPost ) {
				unsubscribe();
				resolve();
			}


			if ( templateSlug ) {
				console.log('templateSlug',templateSlug);
				unsubscribe();
				resolve();
			}




			if ( frontPageId && blocks.length > 0 ) {
				unsubscribe();
				resolve();
			}
		} );
	} );

	isEditorReadyPromise.then( () => {



		// if ( select( 'core/editor' ).isCleanNewPost() ) {
		// 	return;
		// }
		// //do your work here.
		// const blocks = select('core/block-editor').getBlocks();
		// const siteStore = select('core');
		// const frontPageId = siteStore.getEntityRecord('root', 'site')?.page_on_front;

		// // Find index of Template Homepage block
		// const index = blocks.findIndex( ( block ) => {
		// 	return block.name === 'core/template-part' && block.innerBlocks[0].name === 'core/template';
		// })
		// console.log('frontPageId',frontPageId);
		// console.log('blocks',blocks);


		// const newBlock = createBlock( 'core/paragraph', {
		// 	content: 'I\'m a new block!'
		// } );
		// console.log('Creating Block!', newBlock);
		// dispatch( 'core/block-editor' ).insertBlocks([newBlock], 0);
		// console.log('Created Block!');
	} );

});

