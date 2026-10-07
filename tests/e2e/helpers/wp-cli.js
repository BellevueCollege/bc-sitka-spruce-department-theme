import { execSync, spawnSync } from 'child_process';
import { existsSync, unlinkSync } from 'fs';
import path from 'path';
import {
	getMainSiteBaseUrl,
	getSubsiteBaseUrl,
	WP_ENV_E2E_CONFIG,
} from './e2e-env.js';

export const THEME_SLUG = 'bc-sitka-spruce-department-theme';
export const THEME_PATH = `/var/www/html/wp-content/themes/${ THEME_SLUG }`;

const projectRoot = process.cwd();
const wpEnvBin = path.join( projectRoot, 'node_modules', '.bin', 'wp-env' );

const DEFAULT_CLI_SITE_URL = getSubsiteBaseUrl();

/**
 * Resolve the Playwright artifacts directory (absolute path).
 *
 * @return {string}
 */
function resolveArtifactsPath() {
	const configuredPath = process.env.WP_ARTIFACTS_PATH || 'artifacts';

	return path.isAbsolute( configuredPath )
		? configuredPath
		: path.join( projectRoot, configuredPath );
}

const artifactsPath = resolveArtifactsPath();
const adminStorageStatePath = path.join( artifactsPath, 'storage-states', 'admin.json' );

const WP_ENV_BOOT_RETRY_LIMIT = 30;
const WP_ENV_BOOT_RETRY_DELAY_MS = 2_000;

/**
 * Block until wp-env may have finished booting (cross-platform).
 */
function waitForWpEnvBootRetry() {
	const seconds = Math.max( 1, Math.ceil( WP_ENV_BOOT_RETRY_DELAY_MS / 1000 ) );

	if ( process.platform === 'win32' ) {
		spawnSync( 'ping', [ '127.0.0.1', '-n', String( seconds + 1 ) ], {
			stdio: 'ignore',
		} );
		return;
	}

	spawnSync( 'sleep', [ String( seconds ) ], { stdio: 'ignore' } );
}

/**
 * @param {import('child_process').SpawnSyncReturns<string>} result
 * @return {boolean}
 */
function isWpEnvNotInitialized( result ) {
	const combined = `${ result.stdout || '' }\n${ result.stderr || '' }`;
	return combined.includes( 'Environment not initialized' );
}

/**
 * Run a WP-CLI command in the e2e wp-env environment.
 *
 * @param {string} command WP-CLI command without the leading `wp`.
 * @param {{ url?: string }} [options]
 * @return {string}
 */
export function runE2eCli( command, options = {} ) {
	const siteUrl = options.url ?? DEFAULT_CLI_SITE_URL;
	const wpCommand = command.includes( '--url=' )
		? command
		: `${ command } --url=${ siteUrl }`;

	const shellCommand = `"${ wpEnvBin }" run --config=${ WP_ENV_E2E_CONFIG } cli ${ wpCommand }`;

	for ( let attempt = 1; attempt <= WP_ENV_BOOT_RETRY_LIMIT; attempt++ ) {
		try {
			const output = execSync( shellCommand, {
				encoding: 'utf8',
				cwd: projectRoot,
			} );
			return extractCommandOutput( output );
		} catch ( error ) {
			const execError = /** @type {Error & { stdout?: string, stderr?: string }} */ (
				error
			);
			const failure = {
				status: 1,
				stdout: execError.stdout || '',
				stderr: execError.stderr || execError.message,
			};

			if (
				isWpEnvNotInitialized( failure ) &&
				attempt < WP_ENV_BOOT_RETRY_LIMIT
			) {
				waitForWpEnvBootRetry();
				continue;
			}

			throw new Error(
				failure.stderr?.trim() ||
					failure.stdout?.trim() ||
					'wp-env CLI command failed.'
			);
		}
	}

	throw new Error( 'wp-env CLI did not become ready for seeding.' );
}

/**
 * wp-env prefixes CLI output with status text; keep the meaningful line(s).
 *
 * @param {string} output Raw CLI stdout.
 * @return {string}
 */
function extractCommandOutput( output ) {
	const lines = output
		.split( '\n' )
		.map( ( line ) => line.trim() )
		.filter( Boolean );

	const jsonLine = lines.find( ( line ) => line.startsWith( '{' ) );
	if ( jsonLine ) {
		return jsonLine;
	}

	const numericLine = lines.find( ( line ) => /^\d+$/.test( line ) );
	if ( numericLine ) {
		return numericLine;
	}

	return lines[ lines.length - 1 ] ?? '';
}

/**
 * Import the announcement-banner test image via wp-env CLI.
 *
 * @return {number}
 */
function importTestImageAttachment() {
	const result = runE2eCli(
		`wp media import ${ THEME_PATH }/tests/fixtures/test-image-260x174.png --porcelain`
	);
	return parseInt( result, 10 );
}

let cachedTestImageAttachmentId = null;
let cachedPostsFeatureSeed = null;
let cachedSiteChromeSeed = null;
let cachedCoreSiteSeed = null;
let cachedIntegrationSeed = null;
/**
 * Upload the standard announcement-banner test image and return its attachment ID.
 *
 * @return {number}
 */
export function uploadTestImage() {
	if ( cachedTestImageAttachmentId !== null ) {
		return cachedTestImageAttachmentId;
	}

	cachedTestImageAttachmentId = importTestImageAttachment();
	return cachedTestImageAttachmentId;
}

/**
 * Remove cached admin auth so globalSetup refreshes REST credentials.
 */
export function clearAdminStorageState() {
	if ( existsSync( adminStorageStatePath ) ) {
		unlinkSync( adminStorageStatePath );
	}
}

/**
 * Seed main-site CPT content for core-site blocks.
 *
 * @return {Record<string, unknown>}
 */
export function seedCoreSiteData() {
	if ( cachedCoreSiteSeed ) {
		return cachedCoreSiteSeed;
	}

	const result = runE2eCli(
		`wp eval-file ${ THEME_PATH }/tests/fixtures/seed-e2e-core-site.php`,
		{ url: getMainSiteBaseUrl() }
	);
	cachedCoreSiteSeed = JSON.parse( result );
	return cachedCoreSiteSeed;
}

/**
 * Seed categories and posts for Posts Feature e2e tests.
 *
 * @return {unknown}
 */
export function seedPostsFeatureData() {
	if ( cachedPostsFeatureSeed ) {
		return cachedPostsFeatureSeed;
	}

	const result = runE2eCli(
		`wp eval-file ${ THEME_PATH }/tests/fixtures/seed-posts-feature.php`
	);
	cachedPostsFeatureSeed = JSON.parse( result );
	return cachedPostsFeatureSeed;
}

/**
 * Seed menus, ACF Site Options, and a test page for header/footer e2e tests.
 *
 * @return {{ pageUrl: string, mainMenuTopLevelLabels: string[], mainMenuChildLabel: string, ctaMenuLabels: string[], phoneDisplay: string, siteTitle: string, addressLine: string }}
 */
export function seedSiteChromeData() {
	if ( cachedSiteChromeSeed ) {
		return cachedSiteChromeSeed;
	}

	const result = runE2eCli(
		`wp eval-file ${ THEME_PATH }/tests/fixtures/seed-site-chrome.php`
	);
	cachedSiteChromeSeed = JSON.parse( result );
	return cachedSiteChromeSeed;
}

/**
 * Seed page integration fixtures (homepages, templates, governance).
 *
 * @return {Record<string, unknown>}
 */
export function seedIntegrationData() {
	if ( cachedIntegrationSeed ) {
		return cachedIntegrationSeed;
	}

	seedCoreSiteData();

	const result = runE2eCli(
		`wp eval-file ${ THEME_PATH }/tests/fixtures/seed-e2e-integration.php`
	);
	cachedIntegrationSeed = JSON.parse( result );
	return cachedIntegrationSeed;
}

/**
 * Set which homepage is the static front page for integration tests.
 *
 * @param {'dept'|'div'|'suppt'} variant
 * @return {{ siteType: string, pageUrl: string }}
 */
export function applyHomepageVariant( variant ) {
	const result = runE2eCli(
		`wp eval "require '${ THEME_PATH }/tests/fixtures/e2e-homepage-variant.php'; echo wp_json_encode( e2e_apply_homepage_variant( '${ variant }' ) );"`
	);
	return JSON.parse( result );
}

/**
 * Configure header/footer ACF options for a chrome variant test.
 *
 * @param {'default'|'notice'|'sock'|'emailFooter'} variant
 * @return {{ variant: string, pageUrl: string }}
 */
export function seedChromeVariant( variant ) {
	const result = runE2eCli(
		`wp eval "require '${ THEME_PATH }/tests/fixtures/seed-chrome-variants.php'; echo wp_json_encode( e2e_chrome_variant_seed( '${ variant }' ) );"`
	);
	return JSON.parse( result );
}
