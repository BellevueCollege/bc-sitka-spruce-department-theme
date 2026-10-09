import {
	createWriteStream,
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	rmSync,
	statSync,
} from 'fs';
import { execSync } from 'child_process';
import { createHash } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from 'stream/promises';
import pluginCatalog from '../plugins.json' with { type: 'json' };

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );
const e2eRoot = path.resolve( __dirname, '..' );
// scripts → e2e → tests → theme root. One fewer ".." resolves paths inside tests/.
const projectRoot = path.resolve( __dirname, '../../..' );
const pluginsCacheRoot = path.join( projectRoot, 'artifacts', 'e2e-plugins' );
const localPluginsPath = path.join( e2eRoot, 'plugins.local.json' );

const MAX_REDIRECTS = 5;
const GITHUB_USER_AGENT = 'bc-sitka-spruce-e2e';
const GITHUB_API_VERSION = '2022-11-28';
const TOKEN_FINGERPRINT_LENGTH = 8;
const GITHUB_RELEASE_DOWNLOAD_PATTERN =
	/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/releases\/download\/([^/]+)\/([^/?#]+)$/;
const PLACEHOLDER_RELEASE_FRAGMENT = 'v0.0.0-placeholder';
const isDebugLoggingEnabled = process.env.E2E_DEBUG === '1';

/**
 * @typedef {object} ResolvedE2ePlugin
 * @property {string} key Catalog key.
 * @property {string} slug Plugin directory under wp-content/plugins.
 * @property {string} displayName Human-readable name for blueprint activation.
 * @property {boolean} required When true, missing sources fail resolution.
 * @property {string | null} mountHostPath Host directory to bind-mount, if any.
 * @property {string | null} blueprintInstallUrl Remote zip URL for installPlugin step.
 * @property {string | null} activateBootstrapPath Relative to plugins dir when known.
 * @property {('main'|'subsite')[]} activateOn Sites where the plugin should be activated.
 */

/**
 * @return {Record<string, { source?: string, path?: string }>}
 */
function loadLocalPluginOverlay() {
	if ( ! existsSync( localPluginsPath ) ) {
		return {};
	}

	return JSON.parse( readFileSync( localPluginsPath, 'utf8' ) );
}

/**
 * @param {string} pluginKey
 * @param {string} displayName
 * @param {string} localPath
 * @return {never}
 */
function throwMissingLocalPath( pluginKey, displayName, localPath ) {
	throw new Error(
		`${ displayName } (${ pluginKey }) is configured as local in plugins.local.json ` +
			`but path does not exist: ${ localPath }`
	);
}

/**
 * @param {string} remoteUrl
 * @param {string} displayName
 * @return {never}
 */
function throwPlaceholderRelease( remoteUrl, displayName ) {
	throw new Error(
		`${ displayName } has no GitHub release zip yet (${ PLACEHOLDER_RELEASE_FRAGMENT }). ` +
			`Add a local path in tests/e2e/plugins.local.json or set an env path override.`
	);
}

/**
 * Zip folder names (e.g. mayflower-blocks-g4) often differ from catalog paths (mayflower-blocks/…).
 *
 * @param {string} mountHostPath
 * @param {string | null} catalogActivatePath
 * @return {string | null}
 */
function resolveWordPressPluginBootstrapPath( mountHostPath, catalogActivatePath ) {
	if ( ! mountHostPath || ! catalogActivatePath ) {
		return catalogActivatePath;
	}

	const pluginMainFile = path.basename( catalogActivatePath );
	const pluginDirectory = path.basename( mountHostPath );
	const bootstrapOnDisk = path.join( mountHostPath, pluginMainFile );

	if ( existsSync( bootstrapOnDisk ) ) {
		return `${ pluginDirectory }/${ pluginMainFile }`;
	}

	// Local checkouts may use a different bootstrap file than release zips.
	return pluginDirectory;
}

/**
 * @param {ResolvedE2ePlugin} base
 * @param {string} mountHostPath
 * @param {string | null} catalogActivatePath
 * @return {ResolvedE2ePlugin}
 */
function withMountedPlugin( base, mountHostPath, catalogActivatePath ) {
	return {
		...base,
		mountHostPath,
		activateBootstrapPath: resolveWordPressPluginBootstrapPath(
			mountHostPath,
			catalogActivatePath
		),
	};
}

/**
 * @param {string} pluginKey
 * @param {import('../plugins.json')[string]} catalogEntry
 * @param {{ source?: string, path?: string } | undefined} localEntry
 * @return {Promise<ResolvedE2ePlugin>}
 */
async function resolveCatalogEntry( pluginKey, catalogEntry, localEntry ) {
	const {
		slug,
		displayName,
		required = true,
		envPathVar,
		remote,
		activate: activateBootstrapPath = null,
		blueprintInstallOnly = false,
		activateOn = [ 'subsite' ],
	} = catalogEntry;

	const base = {
		key: pluginKey,
		slug,
		displayName,
		required,
		mountHostPath: null,
		blueprintInstallUrl: null,
		activateBootstrapPath,
		activateOn,
	};

	if ( envPathVar ) {
		const envPath = process.env[ envPathVar ];
		if ( envPath && existsSync( envPath ) ) {
			console.log( `[e2e] ${ pluginKey }: using ${ envPathVar }=${ envPath }` );
			return withMountedPlugin( base, path.resolve( envPath ), activateBootstrapPath );
		}
	}

	if ( localEntry?.source === 'local' && localEntry.path ) {
		const localPath = path.resolve( projectRoot, localEntry.path );
		if ( existsSync( localPath ) ) {
			console.log( `[e2e] ${ pluginKey }: using local ${ localPath }` );
			return withMountedPlugin( base, localPath, activateBootstrapPath );
		}
		if ( required ) {
			throwMissingLocalPath( pluginKey, displayName, localPath );
		}
	}

	let remoteUrl = remote?.url || '';
	if ( ! remoteUrl && remote?.urlEnv ) {
		remoteUrl = process.env[ remote.urlEnv ] || '';
	}

	if ( blueprintInstallOnly ) {
		if ( remoteUrl ) {
			console.log( `[e2e] ${ pluginKey }: blueprint install from remote URL` );
			return { ...base, blueprintInstallUrl: remoteUrl };
		}
		if ( ! required ) {
			console.warn(
				`[e2e] ${ displayName } not configured (set ${ remote?.urlEnv || 'remote URL' }).`
			);
			return base;
		}
		throw new Error(
			`${ displayName } (${ pluginKey }) requires ${ remote?.urlEnv || 'remote.url' }.`
		);
	}

	if ( ! remoteUrl ) {
		if ( ! required ) {
			const sourceHint = remote?.urlEnv || 'remote URL';
			console.log( `[e2e] ${ pluginKey }: skipped (${ sourceHint } not set)` );
			return base;
		}
		throw new Error( `${ displayName } (${ pluginKey }) has no remote URL configured.` );
	}

	if ( remoteUrl.includes( PLACEHOLDER_RELEASE_FRAGMENT ) ) {
		throwPlaceholderRelease( remoteUrl, displayName );
	}

	const directoryName = remote.directoryName || slug;
	const downloadSourceLabel = remote?.urlEnv || 'release URL';
	console.log( `[e2e] ${ pluginKey }: downloading plugin archive (${ downloadSourceLabel })` );
	const extractedRoot = await downloadAndExtractPlugin( {
		url: remoteUrl,
		directoryName,
	} );
	console.log( `[e2e] ${ pluginKey }: downloaded to ${ extractedRoot }` );
	return withMountedPlugin( base, extractedRoot, activateBootstrapPath );
}

/**
 * Resolve all e2e plugins from catalog + optional local overlay.
 *
 * @return {Promise<ResolvedE2ePlugin[]>}
 */
export async function resolveE2ePlugins() {
	const localOverlay = loadLocalPluginOverlay();
	const resolved = [];

	for ( const pluginKey of Object.keys( pluginCatalog ) ) {
		const catalogEntry = pluginCatalog[ pluginKey ];
		resolved.push(
			await resolveCatalogEntry(
				pluginKey,
				catalogEntry,
				localOverlay[ pluginKey ]
			)
		);
	}

	return resolved;
}

/**
 * @param {string} zipPath
 * @param {string} sourceUrl
 * @return {void}
 */
function assertDownloadedZip( zipPath, sourceUrl ) {
	const zipBytes = readFileSync( zipPath );
	const isZipArchive =
		zipBytes.length >= 4 &&
		zipBytes[ 0 ] === 0x50 &&
		zipBytes[ 1 ] === 0x4b;

	if ( isZipArchive ) {
		return;
	}

	const sizeInBytes = statSync( zipPath ).size;
	throw new Error(
		`Download from ${ maskSecretUrl( sourceUrl ) } did not return a zip file ` +
			`(${ sizeInBytes } bytes). Check the URL or license key in ACF_DOWNLOAD_URL.`
	);
}

/**
 * @param {string} url
 * @return {string}
 */
function maskSecretUrl( url ) {
	if ( url.length <= 24 ) {
		return '(configured URL)';
	}

	return `${ url.slice( 0, 20 ) }…`;
}

/**
 * @param {{ url: string, directoryName: string }} release
 * @return {Promise<string>}
 */
async function downloadAndExtractPlugin( release ) {
	const extractParent = path.join( pluginsCacheRoot, release.directoryName );
	const zipPath = path.join( extractParent, 'plugin.zip' );

	mkdirSync( extractParent, { recursive: true } );
	await downloadFile( release.url, zipPath );
	assertDownloadedZip( zipPath, release.url );
	extractZip( zipPath, extractParent );
	rmSync( zipPath, { force: true } );

	return findPluginRootDirectory( extractParent );
}

/**
 * @return {string}
 */
function getGitHubToken() {
	return normalizeGitHubToken( process.env.GITHUB_PAT || process.env.GITHUB_TOKEN || '' );
}

/**
 * @param {string} rawToken
 * @return {string}
 */
function normalizeGitHubToken( rawToken ) {
	let token = rawToken.trim();
	if ( isWrappedInQuotes( token ) ) {
		token = token.slice( 1, -1 ).trim();
	}

	return token.replace( /^(Bearer|token)\s+/i, '' ).trim();
}

/**
 * @param {string} token
 * @return {boolean}
 */
function isWrappedInQuotes( token ) {
	const quote = token.charAt( 0 );
	return ( quote === '"' || quote === "'" ) && token.endsWith( quote ) && token.length > 1;
}

/**
 * @param {string} token
 * @return {string}
 */
function describeGitHubToken( token ) {
	if ( ! token ) {
		return 'missing';
	}

	if ( token.startsWith( '$(' ) ) {
		return 'set to an unexpanded $(variable)';
	}

	const fingerprint = createHash( 'sha256' ).update( token ).digest( 'hex' ).slice( 0, TOKEN_FINGERPRINT_LENGTH );
	return `present (${ githubTokenKind( token ) }, ${ token.length } characters, sha256 ${ fingerprint })`;
}

/**
 * @param {string} token
 * @return {string}
 */
function githubTokenKind( token ) {
	if ( token.startsWith( 'github_pat_' ) ) {
		return 'fine-grained';
	}

	if ( token.startsWith( 'ghp_' ) ) {
		return 'classic';
	}

	return 'unrecognized format';
}

/**
 * Fine-grained PATs get 404 from github.com/.../releases/download even with Contents read.
 * The releases API accepts the same token.
 *
 * @param {string} releaseDownloadUrl
 * @return {{ owner: string, repo: string, tag: string, filename: string } | null}
 */
function parseGitHubReleaseDownloadUrl( releaseDownloadUrl ) {
	const match = releaseDownloadUrl.match( GITHUB_RELEASE_DOWNLOAD_PATTERN );
	if ( ! match ) {
		return null;
	}

	return {
		owner: match[ 1 ],
		repo: match[ 2 ],
		tag: decodeURIComponent( match[ 3 ] ),
		filename: decodeURIComponent( match[ 4 ] ),
	};
}

/**
 * @param {string} token
 * @param {string} accept
 * @return {Record<string, string>}
 */
function githubApiHeaders( token, accept ) {
	return {
		Accept: accept,
		Authorization: `Bearer ${ token }`,
		'User-Agent': GITHUB_USER_AGENT,
		'X-GitHub-Api-Version': GITHUB_API_VERSION,
	};
}

/**
 * @param {{ owner: string, repo: string, tag: string, filename: string }} parsed
 * @param {string} token
 * @return {Promise<string>} API URL for the release asset bytes.
 */
async function resolveGitHubReleaseAssetUrl( parsed, token ) {
	const releaseApiUrl =
		`https://api.github.com/repos/${ parsed.owner }/${ parsed.repo }` +
		`/releases/tags/${ encodeURIComponent( parsed.tag ) }`;
	const releaseResponse = await fetch( releaseApiUrl, {
		headers: githubApiHeaders( token, 'application/vnd.github+json' ),
	} );

	if ( ! releaseResponse.ok ) {
		const body = await releaseResponse.json().catch( () => ( {} ) );
		throw new Error( githubApiErrorMessage( releaseResponse.status, parsed, token, body.message ) );
	}

	const release = await releaseResponse.json();
	const asset = ( release.assets || [] ).find( ( item ) => item.name === parsed.filename );
	if ( ! asset?.url ) {
		const available = ( release.assets || [] ).map( ( item ) => item.name ).join( ', ' ) || 'none';
		throw new Error(
			`Release ${ parsed.tag } on ${ parsed.owner }/${ parsed.repo } has no asset ` +
				`"${ parsed.filename }". Available: ${ available }`
		);
	}

	return asset.url;
}

/**
 * @param {number} statusCode
 * @param {{ owner: string, repo: string, tag: string }} parsed
 * @param {string} token
 * @param {string | undefined} githubMessage
 * @return {string}
 */
function githubApiErrorMessage( statusCode, parsed, token, githubMessage ) {
	const target = `${ parsed.owner }/${ parsed.repo } tag ${ parsed.tag }`;
	const detail = githubMessage || 'request failed';

	if ( statusCode === 401 ) {
		return (
			`GitHub API 401 for ${ target }: ${ detail }. ${ describeGitHubToken( token ) }. ` +
			'401 means this token string is invalid, expired, or revoked. ' +
			'Replace the CI pipeline GITHUB_PAT secret with the raw token only.'
		);
	}

	return (
		`GitHub API ${ statusCode } for ${ target }: ${ detail }. ${ describeGitHubToken( token ) }. ` +
		'Confirm the token can read this repo. If the org uses SAML SSO, authorize it for BellevueCollege.'
	);
}

/**
 * @param {string} hostname
 * @return {boolean}
 */
function shouldSendGitHubAuth( hostname ) {
	return hostname === 'github.com' || hostname === 'api.github.com';
}

/**
 * @param {string} url
 * @param {string} destinationPath
 */
async function downloadFile( url, destinationPath ) {
	const token = getGitHubToken();
	const parsedRelease = parseGitHubReleaseDownloadUrl( url );

	if ( ! parsedRelease ) {
		await saveDownloadToFile( url, destinationPath, '', url );
		return;
	}

	if ( isDebugLoggingEnabled ) {
		console.log( `[e2e] GitHub token for ${ parsedRelease.repo }: ${ describeGitHubToken( token ) }` );
	}

	try {
		await saveDownloadToFile( url, destinationPath, '', url );
		return;
	} catch ( error ) {
		if ( error.statusCode !== 404 || ! token ) {
			throw error;
		}
		if ( isDebugLoggingEnabled ) {
			console.log( `[e2e] ${ parsedRelease.repo }: public download returned 404; retrying with GitHub API` );
		}
	}

	const assetUrl = await resolveGitHubReleaseAssetUrl( parsedRelease, token );
	await saveDownloadToFile( assetUrl, destinationPath, token, url );
}

/**
 * @param {string} startUrl
 * @param {string} destinationPath
 * @param {string} token
 * @param {string} originalUrl
 */
async function saveDownloadToFile( startUrl, destinationPath, token, originalUrl ) {
	let currentUrl = startUrl;
	let redirectCount = 0;

	while ( redirectCount <= MAX_REDIRECTS ) {
		const response = await fetchReleaseBytes( currentUrl, token );

		if ( response.status >= 300 && response.status < 400 ) {
			currentUrl = nextRedirectUrl( response, currentUrl );
			redirectCount += 1;
			continue;
		}

		if ( ! response.ok ) {
			throwDownloadFailed( originalUrl, response, token );
		}

		await pipeline( response.body, createWriteStream( destinationPath ) );
		return;
	}

	throw new Error( `Too many redirects while downloading ${ originalUrl }` );
}

/**
 * @param {string} currentUrl
 * @param {string} token
 * @return {Promise<Response>}
 */
function fetchReleaseBytes( currentUrl, token ) {
	const requestUrl = new URL( currentUrl );
	const headers = {
		Accept: 'application/octet-stream',
		'User-Agent': GITHUB_USER_AGENT,
	};

	if ( token && shouldSendGitHubAuth( requestUrl.host ) ) {
		headers.Authorization = `Bearer ${ token }`;
		headers[ 'X-GitHub-Api-Version' ] = GITHUB_API_VERSION;
	}

	return fetch( currentUrl, { headers, redirect: 'manual' } );
}

/**
 * @param {Response} response
 * @param {string} currentUrl
 * @return {string}
 */
function nextRedirectUrl( response, currentUrl ) {
	const location = response.headers.get( 'location' );
	if ( ! location ) {
		throw new Error( `Redirect without location header for ${ currentUrl }` );
	}

	return new URL( location, currentUrl ).href;
}

/**
 * @param {string} originalUrl
 * @param {Response} response
 * @param {string} token
 * @return {never}
 */
function throwDownloadFailed( originalUrl, response, token ) {
	const tokenNote = token
		? describeGitHubToken( token )
		: 'GITHUB_PAT is not set in this job.';
	const error = new Error(
		`Failed to download ${ originalUrl }: ${ response.status } ${ response.statusText }. ${ tokenNote }`
	);
	error.statusCode = response.status;
	throw error;
}

/**
 * @param {string} zipPath
 * @param {string} destinationDirectory
 */
function extractZip( zipPath, destinationDirectory ) {
	if ( process.platform === 'win32' ) {
		const command = `powershell.exe -NoProfile -Command "Expand-Archive -Path '${ zipPath.replace( /'/g, "''" ) }' -DestinationPath '${ destinationDirectory.replace( /'/g, "''" ) }' -Force"`;
		execSync( command, { stdio: 'inherit' } );
		return;
	}

	execSync( `unzip -o -q "${ zipPath }" -d "${ destinationDirectory }"`, {
		stdio: 'inherit',
	} );
}

/**
 * @param {string} extractDirectory
 * @return {string}
 */
function findPluginRootDirectory( extractDirectory ) {
	const entries = readdirSync( extractDirectory, { withFileTypes: true } );
	const hasTopLevelPhp = entries.some(
		( entry ) => entry.isFile() && entry.name.endsWith( '.php' )
	);

	if ( hasTopLevelPhp ) {
		return extractDirectory;
	}

	const directories = entries.filter( ( entry ) => entry.isDirectory() );
	if ( directories.length === 1 ) {
		return path.join( extractDirectory, directories[ 0 ].name );
	}

	return extractDirectory;
}
