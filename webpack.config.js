// WordPress webpack config.
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const { getWebpackEntryPoints } = require( '@wordpress/scripts/utils/config' );

// Plugins.
const RemoveEmptyScriptsPlugin = require( 'webpack-remove-empty-scripts' );

// Utilities.
const path = require( 'path' );

// Thanks to https://wordpress.org/support/topic/wordpress-scripts-not-building-both-blocks-and-index-js-simultaneously/
// The recommended method from WP didn't let blocks build correctly- this does!
const customPaths = Object.assign( {}, defaultConfig, {
	name: 'scss',
	entry: {
		'css/main': path.resolve( process.cwd(), 'src/scss', 'main.scss' ),
	}
} );

// Add any new entry points by extending the webpack config.
module.exports = [defaultConfig, customPaths];