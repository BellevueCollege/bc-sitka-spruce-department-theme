/** WordPress wp-env e2e port (must match `.wp-env.e2e.json` and the e2e mu-plugin). */
export const E2E_WP_PORT = 8889;

export const WP_ENV_E2E_CONFIG = '.wp-env.e2e.json';

/** Playwright webServer waits for this line in start-wp-env-e2e.mjs stdout. */
export const WP_ENV_E2E_READY_LOG = '[e2e] wp-env e2e ready';

/** Department subsite slug in the e2e multisite network. */
export const E2E_SUBSITE_SLUG = 'e2e-dept';

/**
 * Network main site base URL (blog 1, no path).
 *
 * @return {string}
 */
export function getMainSiteBaseUrl() {
	if ( process.env.WP_BASE_URL ) {
		try {
			const parsed = new URL( process.env.WP_BASE_URL );
			const port = parsed.port || String( E2E_WP_PORT );
			return `${ parsed.protocol }//${ parsed.hostname }:${ port }`;
		} catch {
			// fall through
		}
	}

	return `http://127.0.0.1:${ E2E_WP_PORT }`;
}

/**
 * Sitka department subsite base URL (Playwright default).
 *
 * @return {string}
 */
export function getSubsiteBaseUrl() {
	return `${ getMainSiteBaseUrl() }/${ E2E_SUBSITE_SLUG }`;
}

/**
 * Base URL for host-side Playwright runs and WP-CLI seeding on the subsite.
 *
 * @return {string}
 */
export function getHostE2eBaseUrl() {
	if ( process.env.WP_BASE_URL ) {
		return process.env.WP_BASE_URL.replace( /\/$/, '' );
	}

	return getSubsiteBaseUrl();
}

/**
 * Playwright baseURL must end with `/` so relative paths stay on the subsite.
 *
 * @return {string}
 */
export function getPlaywrightBaseUrl() {
	return `${ getHostE2eBaseUrl() }/`;
}

/**
 * Resolve a path relative to the e2e subsite (optionally under another origin).
 *
 * @param {string} relativePath Path without a leading slash (e.g. `wp-admin/`).
 * @param {string} [originOverride] Optional origin (LambdaTest tunnel host).
 * @return {string}
 */
export function resolveSubsiteUrl( relativePath, originOverride ) {
	const resolved = new URL( relativePath, getPlaywrightBaseUrl() );

	if ( originOverride ) {
		const overrideOrigin = new URL( originOverride );
		resolved.protocol = overrideOrigin.protocol;
		resolved.hostname = overrideOrigin.hostname;
		resolved.port = overrideOrigin.port;
	}

	return resolved.href;
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
