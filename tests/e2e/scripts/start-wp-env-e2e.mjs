import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import {
	resolveWpEnvNodeEntryPath,
	WP_ENV_E2E_CONFIG,
	WP_ENV_E2E_READY_LOG,
} from '../helpers/e2e-env.js';
import { generateWpEnvE2eConfig } from './generate-wp-env-e2e.mjs';

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );
const projectRoot = path.resolve( __dirname, '../../..' );
const wpEnvNodeEntry = resolveWpEnvNodeEntryPath( projectRoot );

/**
 * @param {string[]} wpEnvArgs
 * @param {import('child_process').SpawnSyncOptions} [options]
 */
function runWpEnvSync( wpEnvArgs, options = {} ) {
	return spawnSync( process.execPath, [ wpEnvNodeEntry, ...wpEnvArgs ], {
		cwd: projectRoot,
		env: process.env,
		...options,
	} );
}

/**
 * @return {boolean}
 */
function isWpEnvE2eRunning() {
	const probe = runWpEnvSync(
		[
			'run',
			`--config=${ WP_ENV_E2E_CONFIG }`,
			'cli',
			'wp',
			'option',
			'get',
			'siteurl',
		],
		{ encoding: 'utf8' }
	);

	return probe.status === 0;
}

console.log( '[e2e] Resolving plugins and starting wp-env…' );
await generateWpEnvE2eConfig();

const wpEnvAlreadyRunning = isWpEnvE2eRunning();

if ( ! wpEnvAlreadyRunning ) {
	const startResult = runWpEnvSync(
		[ 'start', `--config=${ WP_ENV_E2E_CONFIG }` ],
		{ stdio: 'inherit' }
	);

	if ( startResult.status !== 0 ) {
		if ( startResult.error ) {
			console.error(
				`[e2e] Failed to run wp-env: ${ startResult.error.message }`
			);
		}
		process.exit( startResult.status ?? 1 );
	}
}

console.log( WP_ENV_E2E_READY_LOG );
