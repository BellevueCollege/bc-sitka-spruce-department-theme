<?php
use Timber\Timber;
use Timber\Post;
use BcSitkaSpruce\Library\Theme;

$context         = Timber::context();
$context['post'] = Timber::get_post();

// Blog Home fields
$blog_home_id = get_option( 'page_for_posts' );
if ( '0' !== $blog_home_id ) {
	$context['blog_home_url'] = get_permalink( $blog_home_id );
} else {
	$context['blog_home_url'] = null;
}

// ACF Fields
$context['summary']           = get_field( 'summary') ?? null;
$context['media_type']        = get_field( 'featured_media_type') ?? null;
$context['video_url']         = get_field( 'featured_video_url') ?? null;
$context['caption']           = get_field( 'caption') ?? null;
$context['author_override']   = get_field( 'author_override') ?? null;

// Get ACF fields for contact
$raw_contact = get_field('contact') ?? false;
if ( $raw_contact ) {
    //Fetch the repeater from the profile post ID
    $schedule_repeater = get_field('scheduling_section', $raw_contact->ID);
    $links = array();

	if ( is_array($schedule_repeater) && !empty($schedule_repeater) ) {
		$row = $schedule_repeater[0];
		if (!empty($row['sched_appointment_link'])) {
			$links[] = $row['sched_appointment_link'];
		}
		if (!empty($row['sched_appt_link'])) {
			$links[] = $row['sched_appt_link'];
		}
    }
	$context['contact']['scheduling_links'] = $links;
    $context['contact'] = array(
        'first_name'       => get_field('first_name', $raw_contact->ID),
        'last_name'        => get_field('last_name', $raw_contact->ID),
        'position'         => get_field('position_role', $raw_contact->ID),
        'phone'            => get_field('phone_number', $raw_contact->ID),
        'email'            => get_field('email', $raw_contact->ID),
        'url'              => get_permalink( $raw_contact->ID ),
        'scheduling_links' => $links, 
    );
}

//breadcrumb stuff
$context['breadcrumbs'] = Theme::breadcrumbs()->getItems( 2 );

$context['featured_media_type'] = get_field('featured_media_type') ?? 'image_horizontal';
$context['featured_video_url']  = get_field('featured_video_url') ?? null;

// uses WP command to grab photo @ correct size
$context['featured_image_h'] = get_field( 'featured_image_horizontal' ) ? wp_get_attachment_image(
	get_field( 'featured_image_horizontal' )['ID'],
	'post-horiz-lg',
	false,
	array(
		'class' => 'img-fluid',
	)
) : null;

$context['featured_image_v'] = get_field( 'featured_image_vertical' ) ? wp_get_attachment_image(
	get_field( 'featured_image_vertical' )['ID'],
	'post-vert-lg',
	false,
	array(
		'class' => 'img-fluid',
	)
) : null;

// Related posts
// Get the current post's categories
$categories = get_the_category();
$context['categories'] = $categories;


if ( ! empty( $categories ) ) {

	$category_ids = array_map( function( $category ) {
		return $category->term_id;
	}, $categories );

	$context['related_posts_link'] = array(
		'title' => __( 'More Related Posts', 'bc-sitka-spruce' ),
		'url'   => get_category_link( $category_ids[0] ),
	);


	$context['category_ids'] = $category_ids;

	// Query related posts
	$args = [
		'post_type'      => 'post',
		'category__in'   => $category_ids,
		'post__not_in'   => array( get_the_ID() ),
		'posts_per_page' => 3,
	];

	$context['related_posts_args'] = $args;
	$context['related_posts']      = Timber::get_posts($args);
}

///needs to be last so everything before this line is rendered
Timber::render( 'content/single-post.twig', $context );
