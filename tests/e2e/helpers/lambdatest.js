/**
 * LambdaTest Playwright grid connection helpers.
 *
 * Cloud browsers reach local wp-env through a LambdaTest tunnel. When
 * tunnel: true is set, the remote browser treats http://localhost:8889
 * as the developer machine running wp-env.
 */

/** Default tunnel name; override with LT_TUNNEL_NAME when running multiple tunnels. */
export const LT_TUNNEL_NAME = process.env.LT_TUNNEL_NAME || 'sitka-e2e';

/**
 * Build the WebSocket endpoint for LambdaTest Playwright CDP connection.
 *
 * Environment variables:
 * - LT_USERNAME: LambdaTest account email
 * - LT_ACCESS_KEY: LambdaTest access key
 * - LT_TUNNEL_NAME: optional named tunnel (default sitka-e2e)
 * - LT_BUILD: optional build label shown in the LambdaTest dashboard
 *
 * @return {string} wss:// endpoint with encoded browser capabilities
 * @throws {Error} When LT_USERNAME or LT_ACCESS_KEY is missing
 */
export function getLambdaTestWsEndpoint() {
	const username = process.env.LT_USERNAME;
	const accessKey = process.env.LT_ACCESS_KEY;

	if ( ! username || ! accessKey ) {
		throw new Error(
			'LT_USERNAME and LT_ACCESS_KEY must be set for LambdaTest Playwright runs.'
		);
	}

	const capabilities = {
		browserName: 'Chrome',
		browserVersion: 'latest',
		'LT:Options': {
			platform: 'Windows 10',
			project: 'Sitka',
			build: process.env.LT_BUILD || 'Playwright VRT',
			tunnel: true,
			tunnelName: LT_TUNNEL_NAME,
			user: username,
			accessKey,
		},
	};

	return `wss://cdp.lambdatest.com/playwright?capabilities=${ encodeURIComponent(
		JSON.stringify( capabilities )
	) }`;
}
