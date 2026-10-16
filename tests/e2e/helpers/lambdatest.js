import { spawnSync } from 'node:child_process';
import { getE2ePort, getSubsiteBaseUrl } from './e2e-env.js';

/** Default local tunnel name; CI overrides via E2E_LAMBDATEST_TUNNEL_NAME. */
const DEFAULT_LAMBDATEST_TUNNEL_NAME = 'e2e-tunnel-dev';
const MAX_TUNNEL_NAME_LENGTH = 64;

/**
 * Pinned LambdaTest Linux Chrome. Bump only when intentionally refreshing all @visual PNGs.
 * Discover via: node tests/e2e/scripts/print-lambdatest-chrome-version.mjs
 */
export const DEFAULT_LAMBDATEST_CHROME_VERSION = '154.0';
const DEFAULT_TUNNEL_INFO_PORT = 8000;
const TUNNEL_FETCH_TIMEOUT_MS = 5_000;
const TUNNEL_POLL_INTERVAL_MS = 1_000;
const TUNNEL_START_TIMEOUT_MS = 60_000;
const LAMBDATEST_TUNNEL_IMAGE = 'lambdatest/tunnel:latest';

/** Podman/Docker on macOS/Windows: tunnel must reach the host without IPv6 loopback. */
const LAMBDATEST_TUNNEL_HOST_ALIAS = 'host.docker.internal';

/**
 * Docker / LambdaTest-safe tunnel name (alphanumeric, underscore, period, hyphen).
 *
 * @param {string} rawName
 * @return {string}
 */
function sanitizeTunnelName( rawName ) {
	const sanitized = rawName
		.trim()
		.replace( /[^a-zA-Z0-9_.-]+/g, '-' )
		.replace( /^[^a-zA-Z0-9]+/, '' )
		.slice( 0, MAX_TUNNEL_NAME_LENGTH )
		.replace( /[^a-zA-Z0-9]+$/, '' );

	return sanitized || DEFAULT_LAMBDATEST_TUNNEL_NAME;
}

/**
 * Tunnel name for Docker container and LambdaTest capabilities.
 * Set E2E_LAMBDATEST_TUNNEL_NAME in CI (e.g. e2e-tunnel-ado-$(Build.BuildId)).
 *
 * @return {string}
 */
export function getLambdaTestTunnelName() {
	const fromEnv = process.env.E2E_LAMBDATEST_TUNNEL_NAME?.trim();
	if ( fromEnv ) {
		return sanitizeTunnelName( fromEnv );
	}

	return DEFAULT_LAMBDATEST_TUNNEL_NAME;
}

/**
 * Whether Playwright global setup should start the tunnel when it is missing.
 *
 * @return {boolean}
 */
export function isTunnelAutoStartEnabled() {
	return process.env.E2E_LAMBDATEST_TUNNEL_AUTO !== '0';
}

/**
 * argv for `docker run` (credentials via process env, not argv).
 *
 * @return {string[]}
 */
function getLambdaTestTunnelDockerRunArguments() {
	const infoPort = String(
		process.env.E2E_LAMBDATEST_TUNNEL_INFO_PORT || DEFAULT_TUNNEL_INFO_PORT
	);
	const tunnelName = getLambdaTestTunnelName();

	return [
		'run',
		'--rm',
		'-d',
		'--name',
		tunnelName,
		'-p',
		`${ infoPort }:${ infoPort }`,
		'--add-host',
		`${ LAMBDATEST_TUNNEL_HOST_ALIAS }:host-gateway`,
		'-e',
		'LT_USERNAME',
		'-e',
		'LT_ACCESS_KEY',
		LAMBDATEST_TUNNEL_IMAGE,
		'--tunnelName',
		tunnelName,
		'--infoAPIPort',
		infoPort,
	];
}

/**
 * Human-readable hint for logs (matches previous docker one-liner).
 *
 * @return {string}
 */
export function formatLambdaTestTunnelStartCommand() {
	return `docker ${ getLambdaTestTunnelDockerRunArguments().join( ' ' ) }`;
}

/**
 * Whether the current Playwright run targets LambdaTest visual browsers.
 *
 * @return {boolean}
 */
export function isLambdaTestRun() {
	return process.env.E2E_LAMBDATEST === '1';
}

/**
 * WordPress URL for LambdaTest browsers (via Docker/Podman tunnel).
 *
 * Tunnel clients map 127.0.0.1 to IPv6 [::1] inside the container; use the host
 * gateway alias instead. Host-side WP-CLI seeding keeps WP_BASE_URL on 127.0.0.1.
 *
 * @return {string}
 */
export function getLambdaTestPlaygroundBaseUrl() {
	if ( process.env.E2E_LAMBDATEST_PLAYGROUND_URL ) {
		return process.env.E2E_LAMBDATEST_PLAYGROUND_URL.replace( /\/$/, '' );
	}

	const subsiteUrl = getSubsiteBaseUrl();
	try {
		const parsed = new URL( subsiteUrl );
		const port = parsed.port || String( getE2ePort() );
		const path = parsed.pathname.replace( /\/$/, '' );
		const base = `http://${ LAMBDATEST_TUNNEL_HOST_ALIAS }:${ port }${ path }`;
		return base.endsWith( '/' ) ? base : `${ base }/`;
	} catch {
		const port = getE2ePort();
		return `http://${ LAMBDATEST_TUNNEL_HOST_ALIAS }:${ port }/`;
	}
}

/**
 * Playwright `browserType.connect` WebSocket endpoint for LambdaTest Linux Chrome.
 *
 * @return {string}
 */
export function getLambdaTestWsEndpoint() {
	const username = process.env.LT_USERNAME;
	const accessKey = process.env.LT_ACCESS_KEY;

	if ( ! username || ! accessKey ) {
		throw new Error(
			'LambdaTest visual tests require LT_USERNAME and LT_ACCESS_KEY.'
		);
	}

	// Web Automation on Desktop — Linux (org plan). Windows/macOS or pw-chromium
	// routes to a different desktop-automation pool and can 422 with exhausted minutes.
	const chromeVersion =
		process.env.E2E_LAMBDATEST_CHROME_VERSION?.trim() ||
		DEFAULT_LAMBDATEST_CHROME_VERSION;

	const capabilities = {
		browserName: 'Chrome',
		browserVersion: chromeVersion,
		'LT:Options': {
			platform: 'Linux',
			build: process.env.BUILD_ID || 'sitka-e2e-local',
			name: 'sitka-e2e-visual',
			user: username,
			accessKey,
			tunnel: true,
			tunnelName: getLambdaTestTunnelName(),
			video: false,
			console: true,
		},
	};

	return `wss://cdp.lambdatest.com/playwright?capabilities=${ encodeURIComponent(
		JSON.stringify( capabilities )
	) }`;
}

/**
 * Local tunnel Info API (see LambdaTest docker tunnel --infoAPIPort).
 *
 * @return {string}
 */
export function getLambdaTestTunnelInfoUrl() {
	const port =
		process.env.E2E_LAMBDATEST_TUNNEL_INFO_PORT || DEFAULT_TUNNEL_INFO_PORT;
	return `http://127.0.0.1:${ port }/api/v1.0/info`;
}

/**
 * @return {void}
 */
function assertLambdaTestCredentials() {
	const username = process.env.LT_USERNAME;
	const accessKey = process.env.LT_ACCESS_KEY;

	if ( ! username || ! accessKey ) {
		throw new Error(
			'LambdaTest visual tests require LT_USERNAME and LT_ACCESS_KEY.'
		);
	}
}

/**
 * @param {unknown} payload
 * @return {string|undefined}
 */
function readActiveTunnelNameFromPayload( payload ) {
	if ( ! payload || typeof payload !== 'object' ) {
		return undefined;
	}

	const record = payload;
	return (
		record.tunnel_name ||
		record.tunnelName ||
		record.data?.tunnel_name ||
		record.data?.tunnelName
	);
}

/**
 * @param {unknown} payload
 * @return {void}
 */
function assertExpectedTunnelName( payload ) {
	const tunnelName = getLambdaTestTunnelName();
	const activeTunnelName = readActiveTunnelNameFromPayload( payload );

	if (
		activeTunnelName &&
		activeTunnelName !== tunnelName &&
		typeof activeTunnelName === 'string'
	) {
		throw new Error(
			`LambdaTest tunnel "${ activeTunnelName }" is running, but visual tests expect "${ tunnelName }". ` +
				`Stop the other tunnel or restart with --tunnelName ${ tunnelName }.`
		);
	}
}

/**
 * Poll the local tunnel Info API once.
 *
 * @return {Promise<Response|null>}
 */
export async function pollTunnelInfoApi() {
	const infoUrl = getLambdaTestTunnelInfoUrl();

	try {
		const response = await fetch( infoUrl, {
			signal: AbortSignal.timeout( TUNNEL_FETCH_TIMEOUT_MS ),
		} );

		if ( ! response.ok ) {
			return null;
		}

		return response;
	} catch {
		return null;
	}
}

/**
 * Wait until the tunnel Info API responds successfully.
 *
 * @param {number} [timeoutMs]
 * @return {Promise<void>}
 */
export async function waitForTunnelInfoApi( timeoutMs = TUNNEL_START_TIMEOUT_MS ) {
	const deadline = Date.now() + timeoutMs;

	while ( Date.now() < deadline ) {
		const response = await pollTunnelInfoApi();

		if ( response ) {
			const payload = await response.json();
			assertExpectedTunnelName( payload );
			return;
		}

		await new Promise( ( resolve ) =>
			setTimeout( resolve, TUNNEL_POLL_INTERVAL_MS )
		);
	}

	const tunnelName = getLambdaTestTunnelName();
	throw new Error(
		`LambdaTest tunnel did not become ready within ${ timeoutMs }ms. ` +
			`Check container logs: docker logs ${ tunnelName }`
	);
}

/**
 * Start the LambdaTest tunnel Docker container.
 *
 * @return {void}
 */
export function startLambdaTestTunnelContainer() {
	assertLambdaTestCredentials();

	const tunnelName = getLambdaTestTunnelName();

	spawnSync( 'docker', [ 'rm', '-f', tunnelName ], {
		stdio: 'ignore',
	} );

	const startResult = spawnSync(
		'docker',
		getLambdaTestTunnelDockerRunArguments(),
		{
			stdio: 'inherit',
			env: process.env,
		}
	);

	if ( startResult.status !== 0 ) {
		throw new Error(
			`Failed to start LambdaTest tunnel container "${ tunnelName }". ` +
				`Ensure Docker or Podman is running and LT_USERNAME/LT_ACCESS_KEY are set.`
		);
	}
}

/**
 * Stop and remove the LambdaTest tunnel container.
 *
 * @return {void}
 */
export function stopLambdaTestTunnelContainer() {
	spawnSync( 'docker', [ 'rm', '-f', getLambdaTestTunnelName() ], {
		stdio: 'inherit',
	} );
}

/**
 * Ensure the named LambdaTest tunnel is reachable on this machine.
 *
 * @param {{ autoStart?: boolean }} [options]
 * @return {Promise<{ startedTunnelInThisRun: boolean }>}
 */
export async function ensureTunnelRunning( options = {} ) {
	const autoStart = options.autoStart ?? false;
	assertLambdaTestCredentials();

	const infoUrl = getLambdaTestTunnelInfoUrl();
	const tunnelName = getLambdaTestTunnelName();
	const existingResponse = await pollTunnelInfoApi();

	if ( existingResponse ) {
		const payload = await existingResponse.json();
		assertExpectedTunnelName( payload );
		return { startedTunnelInThisRun: false };
	}

	if ( autoStart ) {
		startLambdaTestTunnelContainer();
		await waitForTunnelInfoApi();
		return { startedTunnelInThisRun: true };
	}

	throw new Error(
		`Could not reach the LambdaTest tunnel Info API at ${ infoUrl }. ` +
			`Export LT_USERNAME and LT_ACCESS_KEY, then start a tunnel named "${ tunnelName }":\n` +
			`${ formatLambdaTestTunnelStartCommand() }\n` +
			`Or run: npm run tunnel:e2e:start\n` +
			`(Podman aliased to docker is fine. Visual runs still need HTTPS to *.lambdatest.com.)`
	);
}
