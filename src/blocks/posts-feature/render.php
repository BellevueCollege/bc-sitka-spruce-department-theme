<?php
use BcSitkaSpruce\Controllers\Posts;
use Timber\Timber;
$context                      = Timber::context();
// Section Heading & Description
$context['heading']           = esc_html( $attributes['title'] );
$context['subheading']        = esc_html( $attributes['description'] );
//Optional CTA Link
$context['link_custom']       = $attributes['linkTitle'] && $attributes['linkUrl'] ? array(
	'title' => esc_html( $attributes['linkTitle'] ),
	'url'   => esc_url( $attributes['linkUrl'] ),
) : null;

// Note: naming doesn't match with posts because this reuses the News story for rendering
// Featured/Large Story
$context['large_story_id']    = esc_attr( $attributes['largeStoryId'] );
$context['featured_news']     = Posts::get_single( $attributes['largeStoryId'] );

// Small Story Types
$context['small_story_types'] = $attributes['smallStoryTypes'];

//Conditional for when to grab small stories
if ( ! empty( $attributes['smallStoryTypes'] ) ) {
	$context['news_listing'] = Posts::get_by_category(
		terms: $attributes['smallStoryTypes'],
		exclude: [ $attributes['largeStoryId'] ],
		limit: 3
	);
} else {
	$context['news_listing'] = array(); // purposely empty
}

// Check before rendering
if ( $context['large_story_id'] || count( $context['small_story_types'] ) > 0 ) {
	Timber::render( '/stories/news-feature/news-feature.twig', $context );
} else {
	return '';
}
