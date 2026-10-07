/**
 * Playwright global setup: verify LambdaTest tunnel, seed e2e state, authenticate.
 */
import { chromium } from '@playwright/test';
import defaultGlobalSetup from '@wordpress/scripts/config/playwright/global-setup.js';
import {
	ensureTunnelRunning,
	getLambdaTestPlaygroundBaseUrl,
	isLambdaTestRun,
	isTunnelAutoStartEnabled,
	stopLambdaTestTunnelContainer,
} from './helpers/lambdatest.js';
import { getPlaywrightBaseUrl } from './helpers/e2e-env.js';

/**
 * @param {import('@playwright/test').FullConfig} config
 * @return {import('@playwright/test').FullConfig}
 */
function configWithHostE2eBaseUrl( config ) {
	const hostE2eUrl = getPlaywrightBaseUrl();

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

	const tunnelBaseUrl = getLambdaTestPlaygroundBaseUrl();
	const hostBaseUrl = getPlaywrightBaseUrl();
	// Host Chrome cannot resolve host.docker.internal; log in on loopback, then remap cookies.
	const browser = await chromium.launch( { channel: 'chrome' } );

	try {
		const context = await browser.newContext( { baseURL: hostBaseUrl } );
		const page = await context.newPage();

		await page.goto( 'wp-admin/', {
			waitUntil: 'domcontentloaded',
		} );

		const bodyText = await page.locator( 'body' ).innerText().catch( () => '' );
		if ( bodyText.includes( '[::1]' ) || bodyText.includes( 'connection refused' ) ) {
			throw new Error(
				'LambdaTest tunnel could not reach WordPress. On macOS/Podman, base URL must be ' +
					`${ tunnelBaseUrl } (not 127.0.0.1). Restart wp-env and the e2e-tunnel container.`
			);
		}

		if ( page.url().includes( 'wp-login.php' ) ) {
			await page.fill( '#user_login', 'admin' );
			await page.fill( '#user_pass', 'password' );
			await page.click( '#wp-submit' );
			await page.waitForURL( /wp-admin/ );
		}

		const storageState = await context.storageState();
		const tunnelHost = new URL( tunnelBaseUrl ).hostname;
		const loopbackHost = new URL( hostBaseUrl ).hostname;

		for ( const cookie of storageState.cookies ) {
			cookie.domain = cookie.domain.replace( loopbackHost, tunnelHost );
		}

		for ( const origin of storageState.origins ?? [] ) {
			origin.origin = origin.origin.replace( loopbackHost, tunnelHost );
		}

		const fs = await import( 'node:fs' );
		fs.writeFileSync( storageStatePath, JSON.stringify( storageState, null, 2 ) );
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
