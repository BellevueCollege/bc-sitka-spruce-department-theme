import { createHash } from 'crypto';
import { spawnSync } from 'child_process';
import {
	cpSync,
	existsSync,
	mkdirSync,
	readFileSync,
	rmSync,
	statSync,
} from 'fs';
import os from 'os';
import path from 'path';

const WSL_STAGING_ENV_FLAG = 'E2E_STAGE_WSL_MOUNTS';
const STAGING_CACHE_FOLDER_NAME = 'bc-sitka-e2e-mounts';
const GIT_DIRECTORY_NAME = '.git';
const HASH_PREFIX_LENGTH = 12;

const WINDOWS_DRVFS_PATH_PATTERN = /^\/mnt\/[a-z]\//i;

/**
 * @return {boolean}
 */
export function isWslStagingRequested() {
	return process.env[ WSL_STAGING_ENV_FLAG ] === '1';
}

/**
 * Exit when staging was requested from PowerShell or cmd (not WSL).
 */
export function assertWslStagingRunnable() {
	if ( ! isWslStagingRequested() ) {
		return;
	}

	if ( process.platform === 'win32' ) {
		console.error(
			'[e2e] WSL mount staging must run from a WSL shell, not PowerShell or cmd.exe.'
		);
		console.error(
			'[e2e] Open your Linux distro and run: npm run env:e2e:start:wsl'
		);
		process.exit( 1 );
	}
}

/**
 * @return {boolean}
 */
function isWslEnvironment() {
	if ( process.platform === 'win32' ) {
		return false;
	}

	if ( process.env.WSL_DISTRO_NAME ) {
		return true;
	}

	try {
		const procVersion = readFileSync( '/proc/version', 'utf8' ).toLowerCase();
		return procVersion.includes( 'microsoft' );
	} catch {
		return false;
	}
}

/**
 * @param {string} absolutePath
 * @return {boolean}
 */
function isWindowsDrvfsMountPath( absolutePath ) {
	return WINDOWS_DRVFS_PATH_PATTERN.test( absolutePath );
}

/**
 * @return {string}
 */
function getStagingCacheRoot() {
	return path.join( os.homedir(), '.cache', STAGING_CACHE_FOLDER_NAME );
}

/**
 * Stable cache directory per source path so incremental copies reuse the same folder.
 *
 * @param {string} sourcePath
 * @return {string}
 */
function getStagingDestinationRoot( sourcePath ) {
	const resolvedSource = path.resolve( sourcePath );
	const pathHash = createHash( 'sha256' )
		.update( resolvedSource )
		.digest( 'hex' )
		.slice( 0, HASH_PREFIX_LENGTH );
	const baseName = path.basename( resolvedSource ) || 'mount';

	return path.join( getStagingCacheRoot(), `${ baseName }-${ pathHash }` );
}

/**
 * @return {boolean}
 */
function isRsyncAvailable() {
	const probe = spawnSync( 'rsync', [ '--version' ], { stdio: 'ignore' } );
	return probe.status === 0;
}

/**
 * @param {string} sourcePath
 * @return {boolean}
 */
function shouldCopyStagingPath( sourcePath ) {
	const pathSegments = path.resolve( sourcePath ).split( path.sep );
	return ! pathSegments.includes( GIT_DIRECTORY_NAME );
}

/**
 * @param {string} sourceDirectory
 * @param {string} destinationDirectory
 */
function copyDirectoryWithRsync( sourceDirectory, destinationDirectory ) {
	mkdirSync( destinationDirectory, { recursive: true } );
	const rsyncResult = spawnSync(
		'rsync',
		[
			'-aL',
			'--delete',
			`--exclude=${ GIT_DIRECTORY_NAME }`,
			`${ sourceDirectory }/`,
			`${ destinationDirectory }/`,
		],
		{ stdio: 'inherit' }
	);

	if ( rsyncResult.status !== 0 ) {
		throw new Error(
			`[e2e] rsync failed while staging ${ sourceDirectory } (exit ${ rsyncResult.status ?? 'unknown' }).`
		);
	}
}

/**
 * @param {string} sourceDirectory
 * @param {string} destinationDirectory
 */
function copyDirectoryWithNode( sourceDirectory, destinationDirectory ) {
	if ( existsSync( destinationDirectory ) ) {
		rmSync( destinationDirectory, { recursive: true, force: true } );
	}

	cpSync( sourceDirectory, destinationDirectory, {
		recursive: true,
		dereference: true,
		filter: ( source ) => shouldCopyStagingPath( source ),
	} );
}

/**
 * @param {string} sourceFile
 * @param {string} destinationDirectory
 * @return {string}
 */
function copyFileIntoCache( sourceFile, destinationDirectory ) {
	mkdirSync( destinationDirectory, { recursive: true } );
	const destinationFile = path.join(
		destinationDirectory,
		path.basename( sourceFile )
	);
	cpSync( sourceFile, destinationFile, { dereference: true } );
	return destinationFile;
}

/**
 * Copy a host directory or file onto WSL ext4 when staging is enabled and the source is on /mnt/<drive>/.
 *
 * @param {string} hostPath Absolute or relative host path used in wp-env config.
 * @return {string} Path wp-env should bind-mount.
 */
export function stageHostMountPath( hostPath ) {
	const resolvedPath = path.resolve( hostPath );

	if (
		! isWslStagingRequested() ||
		! isWslEnvironment() ||
		! isWindowsDrvfsMountPath( resolvedPath )
	) {
		return resolvedPath;
	}

	const sourceStat = statSync( resolvedPath );
	const destinationRoot = getStagingDestinationRoot( resolvedPath );

	if ( sourceStat.isFile() ) {
		const stagedFile = copyFileIntoCache( resolvedPath, destinationRoot );
		console.log( `[e2e] Staged ${ resolvedPath } → ${ stagedFile }` );
		return stagedFile;
	}

	if ( sourceStat.isDirectory() ) {
		if ( isRsyncAvailable() ) {
			copyDirectoryWithRsync( resolvedPath, destinationRoot );
		} else {
			copyDirectoryWithNode( resolvedPath, destinationRoot );
		}

		console.log( `[e2e] Staged ${ resolvedPath } → ${ destinationRoot }` );
		return destinationRoot;
	}

	return resolvedPath;
}

/**
 * Rewrite wp-env mount paths after copying sources off Windows drvfs shares.
 *
 * @param {Record<string, unknown>} wpEnvConfig
 * @return {Record<string, unknown>}
 */
export function applyWslStagingToWpEnvConfig( wpEnvConfig ) {
	if ( ! isWslStagingRequested() ) {
		return wpEnvConfig;
	}

	assertWslStagingRunnable();

	/** @type {Record<string, string>} */
	const stagedMappings = {};
	const mappings = wpEnvConfig.mappings;

	if ( mappings && typeof mappings === 'object' ) {
		for ( const [ mappingKey, hostPath ] of Object.entries( mappings ) ) {
			if ( typeof hostPath === 'string' ) {
				stagedMappings[ mappingKey ] = stageHostMountPath( hostPath );
			}
		}
	}

	/** @type {string[]} */
	const stagedPlugins = [];
	const plugins = wpEnvConfig.plugins;

	if ( Array.isArray( plugins ) ) {
		for ( const pluginEntry of plugins ) {
			if ( typeof pluginEntry === 'string' && ! /^https?:\/\//i.test( pluginEntry ) ) {
				stagedPlugins.push( stageHostMountPath( pluginEntry ) );
				continue;
			}

			stagedPlugins.push( pluginEntry );
		}
	}

	return {
		...wpEnvConfig,
		mappings: stagedMappings,
		plugins: stagedPlugins,
	};
}
