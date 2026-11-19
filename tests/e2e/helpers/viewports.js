/** Tablet and mobile functional runs only execute @viewport and @visual tests. */
const NARROW_VIEWPORT_GREP = /@viewport|@visual/;

/** Host and LambdaTest visual projects (same viewports for functional and @visual). */
export const VIEWPORT_PROJECTS = [
	{
		name: 'desktop',
		use: { viewport: { width: 1280, height: 800 } },
	},
	{
		name: 'tablet',
		grep: NARROW_VIEWPORT_GREP,
		use: { viewport: { width: 768, height: 1024 } },
	},
	{
		name: 'mobile',
		grep: NARROW_VIEWPORT_GREP,
		use: { viewport: { width: 375, height: 812 } },
	},
];

/**
 * Skip tablet and mobile copies of block editor and ARIA tests.
 *
 * Tablet/mobile functional runs are limited to @viewport and @visual via
 * project grep; this hook still skips block-editor @aria on narrow viewports
 * when those tests are scheduled. Block editor @visual baselines are
 * desktop-only even on LambdaTest.
 *
 * @param {import('@playwright/test').TestInfo} testInfo
 */
export function skipDuplicateBlockViewport( testInfo ) {
	const titlePath = testInfo.titlePath.join( ' ' );

	if ( titlePath.includes( '@visual' ) ) {
		const isBlockEditorVisual =
			titlePath.includes( 'editor snapshot' ) ||
			( testInfo.titlePath.includes( 'Editor' ) &&
				titlePath.includes( '@visual' ) );
		if (
			isBlockEditorVisual &&
			testInfo.project.name !== 'desktop'
		) {
			testInfo.skip(
				true,
				'Block editor @visual baselines are desktop-only (tier 2).'
			);
		}
		return;
	}

	if ( process.env.E2E_LAMBDATEST === '1' || testInfo.project.name === 'desktop' ) {
		return;
	}

	if ( titlePath.includes( 'Accessibility' ) ) {
		return;
	}

	if ( titlePath.includes( 'Frontend' ) && ! titlePath.includes( '@aria' ) ) {
		return;
	}

	testInfo.skip(
		true,
		'Block editor and ARIA tree match desktop. Layout screenshots and axe still run here.'
	);
}
