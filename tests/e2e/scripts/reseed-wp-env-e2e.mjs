/**
 * Restore seeded options on an already-running wp-env without wp-env reset.
 *
 * CI's first env:e2e:start drops and reinstalls the database. Screenshot tests
 * only need chrome and editor preferences put back after functional tests.
 * The idempotent after-start commands do that. Skipping reset avoids a second
 * WordPress reinstall between the two suites.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDirectory = path.dirname( fileURLToPath( import.meta.url ) );
const projectRoot = path.resolve( scriptsDirectory, '../../..' );

/**
 * Run a node script in this repo and exit if it fails.
 *
 * @param {string} scriptName
 * @param {string[]} scriptArguments
 */
function runNodeScript( scriptName, scriptArguments ) {
	const result = spawnSync(
		process.execPath,
		[ path.join( scriptsDirectory, scriptName ), ...scriptArguments ],
		{
			cwd: projectRoot,
			stdio: 'inherit',
			env: process.env,
		}
	);

	if ( result.status !== 0 ) {
		process.exit( result.status ?? 1 );
	}
}

runNodeScript( 'run-wp-env-after-start.mjs', [ '--idempotent-only' ] );
runNodeScript( 'verify-e2e-stack.mjs', [] );
