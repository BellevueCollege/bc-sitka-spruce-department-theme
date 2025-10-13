<?php

namespace BcSitkaSpruce\Library\Configuration;

/**
 * An API for theme customizations.
 */
class ThemeOptions implements ThemeOptionsInterface {

  protected array $allowedPostFormats = [];

  protected bool $autoGenerateCaptionWidths = false;

  protected bool $emoji = false;

  protected int $excerptLength = 30;

  protected string $excerptMore = '&hellip;';

  protected array $html5 = [
    'caption' => true,
    'comment-form' => true,
    'comment-list' => true,
    'gallery' => true,
    'search-form' => true,
    'style' => true,
    'script' => true,
  ];

  protected array $postThumbnails = [];

  protected bool $titleTag = true;

  public function __construct() {
    add_action('after_setup_theme', [$this, 'setupThemeSupport'], 10, 0);
    add_action('after_setup_theme', [$this, 'setupEmoji'], 10, 0);
    add_filter('excerpt_length', [$this, 'setupExcerptLength'], 90, 1);
    add_filter('excerpt_more', [$this, 'setupExcerptMore'], 90, 1);
    add_filter('img_caption_shortcode_width', [$this, 'setupCaptionShortcodeWidth'], 10, 3);
  }

  /**
   * @inheritDoc
   */
  public function addAllowedPostFormat(string $post_format): void {
    if (!in_array($post_format, $this->allowedPostFormats)) {
      $this->allowedPostFormats[] = $post_format;
    }
  }

  /**
   * @inheritDoc
   */
  public function removeAllowedPostFormat(string $post_format): void {
    if (in_array($post_format, $this->allowedPostFormats)) {
      $this->allowedPostFormats = array_diff(
        $this->allowedPostFormats,
        [$post_format]
      );
    }
  }

  /**
   * @inheritDoc
   */
  public function autoGenerateCaptionWidths(bool $auto_generate): void {
    $this->autoGenerateCaptionWidths = $auto_generate;
  }

  /**
   * @inheritDoc
   */
  public function addPostTypeThumbnail(string $post_type): void {
    if (!in_array($post_type, $this->postThumbnails)) {
      $this->postThumbnails[] = $post_type;
    }
  }

  /**
   * @inheritDoc
   */
  public function removePostTypeThumbnail(string $post_type): void {
    if (in_array($post_type, $this->postThumbnails)) {
      $this->postThumbnails = array_diff(
        $this->postThumbnails,
        [$post_type]
      );
    }
  }

  /**
   * @inheritDoc
   */
  public function outputTitleTag(bool $output): void {
    $this->titleTag = $output;
  }

  /**
   * @inheritDoc
   */
  public function setExcerptLength(int $length): void {
    $this->excerptLength = $length;
  }

  /**
   * @inheritDoc
   */
  public function setExcerptMore(string $more): void {
    $this->excerptMore = $more;
  }

  /**
   * @inheritDoc
   */
  public function useEmoji(bool $use): void {
    $this->emoji = $use;
  }

  /**
   * @inheritDoc
   */
  public function useHtml5Element(string $element, bool $use): void {
    $this->html5[$element] = $use;
  }

  /**
   * Callback for the 'img_caption_shortcode_width' filter.
   *
   * @param int $width
   *   The width of the current caption in pixels.
   * @param string[] $attributes
   *   Attributes of the caption shortcode.
   * @param string $content
   *   The image element markup.
   */
  public function setupCaptionShortcodeWidth(
    int $width,
    array $attributes,
    string $content
  ): int {
    return $this->autoGenerateCaptionWidths ? $width : 0;
  }

  /**
   * Callback for the 'after_setup_theme' action.
   */
  public function setupEmoji(): void {
    if (!$this->emoji) {
      remove_action('admin_print_styles', 'print_emoji_styles');
      remove_action('wp_head', 'print_emoji_detection_script', 7);
      remove_action('admin_print_scripts', 'print_emoji_detection_script');
      remove_action('wp_print_styles', 'print_emoji_styles');
      remove_filter('wp_mail', 'wp_staticize_emoji_for_email');
      remove_filter('the_content_feed', 'wp_staticize_emoji');
      remove_filter('comment_text_rss', 'wp_staticize_emoji');
      add_filter('tiny_mce_plugins', function(array $config, string $editor_id) {
        return array_diff($config, ['wpemoji']);
      }, 10, 2);
    }
  }

  /**
   * Callback for the 'excerpt_length' filter.
   */
  public function setupExcerptLength(): int {
    return $this->excerptLength;
  }

  /**
   * Callback for the 'excerpt_more' filter.
   */
  public function setupExcerptMore(): string {
    return $this->excerptMore;
  }

  /**
   * Callback for the 'after_setup_theme' action.
   */
  public function setupThemeSupport(): void {
    add_theme_support('html5', array_keys(array_filter($this->html5, function ($v) {
      return $v;
    })));
    if ($this->titleTag) {
      add_theme_support('title-tag');
    }
    add_theme_support('post-formats', $this->allowedPostFormats);
    add_theme_support('post-thumbnails', $this->postThumbnails);
    //add_theme_support( 'editor-styles' ); <- probably not needed, since we are using a different style loading method
    add_theme_support( 'custom-logo' );
    add_theme_support( 'automatic-feed-links' );
    add_theme_support( 'align-wide' );
    add_theme_support( 'disable-custom-font-sizes' );
    add_theme_support( 'disable-custom-colors' );
    add_theme_support( 'disable-custom-gradients' );
    remove_theme_support( 'core-block-patterns' );
    add_theme_support( 'responsive-embeds' );
    add_theme_support( 'block-template-parts' );

		// Only load assets for blocks that are on a particular page
		add_filter( 'should_load_separate_core_block_assets', '__return_true' );
  }

}
