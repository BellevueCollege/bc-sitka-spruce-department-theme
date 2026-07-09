/**
 * Playwright config extending @wordpress/scripts defaults.
 *
 * wp-scripts test-playwright resolves WP_BASE_URL (default http://localhost:8889
 * for the .wp-env-tests.json environment), starts the tests wp-env via webServer,
 *
 * Host runs functional tests across desktop, tablet, and mobile.
 * Docker runs @visual snapshot tests across container-desktop, container-tablet,
 * and container-mobile (canonical baselines).
 *
 * Optional run mode:
 * - E2E_VISUAL_DOCKER=1 — Playwright-in-Docker via test:e2e:visual
 */
import { defineConfig } from '@playwright/test';
import baseConfig from '@wordpress/scripts/config/playwright.config.js';
import {
	getContainerVisualProjects,
	isVisualDockerProjectEnabled,
	isVisualDockerRun,
	VIEWPORT_PROJECTS,
} from './tests/e2e/helpers/visual-docker.js';

const projects = isVisualDockerProjectEnabled()
	? getContainerVisualProjects()
	: [ ...VIEWPORT_PROJECTS ];

export default defineConfig( {
	...baseConfig,
	globalSetup: './tests/e2e/global-setup.js',
	testDir: './tests/e2e',
	// E2E tests use the isolated tests env (.wp-env-tests.json on port 8889).
	webServer: isVisualDockerRun()
		? undefined
		: {
				...baseConfig.webServer,
				command: 'npm run env:tests:start',
		  },
	use: {
		...baseConfig.use,
	},
	projects,
} );
