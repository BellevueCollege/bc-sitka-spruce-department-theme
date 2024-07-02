<?php

namespace BcSitkaSpruce\Library\Menus;

use Timber;
use Timber\MenuItem;

/**
 * Definition for an API for customizing theme menus.
 */
interface MenusInterface {

  /**
   * Add a menu to the theme.
   *
   * @param string $menu
   *   The menu internal name.
   * @param string $name
   *   The menu public-facing name.
   */
  public function addMenu(string $menu, string $name): void;

  /**
   * Get the list of menus.
   *
   * @return array
   *   The array of menus.
   */
  public function getMenus(): array;

  /**
   * Remove a menu registered by the theme.
   *
   * @param string $menu
   *   The menu internal name.
   */
  public function removeMenu(string $menu): void;

  /**
   * Get a menu tree starting below a specific menu item.
   *
   * @param int $post_id
   *   Post id to get children of.
   * @param string $menu
   *   Menu machine name. Leave empty to automatically determine the correct
   *   menu.
   *
   * @return ?\Timber\Menu
   *   Timber menu object.
   */
  public function getSectionMenu(int $post_id, string $menu = ''): ?\Timber\Menu;

}
