/** WordPress wp-env e2e port (must match `.wp-env.e2e.json` and the e2e mu-plugin). */
export const E2E_WP_PORT = 8889;

export const WP_ENV_E2E_CONFIG = '.wp-env.e2e.json';

/**
 * Base URL for host-side Playwright runs and WP-CLI seeding.
 *
 * @return {string}
 */
export function getHostE2eBaseUrl() {
	if ( process.env.WP_BASE_URL ) {
		return process.env.WP_BASE_URL.replace( /\/$/, '' );
	}

	return `http://127.0.0.1:${ E2E_WP_PORT }`;
}

/**
 * Port parsed from WP_BASE_URL when set.
 *
 * @return {number}
 */
export function getE2ePort() {
	if ( process.env.WP_BASE_URL ) {
		try {
			const port = new URL( process.env.WP_BASE_URL ).port;
			if ( port ) {
				return Number.parseInt( port, 10 );
			}
		} catch {
			// keep default port
		}
	}

	return E2E_WP_PORT;
}
