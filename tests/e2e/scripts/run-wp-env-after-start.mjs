import { readFileSync } from 'fs';
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import {
	E2E_SUBSITE_SLUG,
	getMainSiteBaseUrl,
	getSubsiteBaseUrl,
	resolveWpEnvNodeEntryPath,
	WP_ENV_E2E_AFTER_START_PLAN,
	WP_ENV_E2E_CONFIG,
} from '../helpers/e2e-env.js';
import { runE2eCli, THEME_PATH } from '../helpers/wp-cli.js';

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );
const projectRoot = path.resolve( __dirname, '../../..' );

const MAIN_SITE_URL = getMainSiteBaseUrl();
const SUBSITE_URL = getSubsiteBaseUrl();

const MU_PLUGIN_INSTALLER_IN_CONTAINER = `${ THEME_PATH }/tests/e2e/scripts/install-e2e-mu-plugin.php`;

/**
 * Copy the e2e mu-plugin from the theme bind mount into the WordPress volume.
 * Avoids Docker Desktop stale file binds (Links:0 / include ENOENT).
 *
 * Host OS may be Windows or macOS; the installer runs as PHP inside the Linux
 * CLI container via spawnSync argv (no host shell, no POSIX sh).
 */
function installE2eMuPlugin() {
	const wpEnvNodeEntry = resolveWpEnvNodeEntryPath( projectRoot );

	console.log( '[e2e] Installing e2e mu-plugin into WordPress volume…' );

	const result = spawnSync(
		process.execPath,
		[
			wpEnvNodeEntry,
			'run',
			`--config=${ WP_ENV_E2E_CONFIG }`,
			'cli',
			'--env-cwd=/',
			'php',
			MU_PLUGIN_INSTALLER_IN_CONTAINER,
		],
		{
			cwd: projectRoot,
			encoding: 'utf8',
			stdio: [ 'ignore', 'pipe', 'pipe' ],
		}
	);

	const output = `${ result.stdout || '' }\n${ result.stderr || '' }`;

	if ( result.status !== 0 ) {
		throw new Error(
			`[e2e] Failed to copy e2e mu-plugin (exit ${ result.status }).`
		);
	}

	const sourceReadable = /source_readable=1/.test( output );
	const destReadable = /dest_readable=1/.test( output );
	const destBytesMatch = output.match( /dest_bytes=(\d+)/ );
	const destBytes = destBytesMatch ? Number( destBytesMatch[ 1 ] ) : 0;

	if ( ! sourceReadable || ! destReadable || destBytes < 100 ) {
		throw new Error(
			'[e2e] Failed to install readable e2e mu-plugin. ' +
				'If include_once warnings persist, run: npm run env:e2e:destroy && npm run env:e2e:start'
		);
	}
}

/**
 * Create the e2e department subsite when missing (idempotent).
 */
function ensureE2eSubsiteExists() {
	const listedUrls = runE2eCli(
		`wp site list --field=url --url=${ MAIN_SITE_URL }`,
		{ url: MAIN_SITE_URL }
	)
		.trim()
		.split( /\r?\n/ )
		.map( ( siteUrl ) => siteUrl.replace( /\/$/, '' ) );

	if ( listedUrls.includes( SUBSITE_URL ) ) {
		return;
	}

	runE2eCli(
		`wp site create --slug=${ E2E_SUBSITE_SLUG } --title="E2E Department" --url=${ MAIN_SITE_URL }`,
		{ url: MAIN_SITE_URL }
	);
}

/**
 * @return {{ wpCliCommands: string[], idempotentWpCliCommands: string[] }}
 */
function loadAfterStartPlan() {
	const planPath = path.join( projectRoot, WP_ENV_E2E_AFTER_START_PLAN );
	const plan = JSON.parse( readFileSync( planPath, 'utf8' ) );

	if ( ! Array.isArray( plan.wpCliCommands ) ) {
		throw new Error(
			`Invalid ${ WP_ENV_E2E_AFTER_START_PLAN }: expected wpCliCommands array.`
		);
	}

	return {
		wpCliCommands: plan.wpCliCommands,
		idempotentWpCliCommands: Array.isArray( plan.idempotentWpCliCommands )
			? plan.idempotentWpCliCommands
			: [],
	};
}

/**
 * @param {string[]} wpCliCommands
 * @param {string} phaseLabel
 */
function runWpCliCommandList( wpCliCommands, phaseLabel ) {
	if ( wpCliCommands.length === 0 ) {
		return;
	}

	console.log(
		`[e2e] After-start (${ phaseLabel }): running ${ wpCliCommands.length } WP-CLI steps…`
	);

	for ( let index = 0; index < wpCliCommands.length; index++ ) {
		const stepNumber = index + 1;
		const wpCliCommand = wpCliCommands[ index ];
		const stepLabel = wpCliCommand.split( ' ' ).slice( 0, 3 ).join( ' ' );
		console.log(
			`[e2e] After-start (${ phaseLabel } ${ stepNumber }/${ wpCliCommands.length }): ${ stepLabel }…`
		);
		runE2eCli( wpCliCommand );
	}
}

const runMode = process.argv.includes( '--idempotent-only' )
	? 'idempotent'
	: process.argv.includes( '--integration-only' )
	? 'integration'
	: 'all';

installE2eMuPlugin();
ensureE2eSubsiteExists();

const { wpCliCommands, idempotentWpCliCommands } = loadAfterStartPlan();

if ( runMode === 'idempotent' || runMode === 'all' ) {
	runWpCliCommandList( idempotentWpCliCommands, 'idempotent' );
}

if ( runMode === 'integration' || runMode === 'all' ) {
	runWpCliCommandList( wpCliCommands, 'integration' );
}
