<?php

namespace BcSitkaSpruce\Library\Content;

/**
 * Definition for an API for configuration of custom WYSIWYG styles.
 */
interface WysiwygInterface {

  /**
   * Add a dropdown option which adds classes to a CSS selector.
   *
   * @param string $label
   *   The dropdown label.
   * @param string $selector
   *   The CSS selector the option applies to.
   * @param string $classes
   *   Classes to add to the CSS selector.
   */
  public function addSelectorClasses(
    string $label,
    string $selector,
    string $classes
  ): void;

  /**
   * Add a dropdown option which wraps the current selector in a block element.
   *
   * @param string $label
   *   The dropdown label.
   * @param string $selector
   *   The CSS selector the option applies to.
   * @param string $element
   *   The HTML block element to wrap around the CSS selector.
   * @param string $classes
   *   Classes to add to the CSS selector.
   */
  public function wrapBlockElement(
    string $label,
    string $selector,
    string $element,
    string $classes
  ): void;

  /**
   * Add a dropdown option which wraps the current selector in a inline element.
   *
   * @param string $label
   *   The dropdown label.
   * @param string $selector
   *   The CSS selector the option applies to.
   * @param string $element
   *   The HTML inline element to wrap around the CSS selector.
   * @param string $classes
   *   Classes to add to the CSS selector.
   */
  public function wrapInlineElement(
    string $label,
    string $selector,
    string $element,
    string $classes
  ): void;

  /**
   * Remove a format option.
   *
   * @param string $label
   *   The dropdown label.
   */
  public function removeFormat(string $label): void;

  /**
   * Add a stylesheet to the WYSIWYG.
   *
   * @param string $stylesheet
   *   The stylesheet path, relative to the current theme, without leading '/'.
   *
   */
  public function addStylesheet(string $stylesheet): void;

  /**
   * Remove a stylesheet to the WYSIWYG.
   *
   * @param string $stylesheet
   *   The stylesheet path, relative to the current theme.
   */
  public function removeStylesheet(string $stylesheet): void;

}
