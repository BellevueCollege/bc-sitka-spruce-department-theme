import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { E2E_WP_PORT, WP_ENV_E2E_CONFIG } from '../helpers/e2e-env.js';
import { resolveE2ePlugins } from './resolve-plugin.mjs';

const THEME_SLUG = 'bc-sitka-spruce-department-theme';

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );
const projectRoot = path.resolve( __dirname, '../../..' );
const muPluginPath = path.join(
	projectRoot,
	'tests/e2e/mu-plugins/e2e-seed-endpoint.php'
);

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

	const themePath = `/var/www/html/wp-content/themes/${ THEME_SLUG }`;
	const afterStart = [
		`THEME_SLUG=${ THEME_SLUG }`,
		`wp-env run --config=${ WP_ENV_E2E_CONFIG } cli wp theme activate "$THEME_SLUG"`,
		`wp-env run --config=${ WP_ENV_E2E_CONFIG } cli wp rewrite structure '/%postname%/' --hard`,
		`wp-env run --config=${ WP_ENV_E2E_CONFIG } cli wp rewrite flush`,
		`wp-env run --config=${ WP_ENV_E2E_CONFIG } cli wp eval-file ${ themePath }/tests/fixtures/seed-editor-preferences.php`,
	].join( '; ' );

	return {
		$schema: 'https://schemas.wp.org/trunk/wp-env.json',
		testsEnvironment: false,
		port: E2E_WP_PORT,
		core: null,
		phpVersion: '8.2',
		plugins,
		themes: [ '.' ],
		config: {
			WP_DEBUG: true,
			WP_DEBUG_LOG: true,
			SCRIPT_DEBUG: true,
			WP_HOME: `http://127.0.0.1:${ E2E_WP_PORT }`,
			WP_SITEURL: `http://127.0.0.1:${ E2E_WP_PORT }`,
		},
		mappings: {
			'wp-content/mu-plugins/e2e-seed-endpoint.php': muPluginPath,
		},
		lifecycleScripts: {
			afterStart,
		},
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

	const configPath = path.join( projectRoot, WP_ENV_E2E_CONFIG );
	writeFileSync(
		configPath,
		`${ JSON.stringify( buildWpEnvConfig( resolvedPlugins ), null, '\t' ) }\n`,
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
