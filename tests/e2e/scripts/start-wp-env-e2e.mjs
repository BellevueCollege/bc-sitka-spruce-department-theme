import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { WP_ENV_E2E_CONFIG } from '../helpers/e2e-env.js';
import { generateWpEnvE2eConfig } from './generate-wp-env-e2e.mjs';

/** Playwright webServer waits for this line (do not probe HTTP before wp-env start exits). */
export const WP_ENV_E2E_READY_LOG = '[e2e] wp-env e2e ready';

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
// #region agent log
fetch( 'http://127.0.0.1:7318/ingest/2d137c06-c08e-496e-837b-46890e3b1347', {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
		'X-Debug-Session-Id': 'c90b84',
	},
	body: JSON.stringify( {
		sessionId: 'c90b84',
		runId: 'wp-env-boot',
		hypothesisId: 'B',
		location: 'tests/e2e/scripts/start-wp-env-e2e.mjs:boot',
		message: 'wp_env_cli_probe',
		data: { wpEnvAlreadyRunning },
		timestamp: Date.now(),
	} ),
} ).catch( () => {} );
// #endregion

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
