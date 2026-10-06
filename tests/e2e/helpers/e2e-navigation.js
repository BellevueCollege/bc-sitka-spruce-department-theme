import { getE2ePort } from './e2e-env.js';
import {
	getLambdaTestPlaygroundBaseUrl,
	isLambdaTestRun,
} from './lambdatest.js';

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

	const port = getE2ePort();
	const tunnelBase = getLambdaTestPlaygroundBaseUrl();
	const loopback = `http://127.0.0.1:${ port }`;
	const localhost = `http://localhost:${ port }`;

	const normalized = url
		.replace( loopback, tunnelBase )
		.replace( localhost, tunnelBase );

	if ( normalized !== url ) {
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
					hypothesisId: 'E',
					location: 'tests/e2e/helpers/e2e-navigation.js',
					message: 'normalized_loopback_navigation_url',
					data: { from: url, to: normalized },
					timestamp: Date.now(),
				} ),
			}
		).catch( () => {} );
		// #endregion
	}

	return normalized;
}
