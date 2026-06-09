/**
 * Dismiss the pattern chooser dialog if it appears on new post creation.
 */
export async function dismissPatternDialog( page ) {
	const closeButton = page.getByRole( 'button', { name: 'Close' } );
	if ( await closeButton.isVisible() ) {
		await closeButton.click();
	}
}

/**
 * Exit the code editor and return to the visual block editor if active.
 */
export async function exitCodeEditor( page ) {
	const exitButton = page.getByRole( 'button', { name: 'Exit code editor' } );
	if ( await exitButton.isVisible() ) {
		await exitButton.click();
	}
}

/**
 * Publish the current post and return the frontend URL.
 */
export async function publishAndGetUrl( editor, page ) {
	await editor.publishPost();
	await page.waitForSelector( '.editor-post-publish-panel' );
	return page
		.locator( '.editor-post-publish-panel a:has-text("View Page")' )
		.getAttribute( 'href' );
}

/**
 * Prepare a new page in the block editor.
 */
export async function prepareEditorPage( { admin, editor, page } ) {
	await admin.createNewPost( { postType: 'page' } );
	await dismissPatternDialog( page );
	await exitCodeEditor( page );
	await editor.canvas.locator( 'body' ).waitFor( { state: 'visible' } );
}
