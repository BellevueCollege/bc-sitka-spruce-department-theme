// WordPress webpack config.
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const { getWebpackEntryPoints } = require( '@wordpress/scripts/utils/config' );

// Plugins.
const RemoveEmptyScriptsPlugin = require( 'webpack-remove-empty-scripts' );

// Utilities.
const path = require( 'path' );

// Modify DefaultConfig to add new rules
defaultConfig.module.rules.push( {
	test: /\.twig$/,
	loader: 'twig-loader',
} );

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



// Thanks to https://wordpress.org/support/topic/wordpress-scripts-not-building-both-blocks-and-index-js-simultaneously/
// The recommended method from WP didn't let blocks build correctly- this does!
const customPaths = Object.assign( {}, defaultConfig, {
	name: 'paths',
	entry: {
		...scssEntryPoint( 'main' ),
		...scssEntryPoint( 'editor' ),
		...scssEntryPoint( 'alert', true ),
		...scssEntryPoint( 'nav', true ),
		...scssEntryPoint( 'tabs', true ),
		...scssEntryPoint( 'tabcordion-list', true ),
		...scssEntryPoint( 'table', true ),
		...scssEntryPoint( 'tablepress', true ),
		'js/main': path.resolve( process.cwd(), 'src/js', 'main.js' ),
		'js/editor': path.resolve( process.cwd(), 'src/js', 'editor.js' ),
		'blocks/contact-selector/index': path.resolve( process.cwd(), 'src/blocks/contact-selector', 'style.scss' )
	},
} );


// Add any new entry points by extending the webpack config.
module.exports = [defaultConfig, customPaths];
