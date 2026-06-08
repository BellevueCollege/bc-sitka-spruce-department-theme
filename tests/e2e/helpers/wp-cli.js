import { execSync } from 'child_process';
import path from 'path';

export const THEME_SLUG = 'bc-sitka-spruce-department-theme';
export const THEME_PATH = `/var/www/html/wp-content/themes/${THEME_SLUG}`;

const projectRoot = process.cwd();
const wpEnvBin = path.join( projectRoot, 'node_modules', '.bin', 'wp-env' );

/**
 * Run a WP-CLI command in the wp-env tests environment.
 */
export function runTestsCli( command ) {
	const output = execSync( `"${ wpEnvBin }" run tests-cli ${ command }`, {
		encoding: 'utf8',
		cwd: projectRoot,
	} );

	return extractCommandOutput( output );
}

/**
 * wp-env prefixes CLI output with status text; keep the meaningful line(s).
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
 * Upload the standard announcement-banner test image and return its attachment ID.
 */
export function uploadTestImage() {
	const result = runTestsCli(
		`wp media import ${ THEME_PATH }/tests/fixtures/test-image-260x174.png --porcelain`
	);
	return parseInt( result, 10 );
}

let cachedPostsFeatureSeed = null;

/**
 * Seed categories and posts for Posts Feature e2e tests.
 */
export function seedPostsFeatureData() {
	if ( cachedPostsFeatureSeed ) {
		return cachedPostsFeatureSeed;
	}

	const result = runTestsCli(
		`wp eval-file ${ THEME_PATH }/tests/fixtures/seed-posts-feature.php`
	);
	cachedPostsFeatureSeed = JSON.parse( result );
	return cachedPostsFeatureSeed;
}
