<?php
/**
 * Seed menus, ACF Site Options, and a test page for header/footer e2e tests.
 *
 * Idempotent: deletes and recreates fixture data on each run so Playwright
 * tests start from a known state. Invoked via:
 *   wp-env run tests-cli wp eval-file .../seed-site-chrome.php
 *
 * @package BcSitkaSpruce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$main_menu_name = 'E2E Main Menu';
$cta_menu_name  = 'E2E CTA Menu';
$page_title     = 'E2E Site Chrome';
$site_title     = 'E2E Department Site';

/**
 * Delete an existing nav menu by name.
 *
 * @param string $menu_name Menu name.
 */
function e2e_delete_nav_menu_by_name( string $menu_name ): void {
	$menu = wp_get_nav_menu_object( $menu_name );
	if ( $menu ) {
		wp_delete_nav_menu( $menu->term_id );
	}
}

/**
 * Create a nav menu and return its term ID.
 *
 * @param string $menu_name Menu name.
 * @return int
 */
function e2e_create_nav_menu( string $menu_name ): int {
	$menu_id = wp_create_nav_menu( $menu_name );
	if ( is_wp_error( $menu_id ) ) {
		echo wp_json_encode( array( 'error' => $menu_id->get_error_message() ) );
		exit( 1 );
	}

	return (int) $menu_id;
}

/**
 * Add a custom link to a nav menu.
 *
 * @param int    $menu_id Menu term ID.
 * @param string $title   Link title.
 * @param string $url     Link URL.
 * @param int    $parent  Parent menu item ID.
 * @return int Menu item ID.
 */
function e2e_add_menu_link( int $menu_id, string $title, string $url, int $parent = 0 ): int {
	$item_id = wp_update_nav_menu_item(
		$menu_id,
		0,
		array(
			'menu-item-title'  => $title,
			'menu-item-url'    => $url,
			'menu-item-status' => 'publish',
			'menu-item-type'   => 'custom',
			'menu-item-parent-id' => $parent,
		)
	);

	if ( is_wp_error( $item_id ) ) {
		echo wp_json_encode( array( 'error' => $item_id->get_error_message() ) );
		exit( 1 );
	}

	return (int) $item_id;
}

// --- WordPress menus (header main nav, header CTA, footer main column) ---

e2e_delete_nav_menu_by_name( $main_menu_name );
e2e_delete_nav_menu_by_name( $cta_menu_name );

$main_menu_id = e2e_create_nav_menu( $main_menu_name );
$cta_menu_id  = e2e_create_nav_menu( $cta_menu_name );

$programs_id = e2e_add_menu_link(
	$main_menu_id,
	'Programs',
	'https://example.com/programs'
);
e2e_add_menu_link(
	$main_menu_id,
	'Degree Programs',
	'https://example.com/programs/degrees',
	$programs_id
);
e2e_add_menu_link(
	$main_menu_id,
	'About',
	'https://example.com/about'
);
e2e_add_menu_link(
	$main_menu_id,
	'Contact',
	'https://example.com/contact'
);

e2e_add_menu_link(
	$cta_menu_id,
	'Apply Now',
	'https://example.com/apply'
);
e2e_add_menu_link(
	$cta_menu_id,
	'Request Info',
	'https://example.com/request-info'
);

$locations = get_theme_mod( 'nav_menu_locations', array() );
$locations['main-menu'] = $main_menu_id;
$locations['cta-menu']  = $cta_menu_id;
set_theme_mod( 'nav_menu_locations', $locations );

update_option( 'blogname', $site_title );

// --- ACF Site Options (footer contact, sock, sitewide notice) ---

update_field( 'address', "Bellevue College\n3000 Landerholm Circle SE\nBellevue, WA 98007-6406", 'option' );
update_field( 'footer_contact_method', 'phone', 'option' );
update_field( 'phone', '425-564-1000', 'option' );
update_field(
	'social',
	array(
		array(
			'network' => 'facebook',
			'url'     => 'https://www.facebook.com/bellevuecollege',
		),
		array(
			'network' => 'linkedin',
			'url'     => 'https://www.linkedin.com/school/bellevue-college',
		),
		array(
			'network' => 'youtube',
			'url'     => 'https://www.youtube.com/bellevuecollege',
		),
	),
	'option'
);
// Hide location card so sock snapshots stay stable without a location image.
update_field( 'display_location_card', 0, 'option' );
update_field(
	'website_manager',
	array(
		'message'    => 'For questions about this site, contact our site manager',
		'first_name' => 'E2E',
		'last_name'  => 'Manager',
		'position'   => 'Web Coordinator',
		'email'      => 'e2e-manager@example.com',
	),
	'option'
);
// Keep sitewide notice off for consistent header visuals.
update_field( 'display_notice', 0, 'option' );
update_field( 'sitewide_notice_text', '', 'option' );

// --- Published test page (header/footer render via wrapper.twig) ---

$existing_page = get_page_by_title( $page_title, OBJECT, 'page' );
if ( $existing_page ) {
	wp_delete_post( $existing_page->ID, true );
}

$page_id = wp_insert_post(
	array(
		'post_title'   => $page_title,
		'post_status'  => 'publish',
		'post_type'    => 'page',
		'post_content' => '<!-- wp:paragraph --><p>E2E fixture page for header and footer tests.</p><!-- /wp:paragraph -->',
	),
	true
);

if ( is_wp_error( $page_id ) ) {
	echo wp_json_encode( array( 'error' => $page_id->get_error_message() ) );
	exit( 1 );
}

$page_url = get_permalink( $page_id );
if ( ! $page_url ) {
	echo wp_json_encode( array( 'error' => 'Failed to resolve test page permalink.' ) );
	exit( 1 );
}

// Return fixture metadata for Playwright assertions (parsed by seedSiteChromeData).
echo wp_json_encode(
	array(
		'pageUrl'                 => $page_url,
		'mainMenuTopLevelLabels'  => array( 'Programs', 'About', 'Contact' ),
		'mainMenuChildLabel'      => 'Degree Programs',
		'ctaMenuLabels'           => array( 'Apply Now', 'Request Info' ),
		'phoneDisplay'            => '+1 425-564-1000',
		'siteTitle'               => $site_title,
		'addressLine'             => '3000 Landerholm Circle SE',
	)
);
