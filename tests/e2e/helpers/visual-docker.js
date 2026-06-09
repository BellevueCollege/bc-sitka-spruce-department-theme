/**
 * Constants and helpers for Playwright-in-Docker visual regression runs.
 *
 * Baselines must be generated and compared inside the same pinned Docker image
 * so font rendering stays consistent across macOS, Linux, and Windows hosts.
 */

/** Pinned Playwright image — must match the project's Playwright version (1.60.0). */
export const PLAYWRIGHT_DOCKER_IMAGE =
	'mcr.microsoft.com/playwright:v1.60.0-noble';

/** wp-env tests site URL when testsEnvironment is enabled in .wp-env.json. */
export const WP_TESTS_BASE_URL = 'http://localhost:8889';

/** Host Playwright projects for functional tests (all breakpoints). */
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
 * Docker Playwright projects for @visual tests (same viewports, canonical baselines).
 *
 * @return {import('@playwright/test').Project[]}
 */
export function getContainerVisualProjects() {
	return VIEWPORT_PROJECTS.map( ( project ) => ( {
		name: `container-${ project.name }`,
		use: project.use,
	} ) );
}

/**
 * Whether the current process is running inside the Playwright Docker container.
 *
 * @return {boolean}
 */
export function isVisualDockerRun() {
	return process.env.E2E_VISUAL_DOCKER === '1';
}

/**
 * Whether playwright.config should register container visual projects.
 *
 * @return {boolean}
 */
export function isVisualDockerProjectEnabled() {
	return isVisualDockerRun();
}
