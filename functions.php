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
		'bc-brand-bar',
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
		'listing-section-list-item-links',
		'course-information-section',
		'course-information-section/course-information-section-content',
		'narrow-content',
		'body-section',
		'body-section/body-section-content',
		'profiles-section',
		'template-program-info',
		'degrees-certificates-section',
		'checkerboard-section',
	);

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
// $enqueuer->addStyle('bc-sitka-spruce-icons', '/node_modules/@fortawesome/fontawesome-pro/css/all.css', [], get_template_directory_uri());
$enqueuer->addScript( handle: 'bc-sitka-spruce-main-js', src: '/assets/dist/js/main.asset.php', use_asset_file: true );

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

// Card Header Image
$image_crops->addImageSize( 'card-header', 360, 200, true );

$image_crops->addImageSize( 'testimonial', 560, 680, true );

$image_crops->addImageSize( 'announcement-banner', 260, 174, false );

$image_crops->addImageSize( 'sock-location', 300, 200, true );

$image_crops->addImageSize( 'sock-admissions-contact', 360, 240, true );

$image_crops->addImageSize( 'media-gallery-image', 600, 550, true );

$image_crops->addImageSize( 'listing-section', 360, 240, true );

// Profile Detail Overview Image Sizing
$image_crops->addImageSize( 'profile-overview-image', 460, 460, true );

$image_crops->addImageSize( 'profile-list-image', 260, 260, true );
// Checkerboard Image
$image_crops->addImageSize( 'checkerboard', 660, 550, true );


// Make some image sizes available in the block editor
add_filter(
	'image_size_names_choose',
	function ( $sizes ) {
		return array_merge(
			$sizes,
			array(
				'card-header' => __( 'Card Header Image', 'bc-sitka-spruce' ),
				'listing-section' => __( 'Listing Section Image', 'bc-sitka-spruce' ),
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

		// Do not wrap non-root blocks, or blocks that are not named.
		if ( ! $block['sitka_is_at_root'] || ! isset( $block['blockName'] ) ) {
			return $block_content;
		}

		// Do not wrap blocks that are in the allowlist.
		foreach ( $allowlisted_blocks as $allowlisted_block ) {
			if ( str_starts_with( $block['blockName'], $allowlisted_block ) ) {
				return $block_content;
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


// // Filter post content to add blocks that are missing or are in the wrong place
// add_filter(
// 	'block_editor_settings_all',
// 	function ( $settings, $context ) {
// 		echo '<h2>Settings</h2><pre>' . print_r( $settings, true ) . '</pre>';
// 		echo '<h2>Context</h2><pre>' . print_r( $context, true ) . '</pre>';
// 		die();
// 		return $settings;
// 	}, 10, 2
// );

add_action( 'enqueue_block_editor_assets', function () {
	wp_enqueue_script(
		'apply-templates',
		get_template_directory_uri() . '/assets/dist/js/editor.js',
		['wp-blocks', 'wp-dom-ready', 'wp-edit-post'],
	);
} );

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
