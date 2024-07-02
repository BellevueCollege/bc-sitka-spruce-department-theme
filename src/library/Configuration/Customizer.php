<?php

namespace BcSitkaSpruce\Library\Configuration;

use WP_Admin_Bar;

/**
 * An API for interacting with the theme customizer.
 */
class Customizer implements CustomizerInterface {

  protected bool $useCustomizer = false;

  public function __construct() {
    add_action('admin_init', [$this, 'setupRedirect'], 10, 0);
    add_action('admin_menu', [$this, 'setupAdminMenu'], 99, 0);
    add_action('admin_bar_menu', [$this, 'setupToolbar'], 99, 1);
  }

  /**
   * @inheritDoc
   */
  public function useCustomizer(bool $use): void {
    $this->useCustomizer = $use;
  }

  /**
   * @inheritDoc
   */
  public function setupAdminMenu(): void {
    if (!$this->useCustomizer) {
      global $submenu;
      if (isset($submenu['themes.php'])) {
        foreach ($submenu['themes.php'] as $key => $item) {
          if (in_array('customize', $item)) {
            unset($submenu['themes.php'][$key]);
          }
        }
      }
    }
  }

  /**
   * @inheritDoc
   */
  public function setupRedirect(): void {
    if (!$this->useCustomizer) {
      global $pagenow;
      if ($pagenow === 'customize.php') {
        wp_redirect(admin_url(), '301');
      }
    }
  }

  /**
   * @inheritDoc
   */
  public function setupToolbar(WP_Admin_Bar $admin_bar): void {
    if (!$this->useCustomizer) {
      $admin_bar->remove_menu('customize');
    }
  }

}
