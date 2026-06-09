/**
 * Playwright config for LambdaTest cloud browsers via tunnel.
 *
 * Differs from playwright.config.js in three ways:
 * 1. Browsers run on LambdaTest (Windows Chrome), not locally.
 * 2. wp-env must be started manually — webServer is disabled.
 * 3. Admin login is skipped — layout tests only need the public frontend.
 *
 * Requires LT_USERNAME, LT_ACCESS_KEY, and an active LambdaTest tunnel
 * (see tests/e2e/scripts/run-lambdatest-visual.sh).
 *
 * Snapshots use the lambdatest-desktop project suffix so they stay separate
 * from local desktop baselines (rendering differs by OS/browser).
 */
import { defineConfig } from '@playwright/test';
import baseConfig from '@wordpress/scripts/config/playwright.config.js';
import { getLambdaTestWsEndpoint } from './tests/e2e/helpers/lambdatest.js';

// wp-env and admin auth are handled outside this config when using LambdaTest.
const { webServer, globalSetup, projects, ...baseConfigWithoutLocalSetup } =
	baseConfig;

export default defineConfig( {
	...baseConfigWithoutLocalSetup,
	testDir: './tests/e2e',
	use: {
		...baseConfig.use,
		// Layout tests navigate to a public page; no editor session needed.
		storageState: undefined,
		connectOptions: {
			wsEndpoint: getLambdaTestWsEndpoint(),
		},
	},
	projects: [
		{
			name: 'lambdatest-desktop',
			use: {
				viewport: { width: 1280, height: 800 },
			},
		},
	],
} );
