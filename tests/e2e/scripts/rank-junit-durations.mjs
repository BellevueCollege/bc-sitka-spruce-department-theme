/**
 * Print the slowest cases in a Playwright JUnit file.
 *
 * Used by Azure after the suites run. It does not skip or rewrite tests.
 * Durations decide later speed work only after a human reads this list.
 */
import { readFileSync } from 'node:fs';

const SLOWEST_CASE_COUNT = 15;

/**
 * @param {string} testCaseXml
 * @return {{ name: string, seconds: number }}
 */
function readTestCaseDuration( testCaseXml ) {
	const nameMatch = testCaseXml.match( /\bname="([^"]*)"/ );
	const timeMatch = testCaseXml.match( /\btime="([^"]*)"/ );
	const seconds = timeMatch ? Number( timeMatch[ 1 ] ) : 0;

	return {
		name: nameMatch ? nameMatch[ 1 ] : '(unnamed)',
		seconds: Number.isFinite( seconds ) ? seconds : 0,
	};
}

/**
 * @param {string} junitPath
 */
function printSlowestCases( junitPath ) {
	let xml;

	try {
		xml = readFileSync( junitPath, 'utf8' );
	} catch ( error ) {
		const message = error instanceof Error ? error.message : String( error );
		console.log( `[e2e] No JUnit file at ${ junitPath } (${ message }).` );
		return;
	}

	const cases = [ ...xml.matchAll( /<testcase\b[^>]*\/?>/g ) ]
		.map( ( match ) => readTestCaseDuration( match[ 0 ] ) )
		.sort( ( left, right ) => right.seconds - left.seconds )
		.slice( 0, SLOWEST_CASE_COUNT );

	console.log( `[e2e] Slowest ${ cases.length } cases in ${ junitPath }:` );

	for ( const testCase of cases ) {
		console.log( `  ${ testCase.seconds.toFixed( 1 ) }s  ${ testCase.name }` );
	}
}

const junitPaths = process.argv.slice( 2 );

if ( junitPaths.length === 0 ) {
	console.error( 'Usage: node tests/e2e/scripts/rank-junit-durations.mjs <junit.xml> [...]' );
	process.exit( 1 );
}

for ( const junitPath of junitPaths ) {
	printSlowestCases( junitPath );
}
