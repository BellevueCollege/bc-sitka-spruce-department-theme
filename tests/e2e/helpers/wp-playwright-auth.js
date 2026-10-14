/**
 * WordPress admin auth for Playwright global setup (@wordpress/scripts default).
 *
 * wp-env on Windows/Docker Desktop can accept HTTP before admin-ajax REST nonce
 * and Link headers are stable. The upstream setupRest poll is only 60s and logs
 * little when login succeeds but REST discovery or rest-nonce keeps failing.
 */
import { expect, request } from '@playwright/test';
import { getPlaywrightBaseUrl } from './e2e-env.js';

const REST_API_LINK_PATTERN =
	/<([^>]+)>; rel="https:\/\/api\.w\.org\/"/;

const WINDOWS_REST_READY_TIMEOUT_MS = 120_000;
const DEFAULT_REST_READY_TIMEOUT_MS = 90_000;
const REST_READY_POLL_INTERVALS_MS = [ 1_000, 2_000, 3_000 ];

/**
 * Keep @wordpress/e2e-test-utils-playwright config in sync with Playwright baseURL.
 *
 * That package reads `process.env.WP_BASE_URL` once at first import; set it before
 * loading wp-scripts global setup.
 *
 * @return {string}
 */
export function syncWpBaseUrlEnvironment() {
	const baseUrl = getPlaywrightBaseUrl();
	process.env.WP_BASE_URL = baseUrl;
	return baseUrl;
}

/**
 * Poll until subsite HEAD exposes the REST Link header and rest-nonce works after login.
 *
 * @param {string} baseURL Playwright subsite base URL (trailing slash).
 * @param {number} timeoutMs
 * @return {Promise<void>}
 */
export async function waitForWordPressRestAuthReady( baseURL, timeoutMs ) {
	const requestContext = await request.newContext( { baseURL } );
	let lastStatus = 'starting';

	try {
		await expect
			.poll(
				async () => {
					try {
						const headResponse = await requestContext.head( '.', {
							failOnStatusCode: false,
						} );
						const linkHeader = headResponse.headers().link;
						const restMatch = linkHeader?.match( REST_API_LINK_PATTERN );

						if ( ! restMatch ) {
							lastStatus =
								`missing REST Link header (HTTP ${ headResponse.status() }, ` +
								`link: ${ linkHeader ?? 'none' })`;
							return false;
						}

						const loginResponse = await requestContext.post(
							'wp-login.php',
							{
								failOnStatusCode: false,
								form: {
									log: 'admin',
									pwd: 'password',
								},
							}
						);

						if (
							loginResponse.status() !== 200 &&
							loginResponse.status() !== 302
						) {
							lastStatus = `wp-login HTTP ${ loginResponse.status() }`;
							await loginResponse.dispose();
							return false;
						}
						await loginResponse.dispose();

						const nonceResponse = await requestContext.get(
							'wp-admin/admin-ajax.php?action=rest-nonce',
							{ failOnStatusCode: false }
						);
						const nonce = ( await nonceResponse.text() ).trim();

						if (
							! nonceResponse.ok() ||
							! nonce ||
							nonce.includes( '<' )
						) {
							lastStatus =
								`rest-nonce HTTP ${ nonceResponse.status() } ` +
								`(body starts: ${ nonce.slice( 0, 40 ) })`;
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
 * Run wp-scripts Playwright global setup after WordPress HTTP/REST is stable.
 *
 * @param {import('@playwright/test').FullConfig} config
 * @param {(config: import('@playwright/test').FullConfig) => import('@playwright/test').FullConfig} mapConfig
 * @return {Promise<void>}
 */
export async function runWordPressPlaywrightGlobalSetup( config, mapConfig ) {
	const baseURL = syncWpBaseUrlEnvironment();
	const timeoutMs =
		process.platform === 'win32'
			? WINDOWS_REST_READY_TIMEOUT_MS
			: DEFAULT_REST_READY_TIMEOUT_MS;

	console.log(
		`[e2e] Waiting for WordPress REST auth at ${ baseURL } (timeout ${ timeoutMs }ms)…`
	);
	await waitForWordPressRestAuthReady( baseURL, timeoutMs );

	const { default: defaultGlobalSetup } = await import(
		'@wordpress/scripts/config/playwright/global-setup.js'
	);

	await defaultGlobalSetup( mapConfig( config ) );
}
