<?php

namespace BcSitkaSpruce\Library\Configuration;

/**
 * Definitions for an API for theme customizations.
 */
interface ThemeOptionsInterface {

  /**
   * Allow a post format on all post types.
   *
   * @see https://developer.wordpress.org/reference/functions/add_theme_support/#post-formats
   */
  public function addAllowedPostFormat(string $post_format): void;

  /**
   * Remove a post format on all post types.
   *
   * @see https://developer.wordpress.org/reference/functions/add_theme_support/#post-formats
   */
  public function removeAllowedPostFormat(string $post_format): void;

  /**
   * Auto-generate an inline width style on captions.
   *
   * By default, WordPress adds an inline width style of the image width + 10px
   * to all generated captions. This is dumb.
   */
  public function autoGenerateCaptionWidths(bool $auto_generate): void;

  /**
   * Add post thumbnail support to a post type.
   *
   * @see https://developer.wordpress.org/reference/functions/add_theme_support/#post-thumbnails
   */
  public function addPostTypeThumbnail(string $post_type): void;

  /**
   * Remove post thumbnail support from a post type.
   *
   * @see https://developer.wordpress.org/reference/functions/add_theme_support/#post-thumbnails
   */
  public function removePostTypeThumbnail(string $post_type): void;

  /**
   * Output a generated title tag in <head>.
   */
  public function outputTitleTag(bool $output): void;

  /**
   * Set the excerpt length.
   */
  public function setExcerptLength(int $length): void;

  /**
   * Set the excerpt more text.
   */
  public function setExcerptMore(string $more): void;

  /**
   * Use emoji. Enabling this adds the emoji assets.
   */
  public function useEmoji(bool $use): void;

  /**
   * Use HTML5 element support on a specific element.
   *
   * @see https://developer.wordpress.org/reference/functions/add_theme_support/#html5
   */
  public function useHtml5Element(string $element, bool $use): void;

}
