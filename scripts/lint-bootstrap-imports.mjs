/**
 * Fail the build when theme SCSS imports Bootstrap from the package root.
 *
 * Block styles must use the shared presets in bc-theme-layer-bs5. A raw
 * bootstrap/scss import pulls in the whole framework. Node is used so this
 * check runs on Windows, where grep is not on PATH.
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const scssRoot = path.join( process.cwd(), 'src', 'scss' );
const forbiddenImport = 'bootstrap/scss';

/**
 * @param {string} directory
 * @return {string|null} First file that contains the forbidden import.
 */
function findForbiddenBootstrapImport( directory ) {
	const entries = readdirSync( directory, { withFileTypes: true } );

	for ( const entry of entries ) {
		if ( entry.name === 'node_modules' ) {
			continue;
		}

		const entryPath = path.join( directory, entry.name );

		if ( entry.isDirectory() ) {
			const nestedMatch = findForbiddenBootstrapImport( entryPath );

			if ( nestedMatch ) {
				return nestedMatch;
			}

			continue;
		}

		const source = readFileSync( entryPath, 'utf8' );

		if ( source.includes( forbiddenImport ) ) {
			return entryPath;
		}
	}

	return null;
}

const matchingFile = findForbiddenBootstrapImport( scssRoot );

if ( matchingFile ) {
	console.error( `Forbidden ${ forbiddenImport } import in ${ matchingFile }` );
	process.exit( 1 );
}
