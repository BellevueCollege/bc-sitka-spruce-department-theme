/**
 * Playwright config extending @wordpress/scripts defaults.
 *
 * WordPress runs in wp-env on port 8889. Functional and @aria tests use host
 * Chromium. @visual tests connect to LambdaTest Linux Chrome when E2E_LAMBDATEST=1.
 */
import path from 'path';
import { defineConfig } from '@playwright/test';
import baseConfig from '@wordpress/scripts/config/playwright.config.js';
import {
	getLambdaTestPlaygroundBaseUrl,
	getLambdaTestWsEndpoint,
	isLambdaTestRun,
} from './tests/e2e/helpers/lambdatest.js';
import {
	getPlaywrightBaseUrl,
	isCiEnvironment,
	WP_ENV_E2E_READY_LOG,
} from './tests/e2e/helpers/e2e-env.js';
import { VIEWPORT_PROJECTS } from './tests/e2e/helpers/viewports.js';

if ( ! process.env.WP_BASE_URL ) {
	process.env.WP_BASE_URL = getPlaywrightBaseUrl();
}

const E2E_BASE_URL = getPlaywrightBaseUrl();
const useExternalWpEnv = process.env.E2E_WPENV_EXTERNAL === '1';
const isCi = isCiEnvironment();

const artifactsPath =
	process.env.WP_ARTIFACTS_PATH ?? path.join( process.cwd(), 'artifacts' );

const junitOutputFile = isLambdaTestRun()
	? path.join( artifactsPath, 'test-results', 'visual-junit.xml' )
	: path.join( artifactsPath, 'test-results', 'functional-junit.xml' );

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	...baseConfig,
	globalSetup: './tests/e2e/global-setup.js',
	testDir: './tests/e2e',
	timeout: isLambdaTestRun() ? 180_000 : baseConfig.timeout,
	workers: 1,
	reporter: isCi
		? [
				[ 'list' ],
				[ 'junit', { outputFile: junitOutputFile } ],
		  ]
		: baseConfig.reporter,
	webServer: useExternalWpEnv
		? undefined
		: {
				command: 'node tests/e2e/scripts/start-wp-env-e2e.mjs',
				stdout: 'pipe',
				reuseExistingServer: ! isCi,
				timeout: 300_000,
				wait: {
					stdout: new RegExp(
						WP_ENV_E2E_READY_LOG.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' )
					),
				},
		  },
	use: {
		...baseConfig.use,
		baseURL: E2E_BASE_URL,
		...( isLambdaTestRun() || isCi ? {} : { channel: 'chrome' } ),
	},
	projects: [ ...VIEWPORT_PROJECTS ],
};

if ( isLambdaTestRun() ) {
	config.use = {
		...config.use,
		baseURL: getLambdaTestPlaygroundBaseUrl(),
		actionTimeout: 60_000,
		connectOptions: {
			wsEndpoint: getLambdaTestWsEndpoint(),
		},
	};
}

export default defineConfig( config );
