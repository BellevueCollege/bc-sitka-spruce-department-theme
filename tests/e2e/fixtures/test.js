/**
 * Playwright test fixture extending @wordpress/e2e-test-utils-playwright.
 */
import { test as base, expect } from '@wordpress/e2e-test-utils-playwright';
import { installLambdaTestTunnelProxy } from '../helpers/lambdatest-tunnel-proxy.js';
import { isLambdaTestRun } from '../helpers/lambdatest.js';

export const test = base.extend( {
	page: async ( { page }, use, testInfo ) => {
		if ( isLambdaTestRun() ) {
			await installLambdaTestTunnelProxy( page );
		}

		let corsNoiseCount = 0;
		let serviceUnavailableCount = 0;
		page.on( 'response', ( response ) => {
			if ( response.status() !== 503 ) {
				return;
			}
			serviceUnavailableCount += 1;
			if ( serviceUnavailableCount > 5 ) {
				return;
			}
			// #region agent log
			fetch(
				'http://127.0.0.1:7318/ingest/2d137c06-c08e-496e-837b-46890e3b1347',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-Debug-Session-Id': 'c90b84',
					},
					body: JSON.stringify( {
						sessionId: 'c90b84',
						runId: 'visual-suite',
						hypothesisId: 'F',
						location: 'tests/e2e/fixtures/test.js:response503',
						message: 'http_503_during_test',
						data: {
							testTitle: testInfo.title,
							project: testInfo.project.name,
							url: response.url(),
						},
						timestamp: Date.now(),
					} ),
				}
			).catch( () => {} );
			// #endregion
		} );
		page.on( 'console', ( message ) => {
			const text = message.text();
			if (
				text.includes( 'CORS policy' ) &&
				text.includes( 'localhost' ) &&
				text.includes( '127.0.0.1' )
			) {
				corsNoiseCount += 1;
			}
		} );

		await use( page );

		if ( corsNoiseCount > 0 ) {
			// #region agent log
			fetch(
				'http://127.0.0.1:7318/ingest/2d137c06-c08e-496e-837b-46890e3b1347',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-Debug-Session-Id': 'c90b84',
					},
					body: JSON.stringify( {
						sessionId: 'c90b84',
						runId: 'functional-suite',
						hypothesisId: 'A',
						location: 'tests/e2e/fixtures/test.js:corsNoise',
						message: 'localhost_vs_loopback_cors_console',
						data: {
							testTitle: testInfo.title,
							project: testInfo.project.name,
							corsNoiseCount,
						},
						timestamp: Date.now(),
					} ),
				}
			).catch( () => {} );
			// #endregion
		}
	},
} );

export { expect };
