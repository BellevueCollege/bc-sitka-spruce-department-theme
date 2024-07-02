<?php

namespace BcSitkaSpruce\Library\Menus;

use Timber\Menu;
use Timber\Post;

/**
 * Definition for a nav.
 */
interface NavInterface {

  /**
   * Get the menu.
   */
  public function getMenu(): ?Menu;

  /**
   * Get the root post.
   */
  public function getRoot(): ?Post;

}
