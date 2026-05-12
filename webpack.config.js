// WordPress webpack config.
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const { getWebpackEntryPoints } = require( '@wordpress/scripts/utils/config' );

// Utilities.
const path = require( 'path' );

/**
 * Defines the entry point for compiling SCSS files based on the handle provided.
 *
 * @param {string} handle - The handle of the SCSS file.
 * @param {boolean} block - Flag indicating whether it's a block SCSS file.
 * @return {object} An object with the compiled SCSS file path based on the handle.
 */
const scssEntryPoint = ( handle, block = false ) => {
	if ( block ) {
		return {
			[`css/blocks/${handle}`]: path.resolve( process.cwd(), 'src/scss/blocks', `${handle}.scss` ),
		}
	}

	return {
		[`css/${handle}`]: path.resolve( process.cwd(), 'src/scss', `${handle}.scss` ),
	}
}

// Override default config
module.exports = {
	...defaultConfig,
	name: 'custom',
	module: {
		...defaultConfig.module,
		rules: [
			...defaultConfig.module.rules,
			{
				test: /\.twig$/,
				type: 'asset/source',
			}
		],
	},
	entry: {
		// Call defaultConfig.entry() as a function to get auto-detected block.json entries
		...( typeof defaultConfig.entry === 'function' ? defaultConfig.entry() : defaultConfig.entry ),
		// Add your custom SCSS entries
		...scssEntryPoint( 'main' ),
		...scssEntryPoint( 'editor' ),
		...scssEntryPoint( 'alert', true ),
		...scssEntryPoint( 'nav', true ),
		...scssEntryPoint( 'tabs', true ),
		...scssEntryPoint( 'tabcordion-list', true ),
		...scssEntryPoint( 'table', true ),
		...scssEntryPoint( 'tablepress', true ),
		...scssEntryPoint( 'quote', true ),
		...scssEntryPoint( 'bs-forms', true ),
		...scssEntryPoint( 'lmc-search', true ),
		// Add your custom JS entries
		'js/main': path.resolve( process.cwd(), 'src/js', 'main.js' ),
		'js/editor': path.resolve( process.cwd(), 'src/js', 'editor.js' ),
		'js/a11y-warnings': path.resolve( process.cwd(), 'src/js', 'a11y-warnings.js' ),
		'blocks/contact-selector/index': path.resolve( process.cwd(), 'src/blocks/contact-selector', 'style.scss' )
	}
};
