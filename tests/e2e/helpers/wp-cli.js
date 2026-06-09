import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import path from 'path';
import { isVisualDockerRun } from './visual-docker.js';

export const THEME_SLUG = 'bc-sitka-spruce-department-theme';
export const THEME_PATH = `/var/www/html/wp-content/themes/${ THEME_SLUG }`;

const projectRoot = process.cwd();
const wpEnvBin = path.join( projectRoot, 'node_modules', '.bin', 'wp-env' );

/**
 * Resolve the Playwright artifacts directory (absolute path).
 *
 * WP_ARTIFACTS_PATH may be absolute (Docker) or relative to the project root.
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
const visualDockerSeedsPath = path.join( artifactsPath, 'e2e-seeds' );

/**
 * Run a WP-CLI command in the wp-env tests environment.
 *
 * @param {string} command WP-CLI command without the leading `wp`.
 * @return {string}
 */
export function runTestsCli( command ) {
	if ( isVisualDockerRun() ) {
		throw new Error(
			'wp-env CLI cannot run inside the Playwright Docker container. ' +
				'Run npm run test:e2e:visual so host prep seeds data first.'
		);
	}

	const output = execSync( `"${ wpEnvBin }" run tests-cli ${ command }`, {
		encoding: 'utf8',
		cwd: projectRoot,
	} );

	return extractCommandOutput( output );
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
 * Read a JSON seed file written by writeVisualDockerSeedCaches on the host.
 *
 * @param {string} filename Seed filename under artifacts/e2e-seeds/.
 * @return {unknown}
 */
function readVisualDockerSeedCache( filename ) {
	const seedPath = path.join( visualDockerSeedsPath, filename );

	if ( ! existsSync( seedPath ) ) {
		throw new Error(
			`Missing seed cache ${ seedPath }. ` +
				'Run npm run test:e2e:visual so host prep writes seeds first.'
		);
	}

	return JSON.parse( readFileSync( seedPath, 'utf8' ) );
}

/**
 * Import the announcement-banner test image via wp-env tests-cli.
 *
 * @return {number}
 */
function importTestImageAttachment() {
	const result = runTestsCli(
		`wp media import ${ THEME_PATH }/tests/fixtures/test-image-260x174.png --porcelain`
	);
	return parseInt( result, 10 );
}

let cachedTestImageAttachmentId = null;
let cachedPostsFeatureSeed = null;
let cachedSiteChromeSeed = null;

/**
 * Upload the standard announcement-banner test image and return its attachment ID.
 *
 * @return {number}
 */
export function uploadTestImage() {
	if ( cachedTestImageAttachmentId !== null ) {
		return cachedTestImageAttachmentId;
	}

	if ( isVisualDockerRun() ) {
		const { attachmentId } = readVisualDockerSeedCache( 'test-image.json' );
		cachedTestImageAttachmentId = attachmentId;
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
 * Seed categories and posts for Posts Feature e2e tests.
 */
export function seedPostsFeatureData() {
	if ( cachedPostsFeatureSeed ) {
		return cachedPostsFeatureSeed;
	}

	if ( isVisualDockerRun() ) {
		cachedPostsFeatureSeed = readVisualDockerSeedCache( 'posts-feature.json' );
		return cachedPostsFeatureSeed;
	}

	const result = runTestsCli(
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

	if ( isVisualDockerRun() ) {
		cachedSiteChromeSeed = readVisualDockerSeedCache( 'site-chrome.json' );
		return cachedSiteChromeSeed;
	}

	const result = runTestsCli(
		`wp eval-file ${ THEME_PATH }/tests/fixtures/seed-site-chrome.php`
	);
	cachedSiteChromeSeed = JSON.parse( result );
	return cachedSiteChromeSeed;
}

/**
 * Write WP-CLI seed results to disk for Playwright-in-Docker visual runs.
 * Must run on the host before starting the Playwright container.
 */
export function writeVisualDockerSeedCaches() {
	mkdirSync( visualDockerSeedsPath, { recursive: true } );

	const attachmentId = importTestImageAttachment();
	writeFileSync(
		path.join( visualDockerSeedsPath, 'test-image.json' ),
		JSON.stringify( { attachmentId } )
	);

	const postsFeatureResult = runTestsCli(
		`wp eval-file ${ THEME_PATH }/tests/fixtures/seed-posts-feature.php`
	);
	writeFileSync(
		path.join( visualDockerSeedsPath, 'posts-feature.json' ),
		postsFeatureResult
	);

	const siteChromeResult = runTestsCli(
		`wp eval-file ${ THEME_PATH }/tests/fixtures/seed-site-chrome.php`
	);
	writeFileSync(
		path.join( visualDockerSeedsPath, 'site-chrome.json' ),
		siteChromeResult
	);
}
