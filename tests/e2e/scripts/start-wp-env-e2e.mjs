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

/**
 * Enable opcache in the WordPress container for faster PHP under bind mounts.
 */
function configureE2eOpcache() {
	const result = spawnSync(
		wpEnvBin,
		[
			'run',
			`--config=${ WP_ENV_E2E_CONFIG }`,
			'wordpress',
			'sh',
			'-c',
			`printf '%s\\n' 'opcache.enable=1' 'opcache.validate_timestamps=0' > /usr/local/etc/php/conf.d/99-e2e-opcache.ini && apache2ctl graceful`,
		],
		{
			cwd: projectRoot,
			encoding: 'utf8',
			env: process.env,
		}
	);

	if ( result.status !== 0 ) {
		console.warn(
			'[e2e] Could not configure PHP opcache in wp-env:',
			result.stderr?.trim() || result.stdout?.trim()
		);
	}
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

if ( isWpEnvE2eRunning() ) {
	configureE2eOpcache();
}

console.log( WP_ENV_E2E_READY_LOG );
