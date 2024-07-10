<?php

namespace BcSitkaSpruce\Library\Configuration;

use BcSitkaSpruce\Library\Theme;
use WP_Block_Editor_Context;
use WP_Post;

/**
 * An API for block editor customizations.
 */
class BlockEditor implements BlockEditorInterface {

  protected array $stylesheets = [];

  protected bool $useGlobally = true;

  protected bool $useFullSiteEditing = false;

  protected array $usedOnTypes = [];

  protected array $usedOnTemplates = [];

  protected array $coreBlocksBlacklist = [
    'core/archives',
    'core/avatar',
    'core/button',
    'core/buttons',
    'core/calendar',
    'core/categories',
    'core/column',
    'core/columns',
    'core/comments',
    'core/latest-comments',
    'core/latest-posts',
    'core/legacy-widget',
    'core/loginout',
    'core/more',
    'core/navigation',
    'core/navigation-link',
    'core/navigation-submenu',
    'core/nextpage',
    'core/page-list',
    'core/post-author',
    'core/post-author-biography',
    'core/post-author-name',
    'core/post-comments',
    'core/post-comments-form',
    'core/post-content',
    'core/post-date',
    'core/post-excerpt',
    'core/post-featured-image',
    'core/post-navigation-link',
    'core/post-template',
    'core/post-terms',
    'core/post-title',
    'core/pullquote',
    'core/query',
    'core/query-pagination',
    'core/query-pagination-next',
    'core/query-pagination-numbers',
    'core/query-pagination-previous',
    'core/query-title',
    'core/rss',
    'core/read-more',
    'core/search',
    'core/site-logo',
    'core/site-tagline',
    'core/site-title',
    'core/social-links',
    'core/table',
    'core/tag-cloud',
    'core/template-part',
    'core/term-description',
    'core/verse',
    'core/video',
    'core/widget-group',
  ];

  protected array $acfBlocks = [];

  protected array $jsBlocks = [
    'mayflower-blocks/alert',
    'mayflower-blocks/button',
    'mayflower-blocks/collapse',
    'mayflower-blocks/collapsibles',
    'mayflower-blocks/column',
    'mayflower-blocks/jumbotron',
    'mayflower-blocks/lead',
    'mayflower-blocks/panel',
    'mayflower-blocks/row',
    'mayflower-blocks/tabs',
    'mayflower-blocks/tab-content',
    'mayflower-blocks/tab-list',
  ];

  protected int $editorMaxWidth = 1024;

  public function __construct() {
    // The presence of theme.json implies this is true, so manually opt out.
    // if (!$this->useFullSiteEditing) {
    //   remove_theme_support('block-templates');
    // }
    // add_filter('allowed_block_types_all', [$this, 'setupAllowedBlocks'], 10, 2);
    // add_filter('block_categories_all', [$this, 'setupBlockGroups'], 10, 2);
    // add_filter('use_block_editor_for_post', [$this, 'setupBlockEditorForPost'], 10, 2);
    // add_action('acf/init', [$this, 'setupAcfBlocks'], 10, 1);
    add_action('enqueue_block_editor_assets', [$this, 'setupBlockEditorStylesheet'], 99, 0);
    //add_action('enqueue_block_editor_assets', [$this, 'setupAllowedBlockVariations'], 10, 0);
  }

  /**
   * @inheritDoc
   */
  public function addAcfBlock(
    string $name,
    string $title,
    string $description,
    array $post_types = [],
    string $icon = '',
    string $category = 'bellevue',
    array $settings = []
  ): void {
    $settings['name'] = $name;
    $settings['title'] = $title;
    $settings['description'] = $description;
    $settings['post_types'] = $post_types;
    $settings['icon'] = $icon;
    $settings['category'] = $category;
    $settings['render_callback'] = [Theme::timberHelper(), 'renderBlock'];
    $settings['mode'] = 'edit';
    $this->acfBlocks = array_merge($this->acfBlocks, [$name => $settings]);
  }

  /**
   * @inheritDoc
   */
  public function removeAcfBlock(string $name): void {
    $this->acfBlocks = array_diff_key($this->acfBlocks, array_fill_keys([$name], ''));
  }

  /**
   * @inheritDoc
   */
  public function addStylesheet(string $handle, string $path): void {
    if (!isset($this->stylesheets[$handle])) {
      $this->stylesheets[$handle] = $path;
    }
  }

  /**
   * @inheritDoc
   */
  public function removeStylesheet(string $handle): void {
    if (isset($this->stylesheets[$handle])) {
      unset($this->stylesheets[$handle]);
    }
  }

  /**
   * @inheritDoc
   */
  public function getCoreBlocksBlacklist(): array {
    return $this->coreBlocksBlacklist;
  }

  /**
   * @inheritDoc
   */
  public function setCoreBlocksBlacklist(array $blacklist): void {
    $this->coreBlocksBlacklist = $blacklist;
  }

  /**
   * @inheritDoc
   */
  public function useGlobally(bool $use): void {
    $this->useGlobally = $use;
  }

  /**
   * @inheritDoc
   */
  public function useFullSiteEditing(bool $use): void {
    $this->useFullSiteEditing = $use;
  }

  /**
   * @inheritDoc
   */
  public function useCoreBlock(string $block, bool $use): void {
    if (in_array($block, $this->coreBlocksBlacklist, true)) {
      unset($this->coreBlocksBlacklist[$block]);
    }
  }

  /**
   * @inheritDoc
   */
  public function useOnPostType(string $post_type, bool $use): void {
    $this->usedOnTypes[$post_type] = $use;
  }

  /**
   * @inheritDoc
   */
  public function isUsedOnPostType(string|null $post_type): bool {
    return $this->usedOnTypes[$post_type] ?? $this->useGlobally;
  }

  /**
   * @inheritDoc
   */
  public function useOnTemplate(string $template, bool $use): void {
    $this->usedOnTemplates[$template] = $use;
  }

  /**
   * @inheritDoc
   */
  public function isUsedOnTemplate(string $template): bool {
    return $this->usedOnTemplates[$template] ?? $this->useGlobally;
  }

  /**
   * Callback for the 'use_block_editor_for_post' filter.
   *
   * @param bool $use_editor
   *   Whether the block editor should be used.
   * @param \WP_Post $post
   *   The current post.
   *
   * @return bool
   *   Whether to disable the block editor.
   */
  public function setupBlockEditorForPost(
    bool $use_editor,
    WP_Post|null $post
  ): bool {
    if (!$post) {
      return true;
    }
    return $post->page_template ?
      $this->isUsedOnTemplate($post->page_template) :
      $this->isUsedOnPostType($post->post_type);
  }

  /**
   * Callback for the 'allowed_block_types_all' filter.
   *
   * @param string[]|bool $allowed_block_types
   *   Array of currently allowed core block types, or a boolean to enable or
   *   disable all.
   * @param \WP_Block_Editor_Context $context
   *   The editor context.
   *
   * @return string[]
   *   Array of allowed blocks.
   */
  public function setupAllowedBlocks(
    $allowed_block_types,
    WP_Block_Editor_Context $context
  ): array {
    if (!is_array($allowed_block_types)) {
      $allowed_block_types = array_keys(\WP_Block_Type_Registry::get_instance()->get_all_registered());
    }

    $core_blocks = array_filter($allowed_block_types, function($value) {
      return strpos($value, 'core/') === 0;
    });
    $third_party_blocks = array_filter($allowed_block_types, function($value) {
      return strpos($value, 'core/') === false;
    });

    $allowed_core_blocks = array_diff(
      $core_blocks,
      $this->coreBlocksBlacklist
    );

    return array_unique(array_merge(
      $allowed_core_blocks,
      $third_party_blocks,
      $this->jsBlocks
    ));
  }

  /**
   * Callback for the 'acf/init' action.
   */
  public function setupAcfBlocks(int $version): void {
    foreach ($this->acfBlocks as $settings) {
      acf_register_block_type($settings);
    }
  }



  /**
   * Callback for the 'enqueue_block_editor_assets' action.
   */
  public function setupBlockEditorStylesheet(): void {
    foreach ($this->stylesheets as $handle => $stylesheet) {
      $stylesheet = strpos($stylesheet, '//') === false
        ? get_theme_file_uri($stylesheet)
        : $stylesheet;
      wp_enqueue_style("bellevue-block-editor-theme-$handle", $stylesheet);
    }
  }

  /**
   * Callback for the 'block_categories_all' action.
   */
  public function setupBlockGroups(
    array $block_categories,
    WP_Block_Editor_Context $block_editor_context
  ): array {
    array_splice($block_categories, 1, 0, [
      [
        'slug' => 'bellevue',
        'title' => __('Bellevue', 'bellevue_2022'),
        'icon' => null,
      ],
    ]);
    return $block_categories;
  }

  /**
   * Callback for the 'enqueue_block_editor_assets' action.
   */
  public function setupAllowedBlockVariations(): void {
    wp_enqueue_script(
      'sitka-spruce-block-variations-blacklist',
      get_template_directory_uri() . '/src/library/Configuration/block-variations-blacklist.js',
      ['wp-blocks', 'wp-dom-ready', 'wp-edit-post'],
  );
  }

}
