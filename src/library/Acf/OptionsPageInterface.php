<?php

namespace BcSitkaSpruce\Library\Acf;

/**
 * Definition for an API for adding Advanced Custom Fields options pages.
 */
interface OptionsPageInterface {

  /**
   * Add an options page.
   *
   * @param string[] $settings
   *   Settings array. See acf_add_options_page() for available options.
   */
  public function addOptionsPage(array $settings): void;

  /**
   * Remove an options page,
   *
   * @param string $menu_slug
   *   The menu slug of the options page to remove.
   */
  public function removeOptionsPage(string $menu_slug): void;

  /**
   * Setup options pages.
   *
   * Callback for the 'acf/init' action.
   *
   * @param int $version
   *   The current Advanced Custom Fields version.
   */
  public function setupOptionsPages(int $version): void;

  /**
   * Setup options page values in Twig templates.
   *
   * All options are added to the 'acf_options' array.
   *
   * Callback for the 'timber/context' action.
   *
   * @param array $context
   *   The current Timber context array.
   *
   * @return array
   *   The context array with options added.
   */
  public function setupTwig(array $context): array;

}
