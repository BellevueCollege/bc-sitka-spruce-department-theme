import http from 'node:http';
import { getE2ePort, getHostE2eBaseUrl } from './e2e-env.js';
import { getLambdaTestPlaygroundBaseUrl } from './lambdatest.js';

const MAX_PROXY_DEBUG_LOGS = 15;
const REQUEST_HEADER_SKIP = new Set( [ 'host', 'content-length', 'connection' ] );
const RESPONSE_HEADER_SKIP = new Set( [
	'transfer-encoding',
	'content-length',
	'connection',
] );

let proxyLogCount = 0;

/**
 * Proxy LambdaTest browser requests to wp-env on the host loopback address.
 *
 * The tunnel often fails to reach host.docker.internal reliably; local HTTP works.
 *
 * @param {import('@playwright/test').Page} page
 * @return {Promise<void>}
 */
export async function installLambdaTestTunnelProxy( page ) {
	const port = getE2ePort();
	const tunnelOrigin = getLambdaTestPlaygroundBaseUrl();
	const loopbackOrigin = `http://127.0.0.1:${ port }`;
	const localhostOrigin = `http://localhost:${ port }`;

	await page.route( `${ tunnelOrigin }/**`, ( route ) =>
		fulfillFromHostWordPress( route, tunnelOrigin )
	);
	await page.route( `${ loopbackOrigin }/**`, ( route ) =>
		fulfillFromHostWordPress( route, tunnelOrigin )
	);
	await page.route( `${ localhostOrigin }/**`, ( route ) =>
		fulfillFromHostWordPress( route, tunnelOrigin )
	);
}

/**
 * @param {import('@playwright/test').Route} route
 * @param {string} tunnelOrigin
 * @return {Promise<void>}
 */
async function fulfillFromHostWordPress( route, tunnelOrigin ) {
	const request = route.request();
	const target = new URL( request.url() );
	const tunnelHost = new URL( tunnelOrigin ).host;

	try {
		const upstream = await requestHostWordPress( {
			method: request.method(),
			path: `${ target.pathname }${ target.search }`,
			headers: buildUpstreamHeaders( request.headers(), tunnelHost ),
			body: request.postDataBuffer(),
		} );
		logProxiedResponse( request.url(), upstream.status );
		await route.fulfill( {
			status: upstream.status,
			headers: upstream.headers,
			body: upstream.body,
		} );
	} catch ( error ) {
		logProxiedResponse( request.url(), 0, error );
		await route.abort();
	}
}

/**
 * @param {Record<string, string>} incoming
 * @param {string} tunnelHost
 * @return {Record<string, string>}
 */
function buildUpstreamHeaders( incoming, tunnelHost ) {
	/** @type {Record<string, string>} */
	const headers = { host: tunnelHost };

	for ( const [ name, value ] of Object.entries( incoming ) ) {
		if ( REQUEST_HEADER_SKIP.has( name.toLowerCase() ) ) {
			continue;
		}
		headers[ name ] = value;
	}

	return headers;
}

/**
 * @param {{ method: string, path: string, headers: Record<string, string>, body: Buffer | null }} request
 * @return {Promise<{ status: number, headers: Record<string, string>, body: Buffer }>}
 */
function requestHostWordPress( request ) {
	const hostUrl = new URL( getHostE2eBaseUrl() );

	return new Promise( ( resolve, reject ) => {
		const upstream = http.request(
			{
				hostname: hostUrl.hostname,
				port: hostUrl.port,
				path: request.path,
				method: request.method,
				headers: request.headers,
			},
			( response ) => {
				const chunks = [];
				response.on( 'data', ( chunk ) => chunks.push( chunk ) );
				response.on( 'end', () => {
					resolve( {
						status: response.statusCode || 500,
						headers: toFulfillHeaders( response.headers ),
						body: Buffer.concat( chunks ),
					} );
				} );
			}
		);

		upstream.on( 'error', reject );
		if ( request.body && request.method !== 'GET' && request.method !== 'HEAD' ) {
			upstream.write( request.body );
		}
		upstream.end();
	} );
}

/**
 * @param {import('node:http').IncomingHttpHeaders} rawHeaders
 * @return {Record<string, string>}
 */
function toFulfillHeaders( rawHeaders ) {
	/** @type {Record<string, string>} */
	const headers = {};

	for ( const [ name, value ] of Object.entries( rawHeaders ) ) {
		if ( value === undefined || RESPONSE_HEADER_SKIP.has( name.toLowerCase() ) ) {
			continue;
		}

		const separator = name.toLowerCase() === 'set-cookie' ? '\n' : ', ';
		headers[ name ] = Array.isArray( value ) ? value.join( separator ) : value;
	}

	return headers;
}

/**
 * @param {string} url
 * @param {number} status
 * @param {unknown} [error]
 */
function logProxiedResponse( url, status, error ) {
	const isFailure = status === 0 || status >= 400;
	if ( proxyLogCount >= MAX_PROXY_DEBUG_LOGS ) {
		return;
	}

	proxyLogCount += 1;

	// #region agent log
	fetch( 'http://127.0.0.1:7318/ingest/2d137c06-c08e-496e-837b-46890e3b1347', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Debug-Session-Id': 'c90b84',
		},
		body: JSON.stringify( {
			sessionId: 'c90b84',
			runId: 'visual-suite',
			hypothesisId: 'D',
			location: 'tests/e2e/helpers/lambdatest-tunnel-proxy.js',
			message: isFailure ? 'tunnel_proxy_failed' : 'tunnel_proxy_ok',
			data: {
				status,
				url,
				error: error instanceof Error ? error.message : '',
			},
			timestamp: Date.now(),
		} ),
	} ).catch( () => {} );
	// #endregion
}
