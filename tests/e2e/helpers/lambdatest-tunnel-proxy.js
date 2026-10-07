import http from 'node:http';
import { setTimeout as delay } from 'node:timers/promises';
import {
	E2E_SUBSITE_SLUG,
	getE2ePort,
	getHostE2eBaseUrl,
	getMainSiteBaseUrl,
} from './e2e-env.js';
import { getLambdaTestPlaygroundBaseUrl } from './lambdatest.js';

const LAMBDATEST_TUNNEL_HOST_ALIAS = 'host.docker.internal';

const THEME_FAVICON_PATH =
	'/wp-content/themes/bc-sitka-spruce-department-theme/assets/favicons/favicon.ico';

const REQUEST_HEADER_SKIP = new Set( [ 'host', 'content-length', 'connection' ] );
const RESPONSE_HEADER_SKIP = new Set( [
	'transfer-encoding',
	'content-length',
	'connection',
] );

/**
 * Proxy LambdaTest browser requests to wp-env on the host loopback address.
 *
 * The tunnel often fails to reach host.docker.internal reliably; local HTTP works.
 *
 * @param {import('@playwright/test').Page | import('@playwright/test').BrowserContext} routingTarget
 * @return {Promise<void>}
 */
/**
 * Match wp-env HTTP(S) on the e2e port (subsite root and nested paths).
 *
 * Glob patterns like `${ subsiteBase }/**` miss the subsite front URL when the
 * base already ends with `/`, and the tunnel then serves `dial tcp [::1]:8889`.
 *
 * @param {string} url
 * @return {boolean}
 */
function shouldProxyE2eRequest( url ) {
	try {
		const parsed = new URL( url );
		const port = String( getE2ePort() );
		const hostMatches =
			parsed.hostname === '127.0.0.1' ||
			parsed.hostname === 'localhost' ||
			parsed.hostname === LAMBDATEST_TUNNEL_HOST_ALIAS;

		return hostMatches && parsed.port === port;
	} catch {
		return false;
	}
}

export async function installLambdaTestTunnelProxy( routingTarget ) {
	const tunnelOrigin = getLambdaTestPlaygroundBaseUrl();

	await routingTarget.route( shouldProxyE2eRequest, ( route ) =>
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

	if ( target.searchParams.get( 'meta-box-loader' ) === '1' ) {
		await route.fulfill( {
			status: 200,
			contentType: 'text/html; charset=UTF-8',
			body: '',
		} );
		return;
	}

	const faviconUpstreamPath = resolveFaviconUpstreamPath( target.pathname );
	const upstreamPath = faviconUpstreamPath
		? `${ faviconUpstreamPath }${ target.search }`
		: `${ target.pathname }${ target.search }`;

	try {
		const upstream = await requestHostWordPressWithRetry( {
			method: request.method(),
			path: upstreamPath,
			headers: buildUpstreamHeaders( request.headers(), tunnelHost ),
			body: request.postDataBuffer(),
		} );

		const responseHeaders = rewriteProxiedResponseHeaders(
			upstream.headers,
			tunnelOrigin
		);
		if (
			upstream.status === 403 &&
			isEditorTaxonomyPrefetchRequest( target )
		) {
			const slug = target.pathname.split( '/' ).pop() ?? 'category';
			await route.fulfill( {
				status: 200,
				contentType: 'application/json; charset=UTF-8',
				body: buildTaxonomyPrefetchStub( slug ),
			} );
			return;
		}

		const responseBody = rewriteProxiedResponseBody(
			upstream.body,
			responseHeaders
		);
		await route.fulfill( {
			status: upstream.status,
			headers: responseHeaders,
			body: responseBody,
		} );
	} catch ( error ) {
		await route.abort();
	}
}

/**
 * @param {URL} target
 * @return {boolean}
 */
function isEditorTaxonomyPrefetchRequest( target ) {
	return (
		target.pathname.includes( '/wp-json/wp/v2/taxonomies/' ) &&
		target.searchParams.get( 'context' ) === 'edit'
	);
}

/**
 * @param {string} slug
 * @return {string}
 */
function buildTaxonomyPrefetchStub( slug ) {
	return JSON.stringify( {
		slug,
		name: slug,
		rest_base: slug,
		types: [ 'post' ],
		visibility: { show_ui: true },
	} );
}

/**
 * @param {string} value
 * @return {string}
 */
function rewriteLoopbackHostsInText( value ) {
	const port = String( getE2ePort() );
	const tunnelRoot = `http://${ LAMBDATEST_TUNNEL_HOST_ALIAS }:${ port }`;

	return value
		.replaceAll( `http://127.0.0.1:${ port }`, tunnelRoot )
		.replaceAll( `http://localhost:${ port }`, tunnelRoot )
		.replaceAll( `127.0.0.1%3A${ port }`, `${ LAMBDATEST_TUNNEL_HOST_ALIAS }%3A${ port }` )
		.replaceAll( `localhost%3A${ port }`, `${ LAMBDATEST_TUNNEL_HOST_ALIAS }%3A${ port }` );
}

/**
 * @param {Buffer} body
 * @param {Record<string, string>} headers
 * @return {Buffer}
 */
function rewriteProxiedResponseBody( body, headers ) {
	const contentType = getHeaderValue( headers, 'content-type' );
	if ( ! shouldRewriteResponseBody( contentType ) ) {
		return body;
	}

	if ( getHeaderValue( headers, 'content-encoding' ) ) {
		return body;
	}

	return Buffer.from( rewriteLoopbackHostsInText( body.toString( 'utf8' ) ), 'utf8' );
}

/**
 * @param {string | undefined} contentType
 * @return {boolean}
 */
function shouldRewriteResponseBody( contentType ) {
	if ( ! contentType ) {
		return false;
	}

	const normalized = contentType.toLowerCase();

	return (
		normalized.includes( 'text/html' ) ||
		normalized.includes( 'application/json' ) ||
		normalized.includes( 'javascript' ) ||
		normalized.includes( 'text/css' ) ||
		normalized.includes( 'application/xml' ) ||
		normalized.includes( 'text/xml' )
	);
}

/**
 * @param {Record<string, string>} headers
 * @param {string} name
 * @return {string}
 */
function getHeaderValue( headers, name ) {
	const direct = headers[ name ];
	if ( typeof direct === 'string' ) {
		return direct;
	}

	const match = Object.entries( headers ).find(
		( [ headerName ] ) => headerName.toLowerCase() === name
	);

	return match ? match[ 1 ] : '';
}

/**
 * @param {Record<string, string>} headers
 * @param {string} tunnelOrigin
 * @return {Record<string, string>}
 */
function rewriteProxiedResponseHeaders( headers, tunnelOrigin ) {
	const rewritten = { ...headers };

	for ( const [ name, value ] of Object.entries( rewritten ) ) {
		if ( typeof value !== 'string' ) {
			continue;
		}

		const nextValue = rewriteLoopbackHostsInText( value );
		if ( nextValue !== value ) {
			rewritten[ name ] = nextValue;
		}
	}

	return rewritten;
}

/**
 * @param {Record<string, string>} incoming
 * @param {string} tunnelHost
 * @return {Record<string, string>}
 */
function buildUpstreamHeaders( incoming, tunnelHost ) {
	const upstreamHost = new URL( getMainSiteBaseUrl() ).host;

	/** @type {Record<string, string>} */
	const headers = {
		host: upstreamHost,
		'x-e2e-public-origin': tunnelHost,
	};

	for ( const [ name, value ] of Object.entries( incoming ) ) {
		if ( REQUEST_HEADER_SKIP.has( name.toLowerCase() ) ) {
			continue;
		}
		headers[ name ] = value;
	}

	return headers;
}

/**
 * Browsers request /favicon.ico at the site root; map to the theme asset.
 *
 * @param {string} pathname
 * @return {string | null}
 */
function resolveFaviconUpstreamPath( pathname ) {
	if ( ! pathname.endsWith( '/favicon.ico' ) ) {
		return null;
	}

	if ( pathname === '/favicon.ico' ) {
		return THEME_FAVICON_PATH;
	}

	const subsitePrefix = `/${ E2E_SUBSITE_SLUG }`;
	if ( pathname === `${ subsitePrefix }/favicon.ico` ) {
		return `${ subsitePrefix }${ THEME_FAVICON_PATH }`;
	}

	return null;
}

const UPSTREAM_RETRYABLE_STATUSES = new Set( [ 502, 503, 504 ] );
const UPSTREAM_MAX_ATTEMPTS = 4;
const UPSTREAM_RETRY_DELAY_MS = 400;

/**
 * @param {{ method: string, path: string, headers: Record<string, string>, body: Buffer | null }} request
 * @return {Promise<{ status: number, headers: Record<string, string>, body: Buffer }>}
 */
async function requestHostWordPressWithRetry( request ) {
	let lastResponse = await requestHostWordPress( request );

	for (
		let attempt = 1;
		attempt < UPSTREAM_MAX_ATTEMPTS &&
		UPSTREAM_RETRYABLE_STATUSES.has( lastResponse.status );
		attempt++
	) {
		await delay( UPSTREAM_RETRY_DELAY_MS * attempt );
		lastResponse = await requestHostWordPress( request );
	}

	return lastResponse;
}

/**
 * @param {{ method: string, path: string, headers: Record<string, string>, body: Buffer | null }} request
 * @return {Promise<{ status: number, headers: Record<string, string>, body: Buffer }>}
 */
function requestHostWordPress( request ) {
	const port = getE2ePort();

	return new Promise( ( resolve, reject ) => {
		const upstream = http.request(
			{
				host: '127.0.0.1',
				port,
				path: request.path,
				method: request.method,
				headers: request.headers,
				family: 4,
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
