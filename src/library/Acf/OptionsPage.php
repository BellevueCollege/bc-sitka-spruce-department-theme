<?php

namespace BcSitkaSpruce\Library\Acf;

/**
 * An API for adding Advanced Custom Fields options pages.
 */
class OptionsPage implements OptionsPageInterface {

  protected array $optionsPages = [];

  public function __construct() {
    add_action('acf/init', [$this, 'setupOptionsPages'], 10, 1);
    add_filter('timber/context', [$this, 'setupTwig'], 10, 1);
  }

  /**
   * @inheritDoc
   */
  public function addOptionsPage(array $settings): void {
    $this->optionsPages = array_merge(
      $this->optionsPages,
      [$settings['menu_slug'] => $settings]
    );
  }

  /**
   * @inheritDoc
   */
  public function removeOptionsPage(string $menu_slug): void {
    $this->optionsPages = array_diff_key(
      $this->optionsPages,
      array_fill_keys([$menu_slug], '')
    );
  }

  /**
   * @inheritDoc
   */
  public function setupOptionsPages(int $version): void {
    foreach ($this->optionsPages as $options_page) {
      // Set a more restrictive default capability.
      $options_page['capability'] = $options_page['capability'] ?? 'manage_options';
      acf_add_options_page($options_page);
    }
  }

  /**
   * @inheritDoc
   */
  public function setupTwig(array $context): array {
    $context['acf_options'] = get_fields('option');
    return $context;
  }

}
