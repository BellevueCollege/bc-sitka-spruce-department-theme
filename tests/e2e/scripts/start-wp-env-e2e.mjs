import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import {
	WP_ENV_E2E_CONFIG,
	WP_ENV_E2E_READY_LOG,
} from '../helpers/e2e-env.js';
import { generateWpEnvE2eConfig } from './generate-wp-env-e2e.mjs';

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );
const projectRoot = path.resolve( __dirname, '../../..' );
const wpEnvBin = path.join( projectRoot, 'node_modules', '.bin', 'wp-env' );

/**
 * @return {boolean}
 */
function isWpEnvE2eRunning() {
	const probe = spawnSync(
		wpEnvBin,
		[
			'run',
			`--config=${ WP_ENV_E2E_CONFIG }`,
			'cli',
			'wp',
			'option',
			'get',
			'siteurl',
		],
		{
			cwd: projectRoot,
			encoding: 'utf8',
			env: process.env,
		}
	);

	return probe.status === 0;
}

console.log( '[e2e] Resolving plugins and starting wp-env…' );
await generateWpEnvE2eConfig();

const wpEnvAlreadyRunning = isWpEnvE2eRunning();

if ( ! wpEnvAlreadyRunning ) {
	const startResult = spawnSync(
		wpEnvBin,
		[ 'start', `--config=${ WP_ENV_E2E_CONFIG }` ],
		{
			cwd: projectRoot,
			stdio: 'inherit',
			env: process.env,
		}
	);

	if ( startResult.status !== 0 ) {
		process.exit( startResult.status ?? 1 );
	}
}

console.log( WP_ENV_E2E_READY_LOG );
