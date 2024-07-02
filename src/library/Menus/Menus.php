<?php

namespace BcSitkaSpruce\Library\Menus;
use Timber;
/**
 * An API for customizing theme menus.
 */
class Menus implements MenusInterface {

  protected array $menus = [];

  public function __construct() {
    add_theme_support('menus');
    add_action('after_setup_theme', [$this, 'setupMenus'], 10, 0);
    add_filter('timber/context', [$this, 'setupTwig'], 10, 1);
  }

  /**
   * @inheritDoc
   */
  public function addMenu(string $menu, string $name): void {
    $this->menus = array_merge($this->menus, [$menu => $name]);
  }

  /**
   * @inheritDoc
   */
  public function getMenus(): array {
    return $this->menus;
  }

  /**
   * @inheritDoc
   */
  public function removeMenu(string $menu): void {
    $this->menus = array_diff_key($this->menus, array_fill_keys([$menu], ''));
  }

  /**
   * @inheritDoc
   */
  public function getSectionMenu(int $post_id, string $menu = ''): ?\Timber\Menu {
    $menu_item_ids = wp_get_associated_nav_menu_items($post_id);
    $menu_item_id = array_shift($menu_item_ids);

    // Get the menu the post is added to if no menu is specified.
    // There does not appear to be a core method to get all menus that a post is
    // added to, so do it manually. If we find a better way, we should swap out
    // this implementation, because it loads the full menu on each check.
    if (!$menu) {
      foreach ($this->menus as $menu_slug => $menu_name) {
        $menu_items = wp_get_nav_menu_items($menu_slug);
        if (in_array($menu_item_id, wp_list_pluck($menu_items, 'ID'))) {
          $menu = $menu_slug;
          break;
        }
      }
    }

    if (!$menu) {
      return null;
    }

    $menu_object = Timber::get_menu($menu);
    $menu_object->items = $this->searchTreeForItem($menu_object->items, $post_id);
    return $menu_object;
  }

  /**
   * Search a menu tree for an object id, and return its child menu items.
   *
   * @param \Timber\MenuItem[] $menu_items
   *   Array of menu items to search.
   * @param int $id
   *   The object id to search the menu for. This is not the menu item id, but
   *   the id of the object the menu item represents, i.e.: the post id,
   *   term id, etc.
   *
   * @return \Timber\MenuItem[]
   *   Array of menu item which are children of the passed id.
   */
  protected function searchTreeForItem(array $menu_items, int $id): array {
    foreach ($menu_items as $menu_item) {
      if ($menu_item->master_object()->ID === $id) {
        return $menu_item->children;
      }
      elseif ($menu_item->children) {
        $menu_item_matches = $this->searchTreeForItem($menu_item->children, $id);
        if ($menu_item_matches) {
          return $menu_item_matches;
        }
      }
    }
    return [];
  }

  /**
   * Callback for the 'after_setup_theme' action.
   */
  public function setupMenus(): void {
    foreach ($this->menus as $menu => $name) {
      register_nav_menu($menu, $name);
    }
  }

  /**
   * Callback for the 'timber/context' action.
   */
  public function setupTwig(array $context): array {
    foreach ($this->menus as $menu => $name) {
      $context[str_replace('-', '_', "menu_{$menu}")] = \Timber::get_menu($menu);
    }
    return $context;
  }

}
