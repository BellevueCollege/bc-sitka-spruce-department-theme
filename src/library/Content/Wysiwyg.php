<?php

namespace BcSitkaSpruce\Library\Content;

use BcSitkaSpruce\Library\Theme;

/**
 * An API for configuration of custom WYSIWYG styles.
 */
class Wysiwyg implements WysiwygInterface {

  protected array $formats = [];

  protected array $stylesheets = [];

  protected array $blockFormats = [
    'p' => 'Paragraph',
    'h2' => 'Heading 2',
    'h3' => 'Heading 3',
    'h4' => 'Heading 4',
    'h5' => 'Heading 5',
    'h6' => 'Heading 6',
    'pre' => 'Preformatted',
  ];

  protected string $editorClasses = 'wysiwyg';

  public function __construct() {
    add_action('admin_init', [$this, 'setupEditorStylesheets'], 10, 0);
    add_filter('mce_css', [$this, 'removeBellevueStylesheet'], 10, 1);
    add_filter('mce_buttons_2', [$this, 'setupFormatsButton'], 10, 1);
    add_filter('bellevue/acf_text_formats/basic_html_2', [$this, 'setupFormatsButton'], 10, 1);
    add_filter('tiny_mce_before_init', [$this, 'setupEditor'], 10, 2);
  }

  /**
   * @inheritDoc
   */
  public function addSelectorClasses(string $label, string $selector, string $classes): void {
    $this->formats[$label] = [
      'selector' => $selector,
      'classes' => $classes,
    ];
  }

  /**
   * @inheritDoc
   */
  public function wrapBlockElement(string $label, string $selector, string $element, string $classes): void {
    $this->formats[$label] = [
      'block' => $element,
      'selector' => $selector,
      'classes' => $classes,
    ];
  }

  /**
   * @inheritDoc
   */
  public function wrapInlineElement(string $label, string $selector, string $element, string $classes): void {
    $this->formats[$label] = [
      'inline' => $element,
      'selector' => $selector,
      'classes' => $classes,
    ];
  }

  /**
   * @inheritDoc
   */
  public function removeFormat(string $label): void {
    $this->formats = array_diff_key($this->formats, array_fill_keys([$label], ''));
  }

  /**
   * @inheritDoc
   */
  public function addStylesheet(string $stylesheet): void {
    $this->stylesheets[] = $stylesheet;
  }

  /**
   * @inheritDoc
   */
  public function removeStylesheet(string $stylesheet): void {
    $this->stylesheets = array_diff($this->stylesheets, [$stylesheet]);
  }

  /**
   * Callback for the 'tiny_mce_before_init' filter.
   */
  public function setupEditor(array $config, string $editor_id): array {
    if ($this->editorClasses) {
      if (!isset($config['body_class'])) {
        $config['body_class'] = $this->editorClasses;
      }
      else {
        $config['body_class'] .= " $this->editorClasses";
      }
    }

    $block_formats = [];
      array_walk($this->blockFormats, function($v, $k) use (&$block_formats) {
      $block_formats[] = "{$v}={$k}";
    });
    $config['block_formats'] = implode(';', $block_formats);

    $formats = [];
    foreach ($this->formats as $label => $settings) {
      $formats[] = ['title' => $label] + $settings;
    }
    $config['style_formats'] = wp_json_encode($formats);
    return $config;
  }

  /**
   * Callback for the 'admin_init' action.
   */
  public function setupEditorStylesheets(): void {
    add_editor_style($this->stylesheets);
  }

  /**
   * Callback for the 'mce_buttons_2' filter.
   */
  public function setupFormatsButton(array $buttons): array {
    if ($this->formats) {
      array_unshift($buttons, 'styleselect');
    }
    return $buttons;
  }

  /**
   * Callback for the 'mce_css' filter.
   *
   * Remove the bellevue theme stylesheet. Calling add_editor_style() in a child
   * theme causes WordPress to look in any installed theme for a stylesheet at
   * the registered path. Very dumb. This method ensures that the editor
   * stylesheet from the bellevue theme is not loaded.
   */
  public function removeBellevueStylesheet(string $stylesheets): string {
    $styles = explode(',', $stylesheets);
    foreach ($styles as $key => $style) {
      if (strpos($style, 'bellevue') !== false) {
        unset($styles[$key]);
      }
    }
    return implode(',', $styles);
  }

}
