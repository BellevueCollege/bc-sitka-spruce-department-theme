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
add_action( 'after_setup_theme', function() {
	$menus = Theme::menus();
	$menus->addMenu( 'main-menu', __( 'Main Menu', 'bc-sitka-spruce' ) );
	$menus->addMenu( 'cta-menu', __( 'Call-to-Action Menu', 'bc-sitka-spruce' ) );
}, 5 );

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

/**
 * Disable FitText in Editor
 *
 * This shouldn't be needed (it is included in theme.json), but that is not working consistantly.
 */
add_filter( 'register_block_type_args', function( $args, $block_type ) {
	$blocks = [
		'core/heading',
		'core/paragraph',
		'core/verse',
		'core/quote',
		'core/pullquote',
	];
	if ( in_array( $block_type, $blocks, true ) ) {
		$args['supports']['typography']['fitText'] = false;
	}
	return $args;
}, 10, 2 );


$enqueuer = Theme::enqueuer();
$enqueuer->addStyle( handle: 'bc-sitka-spruce-bootstrap', src: '/assets/dist/css/bootstrap.asset.php', use_asset_file: true, preload: 'preload' );
$enqueuer->addStyle( handle: 'bc-sitka-spruce-main', src: '/assets/dist/css/main.asset.php', use_asset_file: true, dependencies: array( 'bc-sitka-spruce-bootstrap' ), preload: 'preload' );
$enqueuer->addStyle( handle: 'bc-sitka-spruce-mainjsassets', src: '/assets/dist/js/main.asset.php', use_asset_file: true, preload: 'preload' );
$enqueuer->addStyle( handle: 'bc-sitka-spruce-fonts', src: '//use.typekit.net/vln2gpg.css', preload: 'preload' );

$enqueuer->addScript( handle: 'bc-sitka-spruce-main-js', src: '/assets/dist/js/main.asset.php', use_asset_file: true, preload: 'preload' );

if ( current_user_can( 'edit_posts' ) ) {
	$enqueuer->addScript( handle: 'bc-sitka-spruce-a11y-warnings', src: '/assets/dist/js/a11y-warnings.asset.php', use_asset_file: true );
}

// Enqueue Script in Block Editor to Handle Automated Block Insertion Etc
add_action( 'enqueue_block_editor_assets', function () {
	$asset = include get_parent_theme_file_path( '/assets/dist/js/editor.asset.php' );
	wp_enqueue_script(
		'sitka-editor-js',
		get_template_directory_uri() . '/assets/dist/js/editor.js',
		array_unique(
			array_merge(
				array( 'wp-blocks', 'wp-dom-ready', 'wp-edit-post' ),
				$asset['dependencies']
			)
		),
		$asset['version']
	);

	$front_page_id = (int) get_option( 'page_on_front' );

	$inline = "window.SitkaEditor = Object.assign( window.SitkaEditor || {}, { frontPageId: $front_page_id } );";

	wp_add_inline_script(
		'sitka-editor-js', // must match the handle above
		$inline,
		'before'           // ensure this runs before editor.js [web:64]
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
	),
	shortcodes: array( 'table' ),
);
$enqueuer->addBlockStyle(
	handle: 'tablepress',
	blocks: array(
		'mayflower-blocks/tablepress',
		'tablepress/table',
	),
	shortcodes: array( 'table' ),
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
	handle: 'bs-forms',
	blocks: array(
		'lmc-search-plugin/lmc-search-block',
		'lmc-search-plugin/lmc-browzine-search-block',
	)
);

$enqueuer->addBlockStyle(
	handle: 'lmc-search',
	blocks: array(
		'lmc-search-plugin/lmc-search-block',
		'lmc-search-plugin/lmc-browzine-search-block',
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
$block_editor->addStylesheet( 'bootstrap-editor', 'assets/dist/css/bootstrap-editor.css' );
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

/**
 * Turn HTML or entity-encoded markup into a single line of plain text.
 *
 * @param mixed $text Raw field or generated description.
 * @return string Plain text. Empty when $text is not a string.
 */
function clean_plain_text( $text ): string {
	if ( ! is_string( $text ) ) {
		return '';
	}

	$cleaned = html_entity_decode( $text, ENT_QUOTES | ENT_HTML5, 'UTF-8' );
	$cleaned = preg_replace( '/<!--(.|\s)*?-->/', '', $cleaned );
	$cleaned = wp_strip_all_tags( $cleaned, true );
	$cleaned = preg_replace( '/\s+/', ' ', $cleaned );

	return trim( $cleaned );
}

/**
 * Whether text contains HTML tags, comments, or encoded markup.
 *
 * Plain comparisons such as "5 < 10" are left alone.
 *
 * @param string $text Text to inspect.
 */
function text_has_markup( string $text ): bool {
	return 1 === preg_match( '/<!--|<\/?[a-zA-Z]|&(?:lt|gt|amp|quot|#\d+);/', $text );
}

/**
 * First non-empty plain-text value from a list of ACF fields.
 *
 * @param int      $post_id     Post ID.
 * @param string[] $field_names ACF field names, in preference order.
 */
function plain_text_from_acf_fields( int $post_id, array $field_names ): string {
	if ( ! function_exists( 'get_field' ) ) {
		return '';
	}

	foreach ( $field_names as $field_name ) {
		$cleaned = clean_plain_text( get_field( $field_name, $post_id ) );

		if ( '' !== $cleaned ) {
			return $cleaned;
		}
	}

	return '';
}

// Use Summary or Intro as description by default.
// Inspired by https://gist.github.com/sybrew/299ad19597f974c89b1564316297c1ed
add_filter( 'the_seo_framework_generated_description', function( $description, $context ) {
	$post_id = $context['id'] ?? null;

	if ( $post_id ) {
		$from_fields = plain_text_from_acf_fields( (int) $post_id, array( 'intro_text', 'summary' ) );

		if ( '' !== $from_fields ) {
			return $from_fields;
		}
	}

	if ( ! is_string( $description ) || '' === trim( $description ) ) {
		return $description;
	}

	return clean_plain_text( $description );
}, 20, 2 );

/**
 * Strip markup from a description that is about to be printed.
 *
 * Hand-written descriptions with characters like "<" are not rewritten.
 *
 * @param mixed $description Description about to be printed.
 * @return mixed
 */
function clean_description_output( $description ) {
	if ( ! is_string( $description ) || ! text_has_markup( $description ) ) {
		return $description;
	}

	return clean_plain_text( $description );
}
add_filter( 'the_seo_framework_description_output', __NAMESPACE__ . '\clean_description_output', 99 );
add_filter( 'the_seo_framework_ogdescription_output', __NAMESPACE__ . '\clean_description_output', 99 );
add_filter( 'the_seo_framework_twitterdescription_output', __NAMESPACE__ . '\clean_description_output', 99 );

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
			$first = get_field( 'first_name', $args['id'] );
			$last  = get_field( 'last_name', $args['id'] );
			$role  = get_field( 'position_role', $args['id'] );
			$built = build_profile_title_and_slug(
				is_string( $first ) ? $first : '',
				is_string( $last ) ? $last : '',
				is_string( $role ) ? $role : ''
			);

			if ( null !== $built ) {
				return $built['title'];
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
 * Profile title and slug.
 *
 * The public slug comes from the title, "Last, First - Role", so an existing
 * profile stays at /profile/doe-jane-director/ on the next save. Two people
 * with the same name and different roles do not share a slug.
 */

/**
 * Build a profile title and the slug derived from that title.
 *
 * @param string $first_name First name.
 * @param string $last_name  Last name.
 * @param string $role       Position or role. Omitted from the title when empty.
 * @return array{title: string, slug: string}|null Null when either name is empty.
 */
function build_profile_title_and_slug( string $first_name, string $last_name, string $role = '' ): ?array {
	$first_name = trim( $first_name );
	$last_name  = trim( $last_name );
	$role       = trim( $role );

	if ( '' === $first_name || '' === $last_name ) {
		return null;
	}

	$title = '' !== $role
		? "{$last_name}, {$first_name} - {$role}"
		: "{$last_name}, {$first_name}";

	return array(
		'title' => $title,
		'slug'  => sanitize_title( $title ),
	);
}

/**
 * Read first name, last name, and role from an ACF value array.
 *
 * @param array $acf Values keyed by field key or field name.
 * @return array{first_name: string, last_name: string, role: string}
 */
function profile_name_fields_from_values( array $acf ): array {
	return array(
		'first_name' => (string) ( $acf['field_6691a56ecddf7'] ?? $acf['first_name'] ?? '' ),
		'last_name'  => (string) ( $acf['field_6691a59bcddf8'] ?? $acf['last_name'] ?? '' ),
		'role'       => (string) ( $acf['field_6691a5abcddf9'] ?? $acf['position_role'] ?? '' ),
	);
}

/**
 * Title and slug for a profile that already has ACF name fields saved.
 *
 * @param int $post_id Profile ID.
 * @return array{title: string, slug: string}|null
 */
function saved_profile_title_and_slug( int $post_id ): ?array {
	if ( ! function_exists( 'get_field' ) ) {
		return null;
	}

	$first_name = get_field( 'first_name', $post_id );
	$last_name  = get_field( 'last_name', $post_id );
	$role       = get_field( 'position_role', $post_id );

	return build_profile_title_and_slug(
		is_string( $first_name ) ? $first_name : '',
		is_string( $last_name ) ? $last_name : '',
		is_string( $role ) ? $role : ''
	);
}

/**
 * A slug WordPress can resolve without colliding with another profile's old auto-draft URL.
 *
 * @param string $slug    Desired slug.
 * @param int    $post_id Profile ID. Zero when the post does not exist yet.
 * @param string $status  Post status being saved.
 */
function unique_profile_slug( string $slug, int $post_id, string $status ): string {
	return wp_unique_post_slug( $slug, $post_id, $status, 'profile', 0 );
}

/**
 * Set the profile title and slug before Gutenberg inserts or updates the post.
 */
add_filter( 'rest_pre_insert_profile', function( $prepared_post, $request ) {
	$acf = $request->get_param( 'acf' );

	if ( ! is_array( $acf ) ) {
		$params = $request->get_json_params();
		$acf    = ( is_array( $params ) && isset( $params['acf'] ) && is_array( $params['acf'] ) ) ? $params['acf'] : array();
	}

	$name_fields = profile_name_fields_from_values( $acf );
	$built       = build_profile_title_and_slug(
		$name_fields['first_name'],
		$name_fields['last_name'],
		$name_fields['role']
	);

	if ( null === $built ) {
		return $prepared_post;
	}

	$prepared_post->post_title = $built['title'];
	$prepared_post->post_name  = unique_profile_slug(
		$built['slug'],
		(int) ( $prepared_post->ID ?? 0 ),
		(string) ( $prepared_post->post_status ?? 'draft' )
	);

	return $prepared_post;
}, 10, 2 );

/**
 * Set the profile title and slug on save, including the later ACF metabox request.
 *
 * Names are often missing from the Gutenberg REST body. Publishing then keeps a
 * per-post placeholder instead of the shared auto-draft slug. The metabox save
 * replaces that placeholder with the name slug.
 */
add_filter( 'wp_insert_post_data', function( $data, $postarr ) {
	if ( ( $data['post_type'] ?? '' ) !== 'profile' || ( $data['post_status'] ?? '' ) === 'trash' ) {
		return $data;
	}

	$post_id     = (int) ( $postarr['ID'] ?? 0 );
	$name_fields = profile_name_fields_from_values(
		( isset( $_POST['acf'] ) && is_array( $_POST['acf'] ) ) ? $_POST['acf'] : array()
	);
	$built       = build_profile_title_and_slug(
		$name_fields['first_name'],
		$name_fields['last_name'],
		$name_fields['role']
	);

	if ( null === $built && $post_id ) {
		$built = saved_profile_title_and_slug( $post_id );
	}

	if ( null !== $built ) {
		$data['post_title'] = $built['title'];
		$data['post_name']  = unique_profile_slug( $built['slug'], $post_id, (string) $data['post_status'] );
		return $data;
	}

	$slug = (string) ( $data['post_name'] ?? '' );

	if ( $post_id && 'publish' === $data['post_status'] && ( '' === $slug || 0 === strpos( $slug, 'auto-draft' ) ) ) {
		$data['post_name'] = 'profile-' . $post_id;
	}

	return $data;
}, 10, 2 );

/**
 * Apply the title and slug after ACF has stored the name fields.
 *
 * Compares against the unique slug, so a suffixed slug such as doe-jane-director-2
 * is not written again on every save.
 *
 * @param int|string $post_id Post ID, or an ACF options page key.
 */
function sync_profile_title_and_slug( $post_id ): void {
	if ( ! is_numeric( $post_id ) ) {
		return;
	}

	$post_id = (int) $post_id;

	if ( 'profile' !== get_post_type( $post_id ) || wp_is_post_revision( $post_id ) ) {
		return;
	}

	if ( 'trash' === get_post_status( $post_id ) ) {
		return;
	}

	$built = saved_profile_title_and_slug( $post_id );
	$post  = get_post( $post_id );

	if ( null === $built || ! $post ) {
		return;
	}

	$unique_slug = unique_profile_slug( $built['slug'], $post_id, $post->post_status );

	if ( $post->post_name === $unique_slug && $post->post_title === $built['title'] ) {
		return;
	}

	$callback = __NAMESPACE__ . '\sync_profile_title_and_slug';

	remove_action( 'acf/save_post', $callback, 20 );

	wp_update_post(
		array(
			'ID'         => $post_id,
			'post_title' => $built['title'],
			'post_name'  => $unique_slug,
		)
	);

	add_action( 'acf/save_post', $callback, 20 );
}
add_action( 'acf/save_post', __NAMESPACE__ . '\sync_profile_title_and_slug', 20 );

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
 * Add Classes to Ignore for Editoria11y Plugin
 *
 * Any non-theme-provided classes should be added via plugin settings instead.
 */
add_filter( 'ed11y_default_options', function ( $options ) {

	// Ignore editoria11y decorative images
	$options['ed11y_ignore_elements'] .= '.a11y-decorative, .a11y-hide-warning';

	return $options;
} );
