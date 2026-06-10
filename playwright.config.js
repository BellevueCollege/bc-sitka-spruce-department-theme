/**
 * Playwright config extending @wordpress/scripts defaults.
 *
 * wp-scripts test-playwright resolves WP_BASE_URL (default http://localhost:8889
 * for wp-env tests sites), starts wp-env via webServer, and runs globalSetup.
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
	// wp-env runs on the host when Playwright is inside Docker (--network host).
	webServer: isVisualDockerRun() ? undefined : baseConfig.webServer,
	use: {
		...baseConfig.use,
	},
	projects,
} );
