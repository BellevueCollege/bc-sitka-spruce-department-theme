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

/** Valid values for the E2E_VISUAL_SCOPE environment variable. */
export const VISUAL_SNAPSHOT_SCOPE = {
	DESKTOP: 'desktop',
	FULL: 'full',
};

const DESKTOP_VISUAL_PROJECTS = new Set( [
	'desktop',
	'lambdatest-desktop',
] );

/**
 * Read the visual snapshot scope from E2E_VISUAL_SCOPE.
 *
 * - desktop (default): snapshot tests run on desktop and lambdatest-desktop only
 * - full: snapshot tests run on every Playwright project (desktop, tablet, mobile, …)
 *
 * @return {'desktop'|'full'}
 */
export function getVisualSnapshotScope() {
	const scope = ( process.env.E2E_VISUAL_SCOPE || VISUAL_SNAPSHOT_SCOPE.DESKTOP )
		.trim()
		.toLowerCase();

	if (
		scope === VISUAL_SNAPSHOT_SCOPE.DESKTOP ||
		scope === VISUAL_SNAPSHOT_SCOPE.FULL
	) {
		return scope;
	}

	throw new Error(
		`E2E_VISUAL_SCOPE must be "desktop" or "full". Received "${ process.env.E2E_VISUAL_SCOPE }".`
	);
}

/**
 * Whether a visual snapshot test should be skipped for the current project.
 *
 * @param {import('@playwright/test').Project} project Playwright project metadata.
 * @return {boolean} True when the snapshot test should be skipped.
 */
export function shouldSkipVisualSnapshot( project ) {
	if ( getVisualSnapshotScope() === VISUAL_SNAPSHOT_SCOPE.FULL ) {
		return false;
	}

	return ! DESKTOP_VISUAL_PROJECTS.has( project.name );
}

/**
 * Human-readable reason for test.skip() when a snapshot is scope-limited.
 *
 * @param {import('@playwright/test').Project} project Playwright project metadata.
 * @return {string}
 */
export function getVisualSnapshotSkipReason( project ) {
	return `Visual snapshots for "${ project.name }" are skipped when E2E_VISUAL_SCOPE=desktop. Set E2E_VISUAL_SCOPE=full to capture all viewport baselines.`;
}

/**
 * @deprecated Use shouldSkipVisualSnapshot() instead.
 * @param {import('@playwright/test').Project} project Playwright project metadata.
 * @return {boolean}
 */
export function skipUnlessDesktop( project ) {
	return shouldSkipVisualSnapshot( project );
}
