<?php

namespace BcSitkaSpruce\Library\Menus;

use Timber\Menu;
use Timber\Post;

/**
 * A class for storing navigation menu data.
 */
class Nav implements NavInterface {

  protected Menu $menu;

  protected ?Post $root;

  public function __construct(Menu $menu, Post $root = null) {
    $this->menu = $menu;
    $this->root = $root;
  }

  /**
   * @inheritDoc
   */
  public function getMenu(): ?Menu {
    return $this->menu;
  }

  /**
   * @inheritDoc
   */
  public function getRoot(): ?Post {
    return $this->root;
  }

}
