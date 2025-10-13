// WordPress webpack config.
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const { getWebpackEntryPoints } = require( '@wordpress/scripts/utils/config' );

// Utilities.
const path = require( 'path' );

// Remove empty JS stubs for style-only entries.
const RemoveEmptyScriptsPlugin = require( 'webpack-remove-empty-scripts' );

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

	// Keep WP defaults and then override only what we change.
	optimization: {
		...defaultConfig.optimization,
		// Use 'initial' to avoid interfering with CSS-only entries.
		splitChunks: {
			...defaultConfig.optimization.splitChunks,
			//chunks: 'initial',
			// Reasonable cache groups; enforce vendor extraction and reuse.
			cacheGroups: {
				...defaultConfig.optimization.splitChunks.cacheGroups,
				defaultVendors: {
					test: /[\\/]node_modules[\\/].*\.js$/,
					chunks: 'all',
					priority: -10,
					reuseExistingChunk: true,
					// enforce ensures a vendors chunk is created even if thresholds fluctuate.
					enforce: true,

				},
				// Optional: pull Bootstrap + Popper to their own vendor chunk for clarity.
				bootstrap: {
					test: /[\\/]node_modules[\\/](bootstrap|@popperjs[\\/]core)[\\/]/,
					chunks: 'all',
					priority: 20,
					reuseExistingChunk: true,
					enforce: true,
				},
				wordpress: {
					test: /[\\/]node_modules[\\/]@wordpress[\\/]/,
					chunks: 'all',
					priority: 15,
					reuseExistingChunk: true,
					enforce: true,
					name: 'wordpress-vendors',
				},
				default: {
					minChunks: 2,
					priority: -20,
					reuseExistingChunk: true,
				},
			},
		},
		// Optional caching improvement: separates webpack runtime (verify enqueue works in WP setup).
		runtimeChunk: {
			name: 'runtime', // More explicit than 'single'
		},
	},

	module: {
		...defaultConfig.module,
		rules: [
			...defaultConfig.module.rules,
			{
				test: /\.twig$/,
				loader: 'twig-loader',
			}
		],
	},

	plugins: [
		...( defaultConfig.plugins || [] ),
		// Keep asset manifests working: use the “after process” stage for WP pipelines.
		new RemoveEmptyScriptsPlugin( {
			stage: RemoveEmptyScriptsPlugin.STAGE_AFTER_PROCESS_PLUGINS,
		} ),
	],

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
		...scssEntryPoint( 'image', true ),
		...scssEntryPoint( 'bs-forms', true ),
		...scssEntryPoint( 'lmc-search', true ),
		// Add your custom JS entries
		'js/main': path.resolve( process.cwd(), 'src/js', 'main.js' ),
		'js/editor': path.resolve( process.cwd(), 'src/js', 'editor.js' ),
		'js/a11y-warnings': path.resolve( process.cwd(), 'src/js', 'a11y-warnings.js' ),
		'blocks/contact-selector/index': path.resolve( process.cwd(), 'src/blocks/contact-selector', 'style.scss' )
	}
};
