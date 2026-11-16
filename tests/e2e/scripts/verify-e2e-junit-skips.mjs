/**
 * Fail when Playwright JUnit reports unexpected skipped tests.
 *
 * Does not run tests. Read artifacts/junit after a CI-style run (CI=true).
 * Azure DevOps pass rate drops when tests are collected then skipped.
 * Governance may still skip when Trustees Agenda did not seed.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ALLOWED_SKIP_MESSAGE = 'Trustees Agenda plugin not available';

const DEFAULT_JUNIT_PATHS = [
	path.join( process.cwd(), 'artifacts', 'junit', 'functional-junit.xml' ),
	path.join( process.cwd(), 'artifacts', 'junit', 'visual-junit.xml' ),
];

/**
 * @param {string} junitXml
 * @return {Array<{ name: string, message: string, file: string }>}
 */
function findSkippedTestCases( junitXml ) {
	const skipped = [];
	const casePattern =
		/<testcase\b([^>]*>)([\s\S]*?)<\/testcase>/g;

	for ( const match of junitXml.matchAll( casePattern ) ) {
		const attributes = match[ 1 ];
		const body = match[ 2 ];
		if ( ! body.includes( '<skipped' ) ) {
			continue;
		}

		const nameMatch = attributes.match( /\bname="([^"]*)"/ );
		const skippedTag = body.match( /<skipped\b[^>]*>([\s\S]*?)<\/skipped>/ );
		const message = skippedTag
			? skippedTag[ 1 ].replace( /\s+/g, ' ' ).trim()
			: '';

		skipped.push( {
			name: nameMatch ? nameMatch[ 1 ] : '(unnamed)',
			message,
		} );
	}

	return skipped;
}

/**
 * @param {string} junitPath
 * @return {Array<{ name: string; message: string; file: string }>}
 */
function readUnexpectedSkips( junitPath ) {
	let xml;

	try {
		xml = readFileSync( junitPath, 'utf8' );
	} catch {
		return [];
	}

	return findSkippedTestCases( xml )
		.filter( ( entry ) => ! entry.message.includes( ALLOWED_SKIP_MESSAGE ) )
		.map( ( entry ) => ( { ...entry, file: junitPath } ) );
}

const junitPaths =
	process.argv.length > 2 ? process.argv.slice( 2 ) : DEFAULT_JUNIT_PATHS;

const unexpected = junitPaths.flatMap( readUnexpectedSkips );

if ( unexpected.length === 0 ) {
	console.log(
		'[e2e] No unexpected skipped tests in JUnit (Governance allowlist only).'
	);
	process.exit( 0 );
}

console.error( '[e2e] Unexpected skipped tests (fix viewport tags or seeds):' );
for ( const entry of unexpected ) {
	console.error( `  - ${ entry.name }` );
	if ( entry.message ) {
		console.error( `    ${ entry.message }` );
	}
	console.error( `    (${ entry.file })` );
}

process.exit( 1 );
