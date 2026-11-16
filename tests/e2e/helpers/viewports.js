/** Tablet and mobile functional runs only execute @viewport and @visual tests. */
const NARROW_VIEWPORT_GREP = /@viewport|@visual/;

/**
 * Keep @desktop-only snapshots off tablet and mobile so LambdaTest does not
 * schedule tests that would always skip.
 */
const NARROW_VIEWPORT_GREP_INVERT = /@desktop-only/;

/**
 * Desktop collects every test except @narrow-only. Those cases belong on
 * tablet and mobile; collecting them on desktop would record a skip in JUnit.
 */
const DESKTOP_GREP_INVERT = /@narrow-only/;

/** Host and LambdaTest visual projects (same viewports for functional and @visual). */
export const VIEWPORT_PROJECTS = [
	{
		name: 'desktop',
		grepInvert: DESKTOP_GREP_INVERT,
		use: { viewport: { width: 1280, height: 800 } },
	},
	{
		name: 'tablet',
		grep: NARROW_VIEWPORT_GREP,
		grepInvert: NARROW_VIEWPORT_GREP_INVERT,
		use: { viewport: { width: 768, height: 1024 } },
	},
	{
		name: 'mobile',
		grep: NARROW_VIEWPORT_GREP,
		grepInvert: NARROW_VIEWPORT_GREP_INVERT,
		use: { viewport: { width: 375, height: 812 } },
	},
];

/**
 * Skip tablet and mobile copies of block editor and ARIA tests.
 *
 * Tablet/mobile projects only schedule @viewport and @visual tests, and
 * grepInvert drops @desktop-only snapshots before they run. This hook still
 * skips block-editor @aria on narrow viewports when those tests are scheduled.
 *
 * @param {import('@playwright/test').TestInfo} testInfo
 */
export function skipDuplicateBlockViewport( testInfo ) {
	const titlePath = testInfo.titlePath.join( ' ' );

	if ( titlePath.includes( '@visual' ) ) {
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
