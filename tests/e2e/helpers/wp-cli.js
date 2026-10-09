import { execSync, spawnSync } from 'child_process';
import { existsSync, unlinkSync, writeFileSync } from 'fs';
import path from 'path';
import {
	getMainSiteBaseUrl,
	getSubsiteBaseUrl,
	resolveWpEnvNodeEntryPath,
	WP_ENV_E2E_CONFIG,
} from './e2e-env.js';

export const THEME_SLUG = 'bc-sitka-spruce-department-theme';
export const THEME_PATH = `/var/www/html/wp-content/themes/${ THEME_SLUG }`;

const projectRoot = process.cwd();
const wpEnvNodeEntry = resolveWpEnvNodeEntryPath( projectRoot );

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

	const shellCommand = `"${ process.execPath }" "${ wpEnvNodeEntry }" run --config=${ WP_ENV_E2E_CONFIG } cli ${ wpCommand }`;

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

const ANNOUNCEMENT_BANNER_TEST_IMAGE_ALT =
	'E2E announcement banner test image';

/**
 * @param {number} attachmentId
 */
function setAnnouncementBannerTestImageAlt( attachmentId ) {
	if ( ! attachmentId ) {
		return;
	}

	const escapedAlt = ANNOUNCEMENT_BANNER_TEST_IMAGE_ALT.replace( /'/g, "'\\''" );
	runE2eCli(
		`wp post meta update ${ attachmentId } _wp_attachment_image_alt '${ escapedAlt }'`
	);
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
	const attachmentId = parseInt( result, 10 );
	setAnnouncementBannerTestImageAlt( attachmentId );
	return attachmentId;
}

let cachedTestImageAttachmentId = null;
let cachedPostsFeatureSeed = null;
let cachedSiteChromeSeed = null;
let cachedCoreSiteSeed = null;
let cachedIntegrationSeed = null;
/** @type {string|null} */
let cachedChromeVariantKey = null;
/** @type {{ variant: string, pageUrl: string }|null} */
let cachedChromeVariantResult = null;
/**
 * Upload the standard announcement-banner test image and return its attachment ID.
 *
 * @return {number}
 */
export function uploadTestImage() {
	if ( cachedTestImageAttachmentId !== null ) {
		setAnnouncementBannerTestImageAlt( cachedTestImageAttachmentId );
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
 * Toggle location and hours site options for homepage integration tests.
 *
 * @param {boolean} enabled Whether the location card is shown.
 */
export function applyLocationAndHours( enabled ) {
	runE2eCli(
		`wp eval "require '${ THEME_PATH }/tests/fixtures/e2e-seed-shared.php'; e2e_apply_location_and_hours( ${ enabled ? 'true' : 'false' }, (int) e2e_import_hero_attachment() ); echo wp_json_encode( array( 'enabled' => ${ enabled ? 'true' : 'false' } ) );"`
	);
}

/**
 * Configure header/footer ACF options for a chrome variant test.
 *
 * @param {'default'|'notice'|'sock'|'emailFooter'} variant
 * @return {{ variant: string, pageUrl: string }}
 */
export function seedChromeVariant( variant ) {
	if ( cachedChromeVariantKey === variant && cachedChromeVariantResult ) {
		return cachedChromeVariantResult;
	}

	const result = runE2eCli(
		`wp eval "require '${ THEME_PATH }/tests/fixtures/seed-chrome-variants.php'; echo wp_json_encode( e2e_chrome_variant_seed( '${ variant }' ) );"`
	);
	const parsed = JSON.parse( result );
	cachedChromeVariantKey = variant;
	cachedChromeVariantResult = parsed;
	return parsed;
}

const blockFrontendSeedRequestPath = path.join(
	projectRoot,
	'tests/fixtures/.e2e-block-seed-request.json'
);

/** @type {Record<string, Record<string, { pageUrl: string }>>} */
const cachedBlockFrontendPagesByBlock = {};

/**
 * Publish one page per block variant for frontend-only e2e tests.
 *
 * @param {string} blockName Full block name (e.g. bc-sitka-spruce/announcement-banner).
 * @param {Record<string, { attributes: Record<string, unknown> }>} variants
 * @return {Record<string, { pageUrl: string }>}
 */
export function seedBlockFrontendPages( blockName, variants ) {
	if ( cachedBlockFrontendPagesByBlock[ blockName ] ) {
		return cachedBlockFrontendPagesByBlock[ blockName ];
	}

	writeFileSync(
		blockFrontendSeedRequestPath,
		JSON.stringify( { blockName, variants } ),
		'utf8'
	);

	const result = runE2eCli(
		`wp eval-file ${ THEME_PATH }/tests/fixtures/seed-e2e-block-frontend-pages.php`
	);
	const parsed = JSON.parse( result );
	cachedBlockFrontendPagesByBlock[ blockName ] = parsed;
	return parsed;
}
