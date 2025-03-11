<?php
use BcSitkaSpruce\Controllers\Posts;
use Timber\Timber;
$context                      = Timber::context();
$context['heading']           = esc_html( $attributes['title'] );
$context['subheading']        = esc_html( $attributes['description'] );
$context['link_custom']       = $attributes['linkTitle'] && $attributes['linkUrl'] ? array(
	'title' => esc_html( $attributes['linkTitle'] ),
	'url'   => esc_url( $attributes['linkUrl'] ),
) : null;

// Note: naming doesn't match with posts because this reuses the News story for rendering
$context['large_story_id']    = esc_attr( $attributes['largeStoryId'] );
$context['small_story_types'] = $attributes['smallStoryTypes'];
$context['featured_news']     = Posts::get_single( $attributes['largeStoryId'] );
$context['news_listing']      = Posts::get_by_category( terms: $attributes['smallStoryTypes'], exclude: array( $attributes['largeStoryId'] ), limit: 3 );
if ( $context['large_story_id'] || count( $context['small_story_types'] ) > 0 ) {
	Timber::render( '/stories/news-feature/news-feature.twig', $context );
} else {
	return '';
}
