/**
 * Playwright test fixture extending @wordpress/e2e-test-utils-playwright.
 */
import { test as base, expect } from '@wordpress/e2e-test-utils-playwright';
import { installLambdaTestTunnelProxy } from '../helpers/lambdatest-tunnel-proxy.js';
import { isLambdaTestRun } from '../helpers/lambdatest.js';

export const test = base.extend( {
	context: async ( { context }, use ) => {
		if ( isLambdaTestRun() ) {
			await installLambdaTestTunnelProxy( context );
		}

		await use( context );
	},
} );

export { expect };
