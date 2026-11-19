import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import {
	getMainSiteBaseUrl,
	resolveWpEnvNodeEntryPath,
	WP_ENV_E2E_CONFIG,
} from '../helpers/e2e-env.js';

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );
const projectRoot = path.resolve( __dirname, '../../..' );
const wpEnvNodeEntry = resolveWpEnvNodeEntryPath( projectRoot );
const THEME_SLUG = 'bc-sitka-spruce-department-theme';
const THEME_PATH = `/var/www/html/wp-content/themes/${ THEME_SLUG }`;
const VERIFY_FILE = `${ THEME_PATH }/tests/fixtures/e2e-verify-stack.php`;

/**
 * @param {string[]} wpCliArgs
 * @return {import('child_process').SpawnSyncReturns<string>}
 */
function runWpCli( wpCliArgs ) {
	return spawnSync(
		process.execPath,
		[
			wpEnvNodeEntry,
			'run',
			`--config=${ WP_ENV_E2E_CONFIG }`,
			'cli',
			'wp',
			...wpCliArgs,
		],
		{ cwd: projectRoot, encoding: 'utf8', env: process.env }
	);
}

/**
 * @param {import('child_process').SpawnSyncReturns<string>} result
 * @return {string}
 */
function extractJsonLine( result ) {
	const combined = `${ result.stdout || '' }\n${ result.stderr || '' }`;
	const lines = combined
		.split( /\r?\n/ )
		.map( ( line ) => line.trim() )
		.filter( Boolean );
	const jsonLine = lines.find( ( line ) => line.startsWith( '{' ) );
	return jsonLine ?? lines[ lines.length - 1 ] ?? '';
}

const mainUrl = getMainSiteBaseUrl();
const verify = runWpCli( [
	'eval-file',
	VERIFY_FILE,
	`--url=${ mainUrl }`,
] );

if ( verify.status !== 0 ) {
	const payload = extractJsonLine( verify );
	console.error( '[e2e:verify] Stack verification failed.' );
	try {
		const parsed = JSON.parse( payload );
		if ( Array.isArray( parsed.failures ) ) {
			for ( const message of parsed.failures ) {
				console.error( `  - ${ message }` );
			}
		}
	} catch {
		console.error( payload || verify.stderr );
	}
	process.exit( 1 );
}

let parsed;
try {
	parsed = JSON.parse( extractJsonLine( verify ) );
} catch {
	console.error( '[e2e:verify] Could not parse verify output.' );
	process.exit( 1 );
}

if ( ! parsed.ok ) {
	console.error( '[e2e:verify] Unexpected ok=false without exit code.' );
	process.exit( 1 );
}

console.log( '[e2e:verify] Main site + subsite stack checks passed.' );
