<?php
namespace BcSitkaSpruce;
// Make Timber available.
use Timber;
use BcSitkaSpruce\Library\Theme;

// Load Composer dependencies.
require_once __DIR__ . '/vendor/autoload.php';

// Initialize Timber.
Timber\Timber::init();

// Register Global Timber Context Variables
add_filter('timber/context', function ($context) {
	$context['current_year'] = date('Y');

	return $context;
});

/**
 * Register Menus
 */
$menus = Theme::menus();
$menus->addMenu( 'main-menu', __( 'Main Menu', 'bc-sitka-spruce' ) );
$menus->addMenu( 'cta-menu', __( 'Call-to-Action Menu', 'bc-sitka-spruce' ) );

/**
 * Register Blocks
 *
 * Any blocks that are part of the theme should be registered here.
 */
function register_blocks() {
	$blocks = array(
		'differentiator-section',
		'differentiator-section/differentiator',
		'contact-selector',
		'content-and-location',
		'template-homepage',
		'hero-image',
		'card-section',
		'card-section/card-section-card',
		'tabcordion',
		'tabcordion/tabcordion-list',
		'tabcordion/tabcordion-list-tab',
		'tabcordion/tabcordion-content',
		'tabcordion/tabcordion-content-panel',
		'application-steps-tabs',
		'application-steps-tabs/application-step-single',
		'application-steps-tabs/application-step-single-content',
		'callout',
		'tabs-section',
		'news-feature-core',
		'testimonial-section',
		'announcement-banner',
		'support-feature',
		'department-feature',
		'accordion-section',
		'accordion-section/accordion-section-content',
		'media-gallery-section',
		'listing-section',
		'listing-section/listing-section-list-item',
		'listing-section/listing-section-list-item-links',
		'course-information-section',
		'course-information-section/course-information-section-content',
		'narrow-content',
		'body-section',
		'body-section/body-section-content',
		'profiles-section',
		'template-program-info',
		'degrees-certificates-section',
		'checkerboard-section',
		'bio-section',
		'bio-section/bio-section-content',
	);

	// Only register posts feature block if posts are enabled
	if ( get_option( 'options_enable_posts') ) {
		$blocks[] = 'posts-feature';
	}

	// Register Blocks
	block_registration_helper( $blocks );
}
add_action( 'init', __NAMESPACE__ . '\register_blocks' );

/**
 * Helper Function for Registering Blocks
 *
 * TODO: Move this to a helper function file
 */
function block_registration_helper( array $blocks ) {
	$block_path = get_template_directory() . '/assets/dist/blocks/';
	foreach ( $blocks as $block ) {
		$block = $block_path . $block;
		register_block_type( $block );
	}
}


$enqueuer = Theme::enqueuer();
$enqueuer->addStyle( handle: 'bc-sitka-spruce-main', src: '/assets/dist/css/main.asset.php', use_asset_file: true );
$enqueuer->addStyle( handle: 'bc-sitka-spruce-mainjsassets', src: '/assets/dist/js/main.asset.php', use_asset_file: true );
$enqueuer->addStyle( handle: 'bc-sitka-spruce-fonts', src: '//use.typekit.net/vln2gpg.css' );

$enqueuer->addScript( handle: 'bc-sitka-spruce-main-js', src: '/assets/dist/js/main.asset.php', use_asset_file: true );

if ( current_user_can( 'edit_posts' ) ) {
	$enqueuer->addScript( handle: 'bc-sitka-spruce-a11y-warnings', src: '/assets/dist/js/a11y-warnings.asset.php', use_asset_file: true );
}

// Enqueue Script in Block Editor to Handle Automated Block Insertion Etc
add_action( 'enqueue_block_editor_assets', function () {
	$asset = include get_parent_theme_file_path( '/assets/dist/js/editor.asset.php' );
	wp_enqueue_script(
		'sitka-editor-js',
		get_template_directory_uri() . '/assets/dist/js/editor.js',
		array_unique( array_merge( array( 'wp-blocks', 'wp-dom-ready', 'wp-edit-post' ) , $asset['dependencies'] ) ),
		$asset['version']
	);
} );

// Enqueue Block Styles
$enqueuer->addBlockStyle(
	handle: 'nav',
	blocks: array(
		'mayflower-blocks/tabs',
	)
);

$enqueuer->addBlockStyle(
	handle: 'tabs',
	blocks: array(
		'mayflower-blocks/tabs',
	),
	dependencies: array(
		'bc-sitka-spruce-style-nav',
	)
);
$enqueuer->addBlockStyle(
	handle: 'table',
	blocks: array(
		'core/table',
		'mayflower-blocks/tablepress',
		'tablepress/table',
	)
);
$enqueuer->addBlockStyle(
	handle: 'tablepress',
	blocks: array(
		'mayflower-blocks/tablepress',
		'tablepress/table',
	)
);
$enqueuer->addBlockStyle(
	handle: 'alert',
	blocks: array(
		'mayflower-blocks/alert',
	)
);
$enqueuer->addBlockStyle(
	handle: 'tabcordion-list',
	blocks: array(
	)
);

$enqueuer->addBlockStyle(
	handle: 'quote',
	blocks: array(
		'core/quote',
	)
);

$enqueuer->addBlockStyle(
	handle: 'image',
	blocks: array(
		'core/image',
		'core/media-text',
	)
);

$enqueuer->addBlockStyle(
	handle: 'bs-forms',
	blocks: array(
		'lmc-search-plugin/lmc-search-block',
	)
);

$enqueuer->addBlockStyle(
	handle: 'lmc-search',
	blocks: array(
		'lmc-search-plugin/lmc-search-block',
	)
);
/**
 * Image Crops
 */
/**
 * Add image sizes.
 */
$image_crops = Theme::imageCrops();

// Homepage Hero Images

// Division Sizing
$image_crops->addImageSize( 'featured-home-div-lg', 2880, 1000, true );
$image_crops->addImageSize( 'featured-home-div-md', 1440, 500, true );

// Department Sizing
$image_crops->addImageSize( 'featured-home-dept-lg', 2720, 1000, true );
$image_crops->addImageSize( 'featured-home-dept-md', 1360, 500, true );

// Support Unit Sizing - no larger size needed, as it is not dependent on the screen size
$image_crops->addImageSize( 'featured-home-suppt', 1160, 500, true );

$image_crops->addImageSize( 'featured-page', 560, 440, true );


// Card Header Image
$image_crops->addImageSize( 'card-header', 360, 200, true );

$image_crops->addImageSize( 'testimonial', 560, 680, true );

$image_crops->addImageSize( 'announcement-banner', 260, 174, false );

$image_crops->addImageSize( 'homepage-location', 360, 218, true );

$image_crops->addImageSize( 'sock-location', 300, 200, true );

$image_crops->addImageSize( 'sock-admissions-contact', 360, 240, true );

$image_crops->addImageSize( 'media-gallery-image', 600, 550, true );

$image_crops->addImageSize( 'listing-section', 360, 240, true );

// Profile Detail Overview Image Sizing
$image_crops->addImageSize( 'profile-overview-image', 460, 460, true );

$image_crops->addImageSize( 'profile-list-image', 260, 260, true );
// Checkerboard Image
$image_crops->addImageSize( 'checkerboard', 660, 550, true );

// Post Image Sizing
// Used on Post Single and Feature Block
$image_crops->addImageSize( 'post-horiz-lg', 760, 400, true );
// Used on Post Single
$image_crops->addImageSize( 'post-vert-lg', 460, 700, true );

// Used on listing page
$image_crops->addImageSize( 'post-horiz-sm', 260, 137, true );
$image_crops->addImageSize( 'post-vert-sm', 100, 150, true );


// Make some image sizes available in the block editor
add_filter(
	'image_size_names_choose',
	function ( $sizes ) {
		return array_merge(
			$sizes,
			array(
				'card-header' => __( 'Card Header Image', 'bc-sitka-spruce' ),
				'listing-section' => __( 'Listing Section Image', 'bc-sitka-spruce' ),
				'homepage-location' => __( 'Homepage Location Image', 'bc-sitka-spruce' ),
			)
		);
	}
);

/**
 * Load Block Editor Styles
 */
$block_editor = Theme::blockEditor();
$block_editor->addStylesheet( 'editor', 'assets/dist/css/editor.css' );
$block_editor->useGlobally( true );


/**
 * Register Block Pattern Categories
 */
add_action( 'init', function () {
	register_block_pattern_category(
		'sitka-homepage-patterns',
		array(
			'label' => __('Homepage Patterns', 'bc-sitka-spruce'),
		)
	);

	register_block_pattern_category(
		'sitka-page-patterns',
		array(
			'label' => __('Page Patterns', 'bc-sitka-spruce'),
		)
	);
});

/**
 * Disable 'Hide from Navigation' option for non super-admins
 */
add_filter( 'acf/prepare_field/name=hide_from_side_nav', function( $field ) {

	// Only allow administrators to edit
	if ( ! current_user_can( 'manage_network' ) ) {
		return false;
	}
	return $field;
} );

/**
 * Set Page Title Format
 */
/**
 * Output optimized document titles
 *
 * Uses WordPress 4.1+ title framework
 *
 * @param array $title_parts Page title parts.
 * @global $post
 */

add_filter( 'document_title_parts', function( $title_parts ) {
	global $post;

	if ( is_front_page() ) {
		$title_parts['tagline'] = '';
		$title_parts['site']    = __( 'Bellevue College', 'bc-sitka-spruce' );
	}
	// Output custom title if available.
	$post_meta_data = get_post_custom( $post->ID ?? null );
	return $title_parts;
}, 10, 1 );

// SEO Framework Plugin Overrides to Preserve Title Format by Default
add_filter(
	'the_seo_framework_default_site_options',
	function ( $options ) {
		$options['author_noindex'] = 1;
		$options['paged_noindex']  = 1;
		$options['homepage_title_tagline'] = 'Bellevue College';
		$options['knowledge_output'] = 0;
		$options['ld_json_searchbox'] = 0;
		$options['sitemap_styles'] = 0;
		$options['sitemap_logo'] = 0;
		return $options;
	},
	10,
	1
);
/** Set Page Title Separator */
add_filter( 'document_title_separator', function( $sep ) {
	return ' - ';
}, 10, 1 );

// Use Summary or Intro as description by default
// Inspired by https://gist.github.com/sybrew/299ad19597f974c89b1564316297c1ed
add_filter( 'the_seo_framework_generated_description', function( $description, $context ) {
	// If ACF isn't activated, don't do anything.
	if ( ! function_exists( 'get_field' ) ) return $description;

	// Check if an ID is available in context
	if ( ! isset( $context['id'] ) ) return $description;

	// If an Intro Text is available, return it.
	if ( get_field( 'intro_text', $context['id'] ) && "" !== get_field( 'intro_text', $context['id'] ) ) {
		return get_field( 'intro_text', $context['id'] );
	}

	// If a Summary is available, return it (used on Posts)
	if ( get_field( 'summary', $context['id'] ) && "" !== get_field( 'summary', $context['id'] ) ) {
		return get_field( 'summary', $context['id'] );
	}

	// Fall back to normal
	return $description;
}, 10, 2 );

/* SEO Title Handling Fix */

 /* Enable SEO Framework support for 'profile' post type */
 add_filter('the_seo_framework_supported_post_types', function ($post_types) {
    $post_types[] = 'profile';
    return array_unique($post_types);
});

/* Allow SEO title generation for 'profile' post type even if context is incomplete */
add_filter('the_seo_framework_title_from_generation', function ($post_title, $args)  {
    if (empty($args['id']) && is_singular('profile')) {
        global $post;
        if ($post && get_post_type($post) === 'profile') {
            $args['id'] = $post->ID;
			$first = get_field('first_name', $args['id']);
			$last  = get_field('last_name', $args['id']);
			$role  = get_field('position_role', $args['id']);

			if ($first && $last && $role) {
				return "{$last}, {$first} – {$role}";
			}
        }
    }
    return $post_title;
}, 10, 2);

/**
 * Prevent Unlocking of Locked Blocks by non-Super Admins
 *
 * Thanks to https://fullsiteediting.com/how-to-lock-blocks-and-templates/
 */
add_filter(
	'block_editor_settings_all',
	static function ( $settings, $context ) {
		// Allow for the Editor role and above.
		$settings['canLockBlocks'] = current_user_can( 'manage_network' );

		// Only enable for specific user(s).
		// $user = wp_get_current_user();
		// if ( in_array( $user->user_email, array( 'user@example.com' ), true ) ) {
		//  $settings['canLockBlocks'] = false;
		// }

		// Disable for posts/pages.
		// if ( $context->post && $context->post->post_type === 'page' ) {
		//  $settings['canLockBlocks'] = false;
		// }

		return $settings;
	},
	10,
	2
);


/**
 * Custom API Endpoints
 *
 * Register custom API endpoints
 */

/**
 * Register /options endpoint
 */
add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			'bc-sitka-spruce/v1',
			'/options',
			array(
				'methods'             => 'GET',
				'callback'            => __NAMESPACE__ . '\rest_get_options',
				'permission_callback' => function () {
					return current_user_can( 'edit_posts' );
				},
			)
		);
	}
);

/**
 * Register /site-info endpoint
 */
add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			'bc-sitka-spruce/v1',
			'/site-info',
			array(
				'methods'             => 'GET',
				'callback'            => __NAMESPACE__ . '\rest_get_site_info',
				'permission_callback' => '__return_true',
			)
		);
	}
);

/**
 * Get Options Callback
 *
 * Callback for /options endpoint
 *
 * @param WP_REST_Request $request
 * @return WP_REST_Response|WP_Error
 */

function rest_get_options( $request ) {
	if ( ! current_user_can( 'edit_posts' ) ) {
		return new \WP_Error( 'rest_forbidden', 'Sorry, you are not allowed to access this resource.', array( 'status' => rest_authorization_required_code() ) );
	}
	$options                          = array();
	$options['display_location_card'] = get_field( 'display_location_card', 'option' );
	$options['location_image']        = get_field( 'location_image', 'option' );
	$options['location']              = get_field( 'location', 'option' );
	$options['hours']                 = get_field( 'hours', 'option' );
	$options['contact_page_url']      = get_field( 'contact_page_url', 'option' );
	return new \WP_REST_Response( $options, 200 );
}

/**
 * Get Site Info Callback
 */

function rest_get_site_info( $request ) {
	$site_info = array(
		'site_url' => get_bloginfo( 'url' ),
		'network_url' => network_site_url(),
	);
	return new \WP_REST_Response( $site_info, 200 );
}

/**
 * Filter Body Class to add Site Type
 */
add_filter(
	'body_class',
	function ( $classes ) {
		$site_type = get_field( 'site_type', 'option' ) ?? 'dept';
		$classes[] = 'site-type-' . $site_type;
		return $classes;
	}
);


/**
 * Add Block Wrapper to Root Blocks with Alignment and Width Classes
 *
 */
add_filter(
	'render_block',
	function ( $block_content, $block, $instance ) {

		// Blocks that should not be wrapped. Matches against the beginning of the block name,
		// so partial matches are allowed.
		$allowlisted_blocks = array(
			'bc-sitka-spruce/',
		);

		// Do not wrap non-root blocks, or blocks that are empty
		if ( ! $block['sitka_is_at_root'] || empty( $block_content ) || ctype_space( $block_content ) ) {
			return $block_content;
		}

		// Do not wrap blocks that are in the allowlist.
		if ( isset( $block['blockName'] ) ) {
			foreach ( $allowlisted_blocks as $allowlisted_block ) {
				if ( str_starts_with( $block['blockName'], $allowlisted_block ) ) {
					return $block_content;
				}
			}
		}

		// Add alignment and width classes.
		if ( ! isset( $block['attrs']['align'] ) ) {
			$classes = 'alignstandard';
		} elseif ( 'wide' === $block['attrs']['align'] ) {
			$classes = 'alignwide';
		} elseif ( 'full' === $block['attrs']['align'] ) {
			$classes = 'alignfull';
		} elseif ( 'right' === $block['attrs']['align'] ) {
			$classes = 'alignright alignstandard';
		} elseif ( 'center' === $block['attrs']['align'] ) {
			$classes = 'aligncenter';
		} else {
			$classes = 'alignstandard';
		}

		// Debugging helper: Print block data after each block
		// $block_content .= '<pre>' . print_r( $block, true ) . '</pre>';

		// Return wrapped block
		return "<div class=\"block-wrapper $classes\">$block_content</div>";
	},
	10,
	3
);

/**
 * Allow Root Blocks to be Identified
 *
 * Add 'sitka_is_at_root' property to block data objects, which will be true or false
 * depending on if the block is at the root of the block editor (not inside another block).
 */
add_filter(
	'render_block_data',
	function ( $parsed_block, $source_block, $parent_block ) {
		$parsed_block['sitka_is_at_root'] = $parent_block ? false : true;
		return $parsed_block;
	},
	10,
	3
);

/*
 * Custom Post Type Functionality
 */

/**
 * Filter Program post type registration to add templates etc
 *
 */

add_filter( 'register_program_post_type_args', function ( $args ) {
	$args['template'] = array(
		array(
			'bc-sitka-spruce/template-program-info',
			array(
				'lock' => array(
					'move' => true,
					'remove' => true,
				),
			)
		)
		);
	return $args;
} );

/**
 * Filter Profile post type registration to add templates etc
 *
 */

add_filter( 'register_profile_post_type_args', function ( $args ) {
	$args['template'] = array(
		array(
			'bc-sitka-spruce/bio-section',
			array(
				'lock' => array(
					'move' => true,
					'remove' => false,
				),
			)
		)
		);
	return $args;
} );


/**
  * Profile Post Type
*/

/**
 * Auto-Generate Post Title on Save
 *
 * @param string $title
 */
add_filter( 'wp_insert_post_data', function( $data , $postarr ) {
	global $post;

	if ( 'profile' === $data['post_type'] && isset( $data['post_type'] ) ) {
		if ( $post && $post->ID ) {
			$first_name = $_POST['acf']['field_6691a56ecddf7'];
			$last_name  = $_POST['acf']['field_6691a59bcddf8'];
			$title      = $_POST['acf']['field_6691a5abcddf9'];

			$post_title = "$last_name, $first_name - $title";

			$data['post_title'] = $post_title;
		}
	}
	return $data;
} , 'filter_handler', 10, 2 );

/**
 * Prevent 'auto-draft' Slugs from Being Created on Profile Posts
 *
 */
add_action( 'save_post', function( $post_id, $post, $update ) {
	// If this is not a Profile post type, exit early.
	if ( $post->post_type !== 'profile' ) {
		return;
	}

	// If this is a revision, get real post ID.
	$parent_id = wp_is_post_revision( $post_id );
	if ( false !== $parent_id ) {
		$post_id = $parent_id;
	}

	// Load ACF fields from $_POST if available
	$first_name = $_POST['acf']['field_6691a56ecddf7'] ?? false;
	$last_name  = $_POST['acf']['field_6691a59bcddf8'] ?? false;
	$title      = $_POST['acf']['field_6691a5abcddf9'] ?? false;

	// Check if the ACF fields are set
	// If not, we will skip the slug check and leave the post as is.
	if ( ! $first_name || ! $last_name || ! $title ) {
		return;
	}

	// If the post slug is set and does not contain 'auto-draft', we will skip the slug check.
	if ( isset( $post->post_name ) && strpos( $post->post_name, 'auto-draft' ) === false ) {
		return;
	}

	// Update Post Slug and Title
	$post_data = array(
		'ID'         => $post_id,
		'post_name'  => '', // Clear the slug to prevent 'auto-draft' slug
		'post_title' => "$last_name, $first_name - $title", // Set the post title
	);
	// Update the post with the new slug and title
	remove_action( 'save_post', __FUNCTION__ );
	wp_update_post( $post_data );
	add_action( 'save_post', __FUNCTION__);

}, 10, 3 );

/**
 * Gravity Forms Configuration
 */

// Force Orbital Theme
add_filter( 'gform_form_theme_slug', function( $slug, $form ) {
	return 'orbital';
}, 10, 2 );

// Force disable legacy markup
add_filter( 'gform_enable_legacy_markup', '__return_false' );

// TablePress

/**
 * Add Bootstrap Classes to TablePress Tables.
 */
/**
 * Add 'table' class to tablepress tables
 *
 * @param array  $classes List of classes.
 * @param string $table_id Current Table ID?.
 */
function tablepress_classes( $classes, $table_id ) {
	$classes[] = 'table';
	$classes[] = 'table-bordered';
	$classes[] = 'table-hover';
	return $classes;
}
add_filter( 'tablepress_table_css_classes',  __NAMESPACE__ . '\tablepress_classes', 10, 2 );

/**
 * Wrap tablepress tables in a div
 *
 * @param string $data Tablepress output.
 */
function tablepress_add_wrapper( $data ) {
	$data = '<div class="sitka-tablepress-wrapper table-responsive-lg">' . $data . '</div>';
	return $data;
}
add_filter( 'tablepress_table_output', __NAMESPACE__ . '\tablepress_add_wrapper', 10, 2 );

/**
 * Disable TablePress CSS
 */
add_filter( 'tablepress_use_default_css', '__return_false' );


/**
 * Limit what innerblocks are allowed in Mayflower Blocks
 */
add_filter( 'block_type_metadata', function ( $metadata ) {
	if (
			'mayflower-blocks/collapse'          === $metadata['name'] ||
			'mayflower-blocks/column'            === $metadata['name'] ||
			'mayflower-blocks/panel'             === $metadata['name'] ||
			'mayflower-blocks/tab-content-panel' === $metadata['name']
		) {
		$allowed_blocks = json_decode( file_get_contents( get_template_directory() . '/src/blocks/shared-elements/block-sets/wysiwyg.json' ) );
		$metadata['allowedBlocks'] = array_unique( array_merge( $metadata['allowedBlocks'] ?? array(), $allowed_blocks->wysiwygBlocks ) );
	}
	return $metadata;
}, 10, 1 );

/**
 * Disable Search Functionality on the Front End
 */
add_action('parse_query', function( $query, $error = true ) {
	if ( is_search() && ! is_admin() ) {
		$query->is_search = false;
		$query->query_vars['s'] = false;
		$query->query['s'] = false;

		// to error

		if ( $error == true ) $query->is_404 = true;
	}
} );

add_filter( 'get_search_form', '__return_null' );


// Handle disabling posts. Note we are getting an ACF-set option using
// normal WP get_option function here, as this fires before ACF is fully
// initialized.
if ( ! get_option( 'options_enable_posts')  ) {
	include_once( get_template_directory() . '/src/library/BundledPlugins/oho-disable-posts.php' );
}

// Disable OHO Disable Posts plugin if active. This can be removed in the future.
add_action( 'admin_init', function () {
	if ( is_plugin_active( 'oho-disable-posts/oho-disable-posts.php' ) ) {
		deactivate_plugins( 'oho-disable-posts/oho-disable-posts.php', true, false );
	}
});

// Add Custom Google Analytics Tag Per-Site (GA4 Only)
$sitka_ga_id = get_option( 'options_ga_id' ) ?? null;
if ( $sitka_ga_id ) {
	add_action( 'wp_head', function() {
		global $sitka_ga_id;
		?><!-- Global site tag (gtag.js) - Google Analytics -->
		<script async src="https://www.googletagmanager.com/gtag/js?id=<?php echo esc_attr( $sitka_ga_id ); ?>"></script>
		<script>
			window.dataLayer = window.dataLayer || [];
			function gtag(){dataLayer.push(arguments);}
			gtag('js', new Date());

			gtag('config', '<?php echo esc_attr( $sitka_ga_id ); ?>');
		</script>
		<?php
	} );
}

/**
 * Customize Default Editoria11y Plugin Settings
 */
add_filter( 'ed11y_default_options', function ( $options ) {

	// Ignore ACF interfaces that appear in the editor
	// Ignore false positive on application step single heading
	$options['ed11y_ignore_elements'] .= ', .acf-block-fields .acf-table, .acf-block-fields .acf-row, .acf-block-fields a, .application-step-single-heading';

	return $options;
} );
