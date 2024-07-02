<?php

namespace BcSitkaSpruce\Library\Twig;

use Twig\Environment;
use WP_Block;

/**
 * Definition for an API for setup and automatic loading of templates using Timber.
 */
interface TimberHelperInterface {

  /**
   * Add base theme filters and functions.
   */
  public function addBaseExtensions(): void;

  /**
   * Add a custom Twig filter.
   *
   * @param string $name
   *   The name of the filter.
   * @param ?callable $callable
   *   The filter callback.
   * @param array $options
   *   Options for \Twig\TwigFilter::__construct().
   */
  public function addFilter(
    string $name,
    callable $callable = null,
    array $options = []
  ): void;

  /**
   * Add a custom Twig fuction.
   *
   * @param string $name
   *   The name of the function.
   * @param ?callable $callable
   *   The function callback.
   * @param array $options
   *   Options for \Twig\TwigFunction::__construct().
   */
  public function addFunction(
    string $name,
    callable $callable = null,
    array $options = []
  ): void;

  /**
   * Add a default folder for Twig to look for templates in.
   *
   * @param string $path
   *   The folder path.
   * @param int $weight
   *   The weight. Lower weights are scanned first.
   */
  public function addDefaultFolder(string $path, int $weight): void;

  /**
   * Add a folder for Twig to look for templates in.
   *
   * @param string $path
   *   The folder path.
   * @param int $weight
   *   The weight. Lower weights are scanned first.
   */
  public function addTemplateLocation(string $path, int $weight): void;

  /**
   * Render an Advanced Custom Fields block.
   *
   * This method is added as a render callback in the
   * BcSitkaSpruce\Library\BlockEditor\BlockEditor::addAcfBlock() method.
   *
   * @param array
   *   $attributes The block attributes.
   * @param string
   *   $content The block content.
   * @param bool $is_preview
   *   Whether the block is being rendered for editing preview.
   * @param int $post_id
   *   The current post being edited or viewed.
   * @param \WP_Block|null $wp_block
   *   The block instances. Null if this is a newly-created block.
   */
  public function renderBlock(
    array $block,
    string $content,
    bool $is_preview,
    int $post_id,
    ?WP_Block $wp_block
  ): void;

}
