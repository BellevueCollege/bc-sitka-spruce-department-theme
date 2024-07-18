// WordPress webpack config.
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const { getWebpackEntryPoints } = require( '@wordpress/scripts/utils/config' );

// Plugins.
const RemoveEmptyScriptsPlugin = require( 'webpack-remove-empty-scripts' );

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

// Thanks to https://wordpress.org/support/topic/wordpress-scripts-not-building-both-blocks-and-index-js-simultaneously/
// The recommended method from WP didn't let blocks build correctly- this does!
const customSCSSPaths = Object.assign( {}, defaultConfig, {
	name: 'scss',
	entry: {
		...scssEntryPoint( 'main' ),
		...scssEntryPoint( 'editor' ),
		...scssEntryPoint( 'mayflower-blocks-alert', true ),
		...scssEntryPoint( 'mayflower-blocks-panel', true ),
		...scssEntryPoint( 'card', true ),
	}
} );

const customJSPaths = Object.assign( {}, defaultConfig, {
	name: 'scss',
	entry: {
		'js/main': path.resolve( process.cwd(), 'src/js', 'main.js' )
	}
} );

// Add any new entry points by extending the webpack config.
module.exports = [defaultConfig, customSCSSPaths, customJSPaths];