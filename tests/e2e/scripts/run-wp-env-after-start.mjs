import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
	E2E_SUBSITE_SLUG,
	getMainSiteBaseUrl,
	getSubsiteBaseUrl,
	WP_ENV_E2E_AFTER_START_PLAN,
} from '../helpers/e2e-env.js';
import { runE2eCli } from '../helpers/wp-cli.js';

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );
const projectRoot = path.resolve( __dirname, '../../..' );

const MAIN_SITE_URL = getMainSiteBaseUrl();
const SUBSITE_URL = getSubsiteBaseUrl();

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
 * @return {string[]}
 */
function loadAfterStartPlan() {
	const planPath = path.join( projectRoot, WP_ENV_E2E_AFTER_START_PLAN );
	const plan = JSON.parse( readFileSync( planPath, 'utf8' ) );

	if ( ! Array.isArray( plan.wpCliCommands ) ) {
		throw new Error(
			`Invalid ${ WP_ENV_E2E_AFTER_START_PLAN }: expected wpCliCommands array.`
		);
	}

	return plan.wpCliCommands;
}

ensureE2eSubsiteExists();

for ( const wpCliCommand of loadAfterStartPlan() ) {
	runE2eCli( wpCliCommand );
}
