<?php

namespace BcSitkaSpruce\Library\Menus;

/**
 * Definition for an API for building navs.
 */
interface NavBuilderInterface {

  /**
   * Get a menu tree starting at a level relative to the given post.
   *
   * @param int $post_id
   *   Post id for starting point, usually the current menu item.
   * @param int $relative_level
   *   Starting level for the menu, relative to the given menu item.
   * @param string $menu
   *   Menu machine name. Leave empty to automatically determine the correct
   *   menu.
   */
  public function getRelativeNav(
    int $post_id,
    int $relative_level,
    string $menu = ''
  ): ?NavInterface;

  /**
   * Get the menu tree for the specified menu.
   *
   * @param string $menu
   *   Menu machine name.
   */
  public function getFixedMenuNav(
    int $post_id,
    int $starting_level,
    string $menu
  ): ?NavInterface;

  /**
   * Get the name of the menu associated with the specified post.
   *
   * @param int $post_id
   *   Id of post to find the menu for.
   */
  public function getPostMenu(int $post_id): ?string;

  /**
   * Get the name of the first menu a post is found in, even if it is not registered.
   *
   * @param int $post_id
   *   Id of post to find the menu for.
   */
  public function getSectionMenu(int $post_id): ?string;

}
