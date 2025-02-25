<?php
use Timber\Timber;
use Timber\Post;
use BcSitkaSpruce\Library\Theme;

$context         = Timber::context();
$context['post'] = Timber::get_post();

//ACF fields
$context['title'] 			 = get_the_title();
$context['summary']          = get_field( 'summary') ?: null;
$context['media_type']       = get_field( 'featured_media_type') ?: null;
$context['video_url']        = get_field( 'featured_video_url') ?: null; 
$context['caption']          = get_field( 'caption') ?: null;
$context['author_override']  = get_field( 'author_override') ?: null;
$raw_contacts = get_field('contact') ?: []; // Get ACF field contacts
// Passing in only needed fields
$context['contacts'] = array_map(function ($contact) {
    return [
        'first_name'       => get_field('first_name', $contact->ID),
        'last_name'        => get_field('last_name', $contact->ID),
        'position'         => get_field('position_role', $contact->ID),
        'phone'            => get_field('phone_number', $contact->ID),
        'email'            => get_field('email', $contact->ID),
    ];
}, is_array($raw_contacts) ? $raw_contacts : [$raw_contacts]); // Ensure it's an array

//breadcrumb stuff
$context['breadcrumbs'] = Theme::breadcrumbs()->getItems( 2 );

// uses WP command to grab photo @ correct size
$featured_image = get_field('featured_image_horizontal');
$context['featured_image_h'] = $featured_image ? $featured_image['url'] : null;


$context['featured_image_v'] = get_field( 'featured_image_vertical' ) ? wp_get_attachment_image(
	get_field( 'featured_image_vertical' )['ID'],
	'full',
	false,
	array(
		'class' => 'img-fluid rounded',
	)
) : null;

// Related posts
// Get the current post's categories
$categories = get_the_category();
$category_ids = [];

if ($categories) {
    foreach ($categories as $category) {
        $category_ids[] = $category->term_id;
    }
}

// Query related posts
$args = [
    'post_type'      => 'post',
    'category__in'   => $category_ids,
    'post__not_in'   => [get_the_ID()],
    'posts_per_page' => 3,
];

$context['related_posts'] = Timber::get_posts($args);

///needs to be last so everything before this line is rendered
Timber::render( 'content/single-post.twig', $context );
