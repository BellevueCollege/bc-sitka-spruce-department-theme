import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import {
	getMainSiteBaseUrl,
	getSubsiteBaseUrl,
	isCiEnvironment,
	resolveWpEnvNodeEntryPath,
	WP_ENV_E2E_CONFIG,
	WP_ENV_E2E_READY_LOG,
	WP_ENV_MARIADB_IMAGE,
} from '../helpers/e2e-env.js';
import { generateWpEnvE2eConfig } from './generate-wp-env-e2e.mjs';

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );
const projectRoot = path.resolve( __dirname, '../../..' );
const wpEnvNodeEntry = resolveWpEnvNodeEntryPath( projectRoot );
const afterStartScriptPath = path.join(
	projectRoot,
	'tests/e2e/scripts/run-wp-env-after-start.mjs'
);

const WP_ENV_START_MAX_ATTEMPTS = isCiEnvironment() ? 3 : 1;
const DOCKER_PULL_MAX_ATTEMPTS = 3;
const DOCKER_PULL_RETRY_DELAY_MS = 10_000;
const WP_ENV_CLI_READY_ATTEMPTS = 30;
const WP_ENV_CLI_READY_DELAY_MS = 2_000;

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
 * @param {string[]} wpCliArgs
 * @param {import('child_process').SpawnSyncOptions} [options]
 */
function runWpCliSync( wpCliArgs, options = {} ) {
	return runWpEnvSync(
		[ 'run', `--config=${ WP_ENV_E2E_CONFIG }`, 'cli', 'wp', ...wpCliArgs ],
		options
	);
}

/**
 * @param {number} delayMs
 */
function pauseBeforeRetry( delayMs ) {
	if ( process.platform === 'win32' ) {
		const pings = Math.max( 2, Math.ceil( delayMs / 1000 ) + 1 );
		spawnSync( 'ping', [ '127.0.0.1', '-n', String( pings ) ], {
			stdio: 'ignore',
		} );
		return;
	}

	spawnSync( 'sleep', [ String( Math.ceil( delayMs / 1000 ) ) ], {
		stdio: 'ignore',
	} );
}

/**
 * @param {string} output
 * @return {string}
 */
function extractLastMeaningfulLine( output ) {
	const lines = ( output || '' )
		.split( /\r?\n/ )
		.map( ( line ) => line.trim() )
		.filter( Boolean );

	return lines[ lines.length - 1 ] ?? '';
}

/**
 * @return {boolean}
 */
function isWpEnvCliReachable() {
	const probe = runWpCliSync(
		[ 'option', 'get', 'siteurl', `--url=${ getMainSiteBaseUrl() }` ],
		{ encoding: 'utf8' }
	);

	return probe.status === 0;
}

/**
 * @return {boolean}
 */
function isE2eIntegrationSeeded() {
	const subsiteUrl = getSubsiteBaseUrl();
	const probe = runWpCliSync(
		[
			'eval',
			`echo (int) ( get_page_by_path( 'e2e-profile-listing', OBJECT, 'page' )?->ID ?? 0 );`,
			`--url=${ subsiteUrl }`,
		],
		{ encoding: 'utf8' }
	);

	if ( probe.status !== 0 ) {
		return false;
	}

	const pageId = Number.parseInt( extractLastMeaningfulLine( probe.stdout ), 10 );
	return pageId > 0;
}

/**
 * @return {boolean}
 */
function waitForWpEnvCliReady() {
	for ( let attempt = 1; attempt <= WP_ENV_CLI_READY_ATTEMPTS; attempt++ ) {
		if ( isWpEnvCliReachable() ) {
			return true;
		}
		pauseBeforeRetry( WP_ENV_CLI_READY_DELAY_MS );
	}

	return false;
}

/**
 * @param {string} imageRef
 * @return {boolean}
 */
function hasLocalDockerImage( imageRef ) {
	const inspect = spawnSync( 'docker', [ 'image', 'inspect', imageRef ], {
		cwd: projectRoot,
		stdio: 'ignore',
	} );

	return inspect.status === 0;
}

function printDockerRegistryPullHelp() {
	console.error(
		'[e2e] Could not pull required Docker images (often DNS or VPN blocking Docker Hub / CloudFront).\n' +
			`[e2e] Missing image: ${ WP_ENV_MARIADB_IMAGE } (and wp-env will also need WordPress images).\n` +
			'[e2e] Fixes:\n' +
			'  - Restore internet DNS (corporate DNS timeouts break production.cloudfront.docker.com).\n' +
			'  - Rancher Desktop / Docker Desktop: retry on a stable network; set engine DNS to 1.1.1.1 or 8.8.8.8 if needed.\n' +
			`  - When online: docker pull ${ WP_ENV_MARIADB_IMAGE }\n` +
			'  - Avoid `wp-env destroy` unless necessary; it removes images and forces a full re-pull.\n' +
			'  - Use `npm run env:e2e:stop` + `npm run env:e2e:start` to reuse cached images.'
	);
}

/**
 * Ensure MariaDB is present locally before wp-env compose tries to pull (CI + fresh destroy).
 *
 * @return {boolean} True when the image exists locally or was pulled successfully.
 */
function warmWpEnvDockerImages() {
	if ( hasLocalDockerImage( WP_ENV_MARIADB_IMAGE ) ) {
		console.log( `[e2e] ${ WP_ENV_MARIADB_IMAGE } already present locally.` );
		return true;
	}

	for ( let attempt = 1; attempt <= DOCKER_PULL_MAX_ATTEMPTS; attempt++ ) {
		console.log(
			`[e2e] Pulling ${ WP_ENV_MARIADB_IMAGE } (attempt ${ attempt }/${ DOCKER_PULL_MAX_ATTEMPTS })…`
		);

		const pullResult = spawnSync( 'docker', [ 'pull', WP_ENV_MARIADB_IMAGE ], {
			cwd: projectRoot,
			stdio: 'inherit',
			env: process.env,
		} );

		if ( pullResult.status === 0 ) {
			return true;
		}

		if ( attempt < DOCKER_PULL_MAX_ATTEMPTS ) {
			pauseBeforeRetry( DOCKER_PULL_RETRY_DELAY_MS );
		}
	}

	return false;
}

/**
 * @return {boolean}
 */
function startWpEnvE2e() {
	for ( let attempt = 1; attempt <= WP_ENV_START_MAX_ATTEMPTS; attempt++ ) {
		if ( attempt > 1 ) {
			console.log(
				`[e2e] Retrying wp-env start (attempt ${ attempt }/${ WP_ENV_START_MAX_ATTEMPTS })…`
			);
			pauseBeforeRetry( DOCKER_PULL_RETRY_DELAY_MS );
		}

		const startResult = runWpEnvSync(
			[ 'start', `--config=${ WP_ENV_E2E_CONFIG }` ],
			{ stdio: 'inherit' }
		);

		if ( startResult.status === 0 ) {
			return true;
		}

		if ( startResult.error ) {
			console.error(
				`[e2e] Failed to run wp-env: ${ startResult.error.message }`
			);
		}
	}

	return false;
}

/**
 * @param {string[]} [extraArgs]
 */
function runAfterStartSeeding( extraArgs = [] ) {
	const seedResult = spawnSync(
		process.execPath,
		[ afterStartScriptPath, ...extraArgs ],
		{
			cwd: projectRoot,
			env: process.env,
			stdio: 'inherit',
		}
	);

	if ( seedResult.status !== 0 ) {
		process.exit( seedResult.status ?? 1 );
	}
}

console.log( '[e2e] Resolving plugins and starting wp-env…' );
await generateWpEnvE2eConfig();

const cliReachable = isWpEnvCliReachable();
const integrationSeeded = cliReachable && isE2eIntegrationSeeded();

if ( ! cliReachable ) {
	if ( ! warmWpEnvDockerImages() ) {
		printDockerRegistryPullHelp();
		process.exit( 1 );
	}

	if ( ! startWpEnvE2e() ) {
		if ( ! hasLocalDockerImage( WP_ENV_MARIADB_IMAGE ) ) {
			printDockerRegistryPullHelp();
		}
		process.exit( 1 );
	}

	if ( ! waitForWpEnvCliReady() ) {
		console.error(
			'[e2e] wp-env CLI is not running; cannot run after-start seeding.'
		);
		process.exit( 1 );
	}
} else {
	console.log( '[e2e] wp-env containers already running.' );
}

console.log( '[e2e] Running idempotent after-start seeds (editor preferences)…' );
runAfterStartSeeding( [ '--idempotent-only' ] );

if ( ! integrationSeeded ) {
	console.log( '[e2e] Running integration after-start seeding…' );
	runAfterStartSeeding( [ '--integration-only' ] );
} else {
	console.log(
		'[e2e] Integration fixtures already present; skipping integration after-start seeding.'
	);
}

if ( ! isE2eIntegrationSeeded() ) {
	console.error(
		'[e2e] E2E subsite is missing expected fixtures after start. ' +
			'Try: npx wp-env destroy --config=.wp-env.e2e.json --force && npm run env:e2e:start'
	);
	process.exit( 1 );
}

console.log( WP_ENV_E2E_READY_LOG );
