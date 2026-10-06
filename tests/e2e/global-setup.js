/**
 * Playwright global setup: verify LambdaTest tunnel, seed e2e state, authenticate.
 */
import { chromium } from '@playwright/test';
import defaultGlobalSetup from '@wordpress/scripts/config/playwright/global-setup.js';
import {
	ensureTunnelRunning,
	getLambdaTestPlaygroundBaseUrl,
	getLambdaTestWsEndpoint,
	isLambdaTestRun,
	isTunnelAutoStartEnabled,
	stopLambdaTestTunnelContainer,
} from './helpers/lambdatest.js';
import { getHostE2eBaseUrl } from './helpers/e2e-env.js';
import { seedEditorPreferences } from './helpers/wp-cli.js';

/**
 * @param {import('@playwright/test').FullConfig} config
 * @return {import('@playwright/test').FullConfig}
 */
function configWithHostE2eBaseUrl( config ) {
	const hostE2eUrl = getHostE2eBaseUrl();

	return {
		...config,
		projects: config.projects.map( ( project ) => ({
			...project,
			use: {
				...project.use,
				baseURL: hostE2eUrl,
			},
		}) ),
	};
}

/**
 * Log in through LambdaTest Chrome and persist storage state for host.docker.internal.
 *
 * @param {import('@playwright/test').FullConfig} config
 * @return {Promise<void>}
 */
async function ensureLambdaTestAdminSession( config ) {
	const storageStatePath = config.projects[ 0 ].use.storageState;
	if ( typeof storageStatePath !== 'string' ) {
		return;
	}

	const baseURL = getLambdaTestPlaygroundBaseUrl();
	const browser = await chromium.connect( getLambdaTestWsEndpoint() );

	try {
		const context = await browser.newContext( { baseURL } );
		const page = await context.newPage();

		await page.goto( '/wp-admin/' );

		const bodyText = await page.locator( 'body' ).innerText().catch( () => '' );
		if ( bodyText.includes( '[::1]' ) || bodyText.includes( 'connection refused' ) ) {
			throw new Error(
				'LambdaTest tunnel could not reach WordPress. On macOS/Podman, base URL must be ' +
					`${ baseURL } (not 127.0.0.1). Restart wp-env and the e2e-tunnel container.`
			);
		}

		if ( page.url().includes( 'wp-login.php' ) ) {
			await page.fill( '#user_login', 'admin' );
			await page.fill( '#user_pass', 'password' );
			await page.click( '#wp-submit' );
			await page.waitForURL( /wp-admin/ );
		}

		await context.storageState( { path: storageStatePath } );
	} finally {
		await browser.close();
	}
}

/**
 * @param {import('@playwright/test').FullConfig} config
 * @return {Promise<() => Promise<void>>}
 */
export default async function globalSetup( config ) {
	let startedTunnelInThisRun = false;

	if ( isLambdaTestRun() ) {
		console.log( '[e2e] Ensuring LambdaTest tunnel…' );
		const tunnelResult = await ensureTunnelRunning( {
			autoStart: isTunnelAutoStartEnabled(),
		} );
		startedTunnelInThisRun = tunnelResult.startedTunnelInThisRun;
	}

	try {
		console.log( '[e2e] Seeding editor preferences…' );
		seedEditorPreferences();
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
					runId: 'global-setup',
					hypothesisId: 'C',
					location: 'tests/e2e/global-setup.js:seed',
					message: 'editor_preferences_seeded',
					data: { ok: true },
					timestamp: Date.now(),
				} ),
			}
		).catch( () => {} );
		// #endregion
	} catch ( seedError ) {
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
					runId: 'global-setup',
					hypothesisId: 'C',
					location: 'tests/e2e/global-setup.js:seed',
					message: 'editor_preferences_seed_failed',
					data: {
						error:
							seedError instanceof Error
								? seedError.message
								: String( seedError ),
					},
					timestamp: Date.now(),
				} ),
			}
		).catch( () => {} );
		// #endregion
		throw seedError;
	}
	console.log( '[e2e] Authenticating admin (wp-scripts global setup)…' );
	await defaultGlobalSetup( configWithHostE2eBaseUrl( config ) );

	if ( isLambdaTestRun() ) {
		console.log(
			`[e2e] LambdaTest admin session (${ getLambdaTestPlaygroundBaseUrl() })…`
		);
		await ensureLambdaTestAdminSession( config );
	}

	return async () => {
		if ( startedTunnelInThisRun ) {
			console.log( '[e2e] Stopping LambdaTest tunnel started by this run…' );
			stopLambdaTestTunnelContainer();
		}
	};
}
