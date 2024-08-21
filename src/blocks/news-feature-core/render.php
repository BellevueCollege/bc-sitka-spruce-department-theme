<?php
use BcSitkaSpruce\Controllers\News;
use Timber\Timber;
$context                      = Timber::context();
$context['heading']           = esc_html( $attributes['title'] );
$context['subheading']        = esc_html( $attributes['description'] );
$context['large_story_id']    = esc_attr( $attributes['largeStoryId'] );
$context['small_story_types'] = $attributes['smallStoryTypes'];
$context['featured_news']     = News::get_post_from_core( $attributes['largeStoryId'] );
$context['news_listing']      = News::get_from_core_by_type( types: $attributes['smallStoryTypes'], exclude: array( $attributes['largeStoryId'] ) );

if ( $context['large_story_id'] || count( $context['small_story_types'] ) > 0 ) {
	Timber::render( '/stories/news-feature/news-feature.twig', $context );
} else {
	return '';
}
