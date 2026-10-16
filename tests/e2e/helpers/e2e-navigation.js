import { getHostE2eBaseUrl, getMainSiteBaseUrl } from './e2e-env.js';
import {
	getLambdaTestPlaygroundBaseUrl,
	isLambdaTestRun,
} from './lambdatest.js';

/**
 * @param {string} url
 * @param {string} fromOrigin
 * @param {string} toOrigin
 * @return {string}
 */
function replaceUrlOrigin( url, fromOrigin, toOrigin ) {
	if ( ! url.startsWith( fromOrigin ) ) {
		return url;
	}

	return `${ toOrigin }${ url.slice( fromOrigin.length ) }`;
}

/**
 * Rewrite loopback permalinks from WP-CLI seeds for LambdaTest navigation.
 *
 * @param {string} url Absolute URL from a seed script or publish panel.
 * @return {string}
 */
export function normalizeE2eUrlForPlaywright( url ) {
	if ( ! isLambdaTestRun() || ! url ) {
		return url;
	}

	const tunnelSubsite = getLambdaTestPlaygroundBaseUrl().replace( /\/$/, '' );
	const loopbackSubsite = getHostE2eBaseUrl();
	const loopbackLocalhostSubsite = loopbackSubsite.replace(
		'127.0.0.1',
		'localhost'
	);

	const tunnelOrigin = new URL( tunnelSubsite ).origin;
	const loopbackOrigin = getMainSiteBaseUrl();
	const loopbackLocalhostOrigin = loopbackOrigin.replace(
		'127.0.0.1',
		'localhost'
	);

	let normalized = url;
	normalized = replaceUrlOrigin( normalized, loopbackSubsite, tunnelSubsite );
	normalized = replaceUrlOrigin(
		normalized,
		loopbackLocalhostSubsite,
		tunnelSubsite
	);
	normalized = replaceUrlOrigin( normalized, loopbackOrigin, tunnelOrigin );
	normalized = replaceUrlOrigin(
		normalized,
		loopbackLocalhostOrigin,
		tunnelOrigin
	);

	return normalized.replace( /([^:]\/)\/+/g, '$1' );
}
