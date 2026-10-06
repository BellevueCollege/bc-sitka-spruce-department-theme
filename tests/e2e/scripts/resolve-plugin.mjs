import { createWriteStream, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'fs';
import { execSync } from 'child_process';
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
const PLACEHOLDER_RELEASE_FRAGMENT = 'v0.0.0-placeholder';

/**
 * @typedef {object} ResolvedE2ePlugin
 * @property {string} key Catalog key.
 * @property {string} slug Plugin directory under wp-content/plugins.
 * @property {string} displayName Human-readable name for blueprint activation.
 * @property {boolean} required When true, missing sources fail resolution.
 * @property {string | null} mountHostPath Host directory to bind-mount, if any.
 * @property {string | null} blueprintInstallUrl Remote zip URL for installPlugin step.
 * @property {string | null} activateBootstrapPath Relative to plugins dir when known.
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
	} = catalogEntry;

	const base = {
		key: pluginKey,
		slug,
		displayName,
		required,
		mountHostPath: null,
		blueprintInstallUrl: null,
		activateBootstrapPath,
	};

	if ( envPathVar ) {
		const envPath = process.env[ envPathVar ];
		if ( envPath && existsSync( envPath ) ) {
			console.log( `[e2e] ${ pluginKey }: using ${ envPathVar }=${ envPath }` );
			return { ...base, mountHostPath: path.resolve( envPath ) };
		}
	}

	if ( localEntry?.source === 'local' && localEntry.path ) {
		const localPath = path.resolve( projectRoot, localEntry.path );
		if ( existsSync( localPath ) ) {
			console.log( `[e2e] ${ pluginKey }: using local ${ localPath }` );
			return { ...base, mountHostPath: localPath };
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
			return base;
		}
		throw new Error( `${ displayName } (${ pluginKey }) has no remote URL configured.` );
	}

	if ( remoteUrl.includes( PLACEHOLDER_RELEASE_FRAGMENT ) ) {
		throwPlaceholderRelease( remoteUrl, displayName );
	}

	const directoryName = remote.directoryName || slug;
	const extractedRoot = await downloadAndExtractPlugin( {
		url: remoteUrl,
		directoryName,
	} );
	console.log( `[e2e] ${ pluginKey }: downloaded to ${ extractedRoot }` );
	return { ...base, mountHostPath: extractedRoot };
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
 * @param {{ url: string, directoryName: string }} release
 * @return {Promise<string>}
 */
async function downloadAndExtractPlugin( release ) {
	const extractParent = path.join( pluginsCacheRoot, release.directoryName );
	const zipPath = path.join( extractParent, 'plugin.zip' );

	mkdirSync( extractParent, { recursive: true } );
	await downloadFile( release.url, zipPath );
	extractZip( zipPath, extractParent );
	rmSync( zipPath, { force: true } );

	return findPluginRootDirectory( extractParent );
}

/**
 * @param {string} url
 * @param {string} destinationPath
 */
async function downloadFile( url, destinationPath ) {
	let currentUrl = url;
	let redirectCount = 0;

	while ( redirectCount <= MAX_REDIRECTS ) {
		const requestUrl = new URL( currentUrl );
		const headers = {
			Accept: 'application/octet-stream',
			'User-Agent': GITHUB_USER_AGENT,
		};

		if ( requestUrl.host === 'github.com' ) {
			const token = process.env.GITHUB_PAT || process.env.GITHUB_TOKEN;
			if ( token ) {
				headers.Authorization = `Bearer ${ token }`;
			}
		}

		const response = await fetch( currentUrl, { headers, redirect: 'manual' } );

		if ( response.status >= 300 && response.status < 400 ) {
			const location = response.headers.get( 'location' );
			if ( ! location ) {
				throw new Error( `Redirect without location header for ${ currentUrl }` );
			}
			currentUrl = new URL( location, currentUrl ).href;
			redirectCount += 1;
			continue;
		}

		if ( ! response.ok ) {
			throw new Error(
				`Failed to download ${ currentUrl }: ${ response.status } ${ response.statusText }`
			);
		}

		await pipeline( response.body, createWriteStream( destinationPath ) );
		return;
	}

	throw new Error( `Too many redirects while downloading ${ url }` );
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
