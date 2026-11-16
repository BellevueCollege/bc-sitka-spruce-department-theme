/**
 * Check that Playwright viewport projects collect the right tests.
 *
 * Does not run tests or start WordPress. Lists the same suites as CI
 * (functional excludes @visual; visual is @visual only) and fails when
 * tablet/mobile would run editor or @aria tests, when tablet/mobile would
 * run @desktop-only screenshots, or when desktop would run @narrow-only.
 */
import { spawnSync } from 'node:child_process';

const LIST_ARGS = [
	'wp-scripts',
	'test-playwright',
	'--list',
];

const ENV = {
	...process.env,
	PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '1',
	WP_BASE_URL: process.env.WP_BASE_URL ?? 'http://127.0.0.1:8889/e2e-dept',
};

/**
 * @param {string} grepFlag
 * @param {string} grepValue
 * @return {string}
 */
function listTests( grepFlag, grepValue ) {
	const result = spawnSync( 'npx', [ ...LIST_ARGS, grepFlag, grepValue ], {
		cwd: process.cwd(),
		env: ENV,
		encoding: 'utf8',
	} );

	if ( result.status !== 0 ) {
		console.error( result.stderr || result.stdout );
		process.exit( result.status ?? 1 );
	}

	return result.stdout;
}

/**
 * @param {string} listOutput
 * @param {RegExp} projectPattern
 * @return {string[]}
 */
function linesForProjects( listOutput, projectPattern ) {
	return listOutput
		.split( '\n' )
		.filter( ( line ) => projectPattern.test( line ) );
}

const functionalOutput = listTests( '--grep-invert', '@visual' );
const visualOutput = listTests( '--grep', '@visual' );

const narrowFunctional = linesForProjects(
	functionalOutput,
	/^\s+\[(tablet|mobile)\]/
);
const narrowVisual = linesForProjects(
	visualOutput,
	/^\s+\[(tablet|mobile)\]/
);

const violations = [];

for ( const line of narrowFunctional ) {
	if ( /@aria\b/i.test( line ) || /\bEditor\b/.test( line ) ) {
		violations.push( `Narrow functional collected desktop-only test: ${ line.trim() }` );
	}
}

for ( const line of narrowVisual ) {
	if ( /@desktop-only/.test( line ) ) {
		violations.push( `Narrow visual collected @desktop-only test: ${ line.trim() }` );
	}
}

const desktopNarrowOnly = linesForProjects(
	functionalOutput,
	/^\s+\[desktop\]/
).filter( ( line ) => /@narrow-only/.test( line ) );

for ( const line of desktopNarrowOnly ) {
	violations.push( `Desktop collected @narrow-only test: ${ line.trim() }` );
}

if ( violations.length > 0 ) {
	console.error( '[e2e] Viewport tag check failed:' );
	for ( const message of violations ) {
		console.error( `  - ${ message }` );
	}
	process.exit( 1 );
}

console.log( '[e2e] Viewport tag check passed.' );
process.exit( 0 );
