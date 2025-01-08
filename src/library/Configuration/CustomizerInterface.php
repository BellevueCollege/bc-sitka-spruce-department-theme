<?php

namespace BcSitkaSpruce\Library\Configuration;

use WP_Admin_Bar;

/**
 * Definitions for an API for interacting with the theme customizer.
 */
interface CustomizerInterface {

  /**
   * Set whether to use the customizer.
   */
  public function useCustomizer(bool $use): void;

  /**
   * Set up the admin menu.
   *
   * Callback for the 'admin_menu' action.
   */
  public function setupAdminMenu(): void;

  /**
   * Set up redirects for the customizer page.
   *
   * Callback for the 'admin_init' action.
   */
  public function setupRedirect(): void;

  /**
   * Set up the admin toolbar.
   *
   * Callback for the 'admin_bar_menu' action.
   *
   * @param \WP_Admin_Bar $admin_bar
   *   The admin toolbar class.
   */
  public function setupToolbar(WP_Admin_Bar $admin_bar): void;

}
