<?php

namespace BcSitkaSpruce\Library\Configuration;

/**
 * Definitions for an API for block editor customizations.
 */
interface BlockEditorInterface {

  /**
   * Add a custom Advanced Custom Fields block.
   */
  public function addAcfBlock(
    string $name,
    string $title,
    string $description,
    array $post_types = [],
    string $icon = '',
    string $category = 'bellevue',
    array $settings = []
  ): void;

  /**
   * Remove a custom Advanced Custom Fields block.
   */
  public function removeAcfBlock(string $name): void;

  /**
   * Add a custom editor stylesheet.
   */
  public function addStylesheet(string $handle, string $path): void;

  /**
   * Remove a custom editor stylesheet.
   */
  public function removeStylesheet(string $handle): void;

  /**
   * Get the core blocks blacklist.
   */
  public function getCoreBlocksBlacklist(): array;

  /**
   * Set the core blocks blacklist.
   */
  public function setCoreBlocksBlacklist(array $blacklist): void;

  /**
   * Check if the block editor is disabled on a post type.
   *
   * @param string $post_type
   *   The post type to check.
   *
   * @return bool
   *   Whether the block editor is disabled.
   */
  public function isUsedOnPostType(string $post_type): bool;

  /**
   * Check if the block editor is disabled on a template.
   *
   * @param string $template
   *   The template to check.
   *
   * @return bool
   *   Whether the block editor is disabled.
   */
  public function isUsedOnTemplate(string $template): bool;

  /**
   * Use the block editor site-wide.
   */
  public function useGlobally(bool $use): void;

  /**
   * Use the block editor for full-site editing.
   */
  public function useFullSiteEditing(bool $use): void;

  /**
   * Use a core block in the block editor.
   */
  public function useCoreBlock(string $block, bool $use): void;

  /**
   * Us the block editor on a post type.
   */
  public function useOnPostType(string $post_type, bool $use): void;

  /**
   * Use the block editor on a template.
   */
  public function useOnTemplate(string $template, bool $use): void;

}
