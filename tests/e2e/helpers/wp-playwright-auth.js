/**
 * Playwright global-setup helpers for WordPress admin and REST API access.
 *
 * Discovers the REST root from the subsite `Link` header, logs in with the
 * wp-env admin user, reads a REST nonce from `admin-ajax.php`, and writes
 * `admin.json` containing `cookies`, `nonce`, and `rootURL` for
 * `@wordpress/e2e-test-utils-playwright` and editor tests.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, request } from '@playwright/test';
import { getPlaywrightBaseUrl } from './e2e-env.js';

const REST_API_LINK_PATTERN =
	/<([^>]+)>; rel="https:\/\/api\.w\.org\/"/;

const WINDOWS_REST_READY_TIMEOUT_MS = 120_000;
const DEFAULT_REST_READY_TIMEOUT_MS = 90_000;
const REST_READY_POLL_INTERVALS_MS = [ 1_000, 2_000, 3_000 ];
const WP_ADMIN_USER = { username: 'admin', password: 'password' };

/**
 * Assign `process.env.WP_BASE_URL` from `getPlaywrightBaseUrl()` and return it.
 *
 * @return {string} E2e department subsite URL (trailing slash).
 */
export function syncWpBaseUrlEnvironment() {
	const baseUrl = getPlaywrightBaseUrl();
	process.env.WP_BASE_URL = baseUrl;
	return baseUrl;
}

/**
 * Resolve the REST API root URL via a `HEAD` request to the subsite home page.
 *
 * @param {import('@playwright/test').APIRequestContext} requestContext HTTP client with subsite `baseURL`.
 * @return {Promise<string|null>} URL from the `rel="https://api.w.org/"` link relation, or null.
 */
async function discoverRestRootUrl( requestContext ) {
	const headResponse = await requestContext.head( '.', {
		failOnStatusCode: false,
	} );
	const linkHeader = headResponse.headers().link;
	const restMatch = linkHeader?.match( REST_API_LINK_PATTERN );
	return restMatch ? restMatch[ 1 ] : null;
}

/**
 * Submit wp-env admin credentials to `wp-login.php` with redirects disabled.
 *
 * Session cookies are applied to `requestContext` on a 200 or 302 response.
 *
 * @param {import('@playwright/test').APIRequestContext} requestContext HTTP client for the subsite.
 * @return {Promise<boolean>} Whether login returned HTTP 200 or 302.
 */
async function loginWithoutFollowingWpAdmin( requestContext ) {
	const loginResponse = await requestContext.post( 'wp-login.php', {
		failOnStatusCode: false,
		maxRedirects: 0,
		form: {
			log: WP_ADMIN_USER.username,
			pwd: WP_ADMIN_USER.password,
		},
	} );

	const status = loginResponse.status();
	await loginResponse.dispose();

	return status === 200 || status === 302;
}

/**
 * Load the REST nonce from `wp-admin/admin-ajax.php?action=rest-nonce`.
 *
 * @param {import('@playwright/test').APIRequestContext} requestContext HTTP client with an authenticated cookie jar.
 * @return {Promise<string|null>} Nonce string, or null when the body is empty, HTML, or non-OK status.
 */
async function fetchRestNonce( requestContext ) {
	const nonceResponse = await requestContext.get(
		'wp-admin/admin-ajax.php?action=rest-nonce',
		{ failOnStatusCode: false }
	);
	const nonce = ( await nonceResponse.text() ).trim();

	if ( ! nonceResponse.ok() || ! nonce || nonce.includes( '<' ) ) {
		return null;
	}

	return nonce;
}

/**
 * Discover REST root, log in, and read a REST nonce in a single attempt.
 *
 * @param {import('@playwright/test').APIRequestContext} requestContext HTTP client for the subsite.
 * @return {Promise<{ rootURL: string, nonce: string }|null>} REST root and nonce on success; null if any step fails.
 */
async function authenticateForRest( requestContext ) {
	const rootURL = await discoverRestRootUrl( requestContext );
	if ( ! rootURL ) {
		return null;
	}

	if ( ! ( await loginWithoutFollowingWpAdmin( requestContext ) ) ) {
		return null;
	}

	const nonce = await fetchRestNonce( requestContext );
	if ( ! nonce ) {
		return null;
	}

	return { rootURL, nonce };
}

/**
 * Retry {@link authenticateForRest} until it succeeds or the poll times out.
 *
 * @param {string} baseURL Subsite base URL passed to `request.newContext`.
 * @param {number} timeoutMs Maximum time to keep polling (each HTTP call capped at 90s).
 * @return {Promise<void>}
 * @throws {Error} Poll exhausted; message includes the last failure detail.
 */
export async function waitForWordPressRestAuthReady( baseURL, timeoutMs ) {
	const requestTimeoutMs = Math.min( timeoutMs, 90_000 );
	const requestContext = await request.newContext( {
		baseURL,
		timeout: requestTimeoutMs,
	} );
	let lastStatus = 'starting';

	try {
		await expect
			.poll(
				async () => {
					try {
						const auth = await authenticateForRest( requestContext );
						if ( ! auth ) {
							lastStatus = 'REST discovery, login, or rest-nonce not ready';
							return false;
						}
						return true;
					} catch ( error ) {
						lastStatus =
							error instanceof Error
								? error.message
								: String( error );
						return false;
					}
				},
				{
					timeout: timeoutMs,
					intervals: REST_READY_POLL_INTERVALS_MS,
				}
			)
			.toBe( true );
	} catch ( pollError ) {
		throw new Error(
			`WordPress REST auth not ready at ${ baseURL } within ${ timeoutMs }ms. ` +
				`Last status: ${ lastStatus }. ` +
				'Ensure wp-env is up (`npm run env:e2e:start`) and wait for ' +
				`'[e2e] wp-env e2e ready' before npm run test:e2e:visual. ` +
				`Original: ${
					pollError instanceof Error
						? pollError.message
						: String( pollError )
				}`
		);
	} finally {
		await requestContext.dispose();
	}
}

/**
 * Authenticate and write the admin storage-state JSON file for Playwright projects.
 *
 * File contents: `{ cookies, nonce, rootURL }` at `projects[0].use.storageState`.
 *
 * @param {import('@playwright/test').FullConfig} config Playwright config (first project's `use` fields).
 * @param {number} requestTimeoutMs HTTP timeout for the API request context (milliseconds).
 * @return {Promise<void>}
 * @throws {Error} Missing `storageState` path, or {@link authenticateForRest} returned null.
 */
async function persistWordPressAdminStorageState( config, requestTimeoutMs ) {
	const { storageState, baseURL } = config.projects[ 0 ].use;
	const storageStatePath =
		typeof storageState === 'string' ? storageState : undefined;

	if ( ! storageStatePath ) {
		throw new Error(
			'Playwright project use.storageState must be a file path for e2e admin auth.'
		);
	}

	const requestContext = await request.newContext( {
		baseURL,
		timeout: requestTimeoutMs,
	} );

	try {
		const auth = await authenticateForRest( requestContext );
		if ( ! auth ) {
			throw new Error(
				'Failed to authenticate for REST after readiness poll succeeded.'
			);
		}

		const { cookies } = await requestContext.storageState();
		const state = {
			cookies,
			nonce: auth.nonce,
			rootURL: auth.rootURL,
		};

		await mkdir( path.dirname( storageStatePath ), { recursive: true } );
		await writeFile( storageStatePath, JSON.stringify( state ), 'utf-8' );
	} finally {
		await requestContext.dispose();
	}
}

/**
 * Playwright `globalSetup` hook: sync `WP_BASE_URL`, wait for REST auth, write admin storage state.
 *
 * Poll timeout is 120s on Windows and 90s elsewhere.
 *
 * @param {import('@playwright/test').FullConfig} config Playwright configuration from `playwright.config.js`.
 * @param {(config: import('@playwright/test').FullConfig) => import('@playwright/test').FullConfig} mapConfig Transforms config (e.g. host subsite `baseURL`) before persisting storage state.
 * @return {Promise<void>}
 */
export async function runWordPressPlaywrightGlobalSetup( config, mapConfig ) {
	const baseURL = syncWpBaseUrlEnvironment();
	const timeoutMs =
		process.platform === 'win32'
			? WINDOWS_REST_READY_TIMEOUT_MS
			: DEFAULT_REST_READY_TIMEOUT_MS;
	const requestTimeoutMs = Math.min( timeoutMs, 90_000 );

	console.log(
		`[e2e] Waiting for WordPress REST auth at ${ baseURL } (timeout ${ timeoutMs }ms)…`
	);
	await waitForWordPressRestAuthReady( baseURL, timeoutMs );

	console.log( '[e2e] Saving admin storage state for Playwright…' );
	await persistWordPressAdminStorageState(
		mapConfig( config ),
		requestTimeoutMs
	);
}
