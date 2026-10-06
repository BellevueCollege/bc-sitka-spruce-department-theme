/** Host and LambdaTest visual projects (same viewports for functional and @visual). */
export const VIEWPORT_PROJECTS = [
	{
		name: 'desktop',
		use: { viewport: { width: 1280, height: 800 } },
	},
	{
		name: 'tablet',
		use: { viewport: { width: 768, height: 1024 } },
	},
	{
		name: 'mobile',
		use: { viewport: { width: 375, height: 812 } },
	},
];

/**
 * Skip tablet and mobile copies of block editor and ARIA tests.
 *
 * Those trees matched desktop in the last functional run. Header layout,
 * axe, and @visual screenshots still run on every viewport. LambdaTest
 * runs keep every project.
 *
 * @param {import('@playwright/test').TestInfo} testInfo
 */
export function skipDuplicateBlockViewport( testInfo ) {
	if ( process.env.E2E_LAMBDATEST === '1' || testInfo.project.name === 'desktop' ) {
		return;
	}

	const titlePath = testInfo.titlePath.join( ' ' );
	if ( titlePath.includes( '@visual' ) || titlePath.includes( 'Accessibility' ) ) {
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
