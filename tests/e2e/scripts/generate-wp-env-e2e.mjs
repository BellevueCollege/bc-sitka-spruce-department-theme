import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
	E2E_WP_PORT,
	WP_ENV_E2E_AFTER_START_PLAN,
	WP_ENV_E2E_CONFIG,
	getMainSiteBaseUrl,
	getSubsiteBaseUrl,
} from '../helpers/e2e-env.js';
import { resolveE2ePlugins } from './resolve-plugin.mjs';

const THEME_SLUG = 'bc-sitka-spruce-department-theme';

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );
const projectRoot = path.resolve( __dirname, '../../..' );
const muPluginPath = path.join(
	projectRoot,
	'tests/e2e/mu-plugins/e2e-seed-endpoint.php'
);

const MAIN_SITE_URL = getMainSiteBaseUrl();
const SUBSITE_URL = getSubsiteBaseUrl();

/**
 * @param {import('./resolve-plugin.mjs').ResolvedE2ePlugin[]} resolvedPlugins
 * @param {'main'|'subsite'} site
 * @return {string[]}
 */
function buildPluginActivationCommands( resolvedPlugins, site ) {
	const siteUrl = site === 'main' ? MAIN_SITE_URL : SUBSITE_URL;

	return resolvedPlugins
		.filter(
			( plugin ) =>
				plugin.activateBootstrapPath &&
				plugin.activateOn.includes( site )
		)
		.map(
			( plugin ) =>
				`wp plugin activate ${ plugin.activateBootstrapPath } --url=${ siteUrl }`
		);
}

/**
 * WP-CLI commands executed by run-wp-env-after-start.mjs after subsite creation.
 *
 * @param {import('./resolve-plugin.mjs').ResolvedE2ePlugin[]} resolvedPlugins
 * @return {string[]}
 */
function buildAfterStartWpCliCommands( resolvedPlugins ) {
	const themePath = `/var/www/html/wp-content/themes/${ THEME_SLUG }`;

	return [
		...buildPluginActivationCommands( resolvedPlugins, 'main' ),
		...buildPluginActivationCommands( resolvedPlugins, 'subsite' ),
		`wp theme activate ${ THEME_SLUG } --url=${ MAIN_SITE_URL }`,
		`wp theme activate ${ THEME_SLUG } --url=${ SUBSITE_URL }`,
		`wp rewrite structure '/%postname%/' --hard --url=${ MAIN_SITE_URL }`,
		`wp rewrite structure '/%postname%/' --hard --url=${ SUBSITE_URL }`,
		`wp rewrite flush --url=${ MAIN_SITE_URL }`,
		`wp rewrite flush --url=${ SUBSITE_URL }`,
		`wp eval-file ${ themePath }/tests/fixtures/seed-e2e-core-site.php --url=${ MAIN_SITE_URL }`,
		`wp eval-file ${ themePath }/tests/fixtures/seed-e2e-integration.php --url=${ SUBSITE_URL }`,
		`wp eval-file ${ themePath }/tests/fixtures/seed-editor-preferences.php --url=${ SUBSITE_URL }`,
	];
}

/**
 * Build the wp-env config object from the plugin catalog.
 *
 * @param {import('./resolve-plugin.mjs').ResolvedE2ePlugin[]} resolvedPlugins
 * @return {Record<string, unknown>}
 */
function buildWpEnvConfig( resolvedPlugins ) {
	/** @type {string[]} */
	const plugins = [];

	for ( const plugin of resolvedPlugins ) {
		if ( plugin.mountHostPath ) {
			plugins.push( plugin.mountHostPath );
			continue;
		}

		if ( plugin.blueprintInstallUrl ) {
			plugins.push( plugin.blueprintInstallUrl );
		}
	}

	const afterStartWpCliCommands =
		buildAfterStartWpCliCommands( resolvedPlugins );

	return {
		$schema: 'https://schemas.wp.org/trunk/wp-env.json',
		testsEnvironment: false,
		multisite: true,
		port: E2E_WP_PORT,
		core: null,
		phpVersion: '8.2',
		plugins,
		config: {
			WP_DEBUG: true,
			WP_DEBUG_LOG: true,
			SCRIPT_DEBUG: false,
			DISABLE_WP_CRON: true,
			WP_HOME: MAIN_SITE_URL,
			WP_SITEURL: MAIN_SITE_URL,
		},
		mappings: {
			'wp-content/mu-plugins/e2e-seed-endpoint.php': muPluginPath,
			// ADO checks out to …/s; map a stable theme slug instead of themes: ['.'].
			[ `wp-content/themes/${ THEME_SLUG }` ]: projectRoot,
		},
		lifecycleScripts: {
			// Node runner avoids Windows cmd.exe breaking chained `wp-env run` calls.
			afterStart: 'node tests/e2e/scripts/run-wp-env-after-start.mjs',
		},
		afterStartWpCliCommands,
	};
}

/**
 * Resolve plugins and write `.wp-env.e2e.json` at the theme root.
 *
 * @return {Promise<string>} Absolute path to the generated config file.
 */
export async function generateWpEnvE2eConfig() {
	const resolvedPlugins = await resolveE2ePlugins();

	const acfPlugin = resolvedPlugins.find( ( plugin ) => plugin.key === 'acf' );
	if (
		acfPlugin &&
		! acfPlugin.mountHostPath &&
		! acfPlugin.blueprintInstallUrl
	) {
		console.warn(
			'[e2e] Advanced Custom Fields Pro not configured. ' +
				'Set ACF_PATH, ACF_DOWNLOAD_URL, or plugins.local.json. Header/footer tests need ACF.'
		);
	}

	const wpEnvConfig = buildWpEnvConfig( resolvedPlugins );
	const { afterStartWpCliCommands, ...wpEnvConfigForFile } = wpEnvConfig;

	const configPath = path.join( projectRoot, WP_ENV_E2E_CONFIG );
	writeFileSync(
		configPath,
		`${ JSON.stringify( wpEnvConfigForFile, null, '\t' ) }\n`,
		'utf8'
	);

	const afterStartPlanPath = path.join(
		projectRoot,
		WP_ENV_E2E_AFTER_START_PLAN
	);
	writeFileSync(
		afterStartPlanPath,
		`${ JSON.stringify(
			{ wpCliCommands: afterStartWpCliCommands },
			null,
			'\t'
		) }\n`,
		'utf8'
	);

	console.log( `[e2e] Wrote ${ configPath }` );
	return configPath;
}

const isMainModule =
	process.argv[ 1 ] &&
	path.resolve( process.argv[ 1 ] ) ===
		path.resolve( fileURLToPath( import.meta.url ) );

if ( isMainModule ) {
	await generateWpEnvE2eConfig();
}
