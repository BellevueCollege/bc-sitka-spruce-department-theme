<?php
use BcSitkaSpruce\Controllers\News;
use Timber\Timber;
$context = Timber::context();
$context['large_story_id'] = $attributes['largeStoryId'];
$context['small_story_types'] = $attributes['smallStoryTypes'];
$context['featured_news'] = News::get_post_from_core( $attributes['largeStoryId'] );
$context['news_listing'] = News::get_from_core_by_type( types: $attributes['smallStoryTypes'], exclude: array($attributes['largeStoryId']) );
Timber::render( '/stories/news-feature/news-feature.twig', $context );
