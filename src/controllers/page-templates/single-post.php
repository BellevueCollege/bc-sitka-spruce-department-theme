<?php
use Timber\Timber;
use Timber\Post;
use BcSitkaSpruce\Library\Theme;

$context         = Timber::context();
$context['post'] = Timber::get_post();

// Blog Home fields
$blog_home_id = get_option('page_for_posts');
if ( '0' !== $blog_home_id ) {
	$context['blog_home_url'] = get_permalink( $blog_home_id );
	$context['blog_home_title'] = get_the_title( $blog_home_id );
	$context['blog_home_intro'] = get_field( 'intro_text', $blog_home_id );
} else {
	$context['blog_home_url'] = null;
	$context['blog_home_title'] = __( 'Posts', 'bc-sitka-spruce' );
}


//ACF fields
$context['summary']          = get_field( 'summary') ?? null;
$context['media_type']       = get_field( 'featured_media_type') ?? null;
$context['video_url']        = get_field( 'featured_video_url') ?? null;
$context['caption']          = get_field( 'caption') ?? null;
$context['author_override']  = get_field( 'author_override') ?? null;


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
