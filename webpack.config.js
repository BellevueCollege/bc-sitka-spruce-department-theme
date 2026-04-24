// WordPress webpack config.
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const { getWebpackEntryPoints } = require( '@wordpress/scripts/utils/config' );

// Utilities.
const path = require( 'path' );
const sass = require( 'sass-embedded' );

/**
 * Sass deprecation warnings to silence.
 * Bootstrap 5 uses deprecated @import syntax and global functions that cannot be fixed.
 * Custom code has been updated to use modern Sass module syntax.
 */
const SASS_DEPRECATION_SILENCE_LIST = [
	'legacy-js-api',
	'import',
	'color-functions',
	'if-function',
	'global-builtin',
];

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
	cache: {
		type: 'filesystem',
		buildDependencies: {
			config: [__filename],
		},
	},
	watchOptions: {
		ignored: [
			'**/node_modules',
			'**/logs',
			'**/reports',
			'**/.git',
			'**/vrt',
		],
		aggregateTimeout: 100, // Delay before rebuilding to batch changes (lowered for single file changes)
	},
	module: {
		...defaultConfig.module,
		rules: [
			...defaultConfig.module.rules.map( rule => {
				// Only modify SCSS rules that use sass-loader
				if ( ! ( rule.test && rule.test.test( '.scss' ) && rule.use ) ) {
					return rule;
				}

				// Check if this rule contains sass-loader
				const hasSassLoader = rule.use.some( loader =>
					( typeof loader === 'string' && loader.includes( 'sass-loader' ) ) ||
					( typeof loader === 'object' && loader.loader && loader.loader.includes( 'sass-loader' ) )
				);

				if ( ! hasSassLoader ) {
					return rule;
				}

				// Add silenceDeprecations to sass-loader options
				return {
					...rule,
					use: rule.use.map( loader => {
						const isSassLoader = ( typeof loader === 'string' && loader.includes( 'sass-loader' ) ) ||
							( typeof loader === 'object' && loader.loader && loader.loader.includes( 'sass-loader' ) );

						if ( ! isSassLoader ) {
							return loader;
						}

						if ( typeof loader === 'string' ) {
							return {
								loader,
								options: {
									implementation: sass,
									sassOptions: {
										silenceDeprecations: SASS_DEPRECATION_SILENCE_LIST,
									},
								},
							};
						}

						return {
							...loader,
							options: {
								...loader.options,
								implementation: sass,
								sassOptions: {
									...( loader.options?.sassOptions || {} ),
									silenceDeprecations: SASS_DEPRECATION_SILENCE_LIST,
								},
							},
						};
					} ),
				};
			} ),
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
