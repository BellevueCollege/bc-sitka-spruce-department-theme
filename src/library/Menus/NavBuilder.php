<?php

namespace BcSitkaSpruce\Library\Menus;
use Timber\Timber;
use BcSitkaSpruce\Library\Theme;
use Timber\Menu;
use Timber\MenuItem;
use Timber\Post;

/**
 * An API for building navs.
 */
class NavBuilder implements NavBuilderInterface {

  /**
   * @inheritDoc
   */
  public function getRelativeNav(
    int $post_id,
    int $relative_level,
    string $menu = ''
  ): ?Nav {
    // Get the relative root id.
    $root_id = $post_id;
    $level = abs($relative_level);
    for ($i = 0; $i < $level; $i++) {
      $post = get_post($root_id);
      $root_id = $post->post_parent;
    }

    return $this->getNav($root_id, $menu);
  }

  /**
   * @inheritDoc
   */
  public function getFixedMenuNav(
    int $post_id,
    int $starting_level,
    string $menu
  ): ?NavInterface {
    $menu_object = Timber::get_menu($menu);
    $items = [];
    
    // Prevent Errors on Page Preview
    if ( NULL === $this->searchTreeForItem($menu_object->get_items(), $post_id) ) {
      return NULL;
    }
    $menu_object->items = $this->getTreeContainingItem(
      $this->searchTreeForItem($menu_object->get_items(), $post_id),
      $menu_object->get_items()
    );
    $this->getMenuItemsDepth($menu_object->get_items(), 0, $starting_level, $items);
    $menu_object->items = $items;
    return new Nav($menu_object);
  }

  /**
   * Get all menu items at a certain menu depth.
   *
   * @param \Timber\MenuItem[] $menu_items
   * @param \Timber\MenuItem[] $items
   */
  protected function getMenuItemsDepth(
    array $menu_items,
    int $current_depth,
    int $retrieve_depth,
    array &$items = []
  ): void {
    if ($current_depth < $retrieve_depth) {
      foreach ($menu_items as $menu_item) {
        $this->getMenuItemsDepth($menu_item->children(), $current_depth + 1, $retrieve_depth, $items);
      }
    }
    else {
      $items = array_merge($items, $menu_items);
    }
  }

  /**
   * Get the full menu tree containing a specified menu item.
   *
   * @param \Timber\MenuItem $target_item
   * @param \Timber\MenuItem[] $menu_items
   *
   * @return \Timber\MenuItem[]
   */
  protected function getTreeContainingItem(
    MenuItem $target_item,
    array $menu_items
  ): array {
    foreach ($menu_items as $menu_item) {
      if (
        $menu_item->id === $target_item->id
        || $this->treeHasItem($target_item, $menu_item->children)
      ) {
        return $menu_item->children;
      }
    }
    return [];
  }

  /**
   * Check if a menu tree contains a specific menu item.
   *
   * @param \Timber\MenuItem $target_item
   * @param \Timber\MenuItem[] $menu_items
   */
  protected function treeHasItem(
    MenuItem $target_item,
    array $menu_items
  ): bool {
    foreach ($menu_items as $menu_item) {
      if ($menu_item->id === $target_item->id) {
        return true;
      }
      elseif (
        $menu_item->children
        && $this->treeHasItem($target_item, $menu_item->children)
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get a menu tree starting at the specified post.
   *
   * @param int $post_id
   *   Post id for starting point.
   * @param string $menu
   *   Menu machine name. Leave empty to automatically determine the correct
   *   menu.
   */
  protected function getNav(int $post_id, string $menu = ''): ?NavInterface {
    // Get the menu the post is added to if no menu is specified.
    if (!$menu) {
      $menu = $this->getPostMenu($post_id);
    }

    if (!$menu) {
      return null;
    }

    $menu_object = Timber::get_menu($menu);
    if ($item = $this->searchTreeForItem($menu_object->items, $post_id)) {
      $menu_object->items = $item->children;
    }

    // Get the root post.
    $root_post = Timber::get_post($post_id);

    // Build the nav.
    return new Nav($menu_object, $root_post);
  }

  /**
   * @inheritDoc
   */
  public function getPostMenu(int $post_id): ?string {
    // There does not appear to be a core method to get all menus that a post is
    // added to, so do it manually. If we find a better way, we should swap out
    // this implementation, because it loads the full menu on each check.
    
    // Get the menu item IDs for the current post.
    $menu_item_ids = wp_get_associated_nav_menu_items($post_id);
    $menu = NULL;

    // Loop through all menus and check if any of the menu items match the
    // current post.
    foreach ($this->getMenus() as $menu_slug => $menu_name) {

      // Get the menu items that match the needed IDs.
      $menu_items = wp_get_nav_menu_items(
        $menu_slug,
        array(
          'fields' => 'ids',
          'output' => 'ASC',
          'output_key' => 'ID',
          'post__in' => $menu_item_ids,
        )
      );
      
      // If we have a match, we have found the correct menu.
      if (!empty($menu_items)) {
        $menu = $menu_slug;
        break;
      }
    }
    return $menu;
  }

  /**
   * @inheritDoc
   */
  public function getSectionMenu(int $post_id): ?string {
    $menu = NULL;
    $possible_menus = array();
    $menu_item_ids = wp_get_associated_nav_menu_items($post_id);

    // This could be optimized by only loading the menu items once for each menu

    // Load menus and check if any of the menu items match the current post.
    // If they do, add to the list of possible menus.
    foreach (wp_list_sort(wp_get_nav_menus(), 'term_id', 'DESC') as $term) {
      $menu_items = wp_list_pluck(wp_get_nav_menu_items($term->term_id), 'ID');
      if (count($menu_items) !== count(array_diff($menu_items, $menu_item_ids))) {
        $possible_menus[] = $term->slug;
      }
    }

    // If there is only one possible menu, return it.
    if (count($possible_menus) === 1) {
      return $possible_menus[0];
    } else {
      // If there are multiple possible menus, find the one with the lowest
      // depth (closest to the root)
      $depth = 100;
      foreach ($possible_menus as $possible_menu) {
        $menu_items = $this->menuItemsWithDepth(wp_get_nav_menu_items($possible_menu));
        foreach ($menu_item_ids as $menu_item_id) {
          if (array_key_exists($menu_item_id, $menu_items)) {
            if ( $menu_items[$menu_item_id] < $depth ) {
              $depth = $menu_items[$menu_item_id];
              $menu = $possible_menu;
            }
            break;
          }
        }

      }
    }
    return $menu;
  }

  /**
   * When provided with a WordPress menu, return an array of menu items with their depth.
   */
  protected function menuItemsWithDepth( array $menu_items) : ?array {
    $menu = array();
    foreach ($menu_items as $menu_key => $menu_item) {
      //echo '<pre>Menu Item '; print_r($menu_item->ID); echo '</pre>';
      $menu[$menu_item->ID] = $this->getItemDepth($menu_items, $menu_item->ID, $menu_key);
    }
    return $menu;
  }

  /**
   * Find the depth of a menu item.
   * 
   * @param array $menu_items
   *  An array of menu items.
   * @param int $item_id
   * The ID of the menu item to find the depth of.
   * @param int $item_key
   * The array key of the menu item to find the depth of (optional).
   * @param int $depth
   * The current depth of the menu item (optional). Used to recurse.
   * 
   * @return int
   */
  protected function getItemDepth( array $menu_items, $item_id, $item_key = false, $depth = 0 ) : ?int {
    $current_menu_item;
    if ($item_key) {
      $current_menu_item = $menu_items[$item_key];
    } else {
      foreach ($menu_items as $menu_key => $menu_item) {
        if ((int)$menu_item->ID === (int)$item_id) {
          $current_menu_item = $menu_item;
          $item_key = $menu_key;
        }
      }
    }
    if ( 0 !== (int)$current_menu_item->menu_item_parent) {
      $depth = $this->getItemDepth($menu_items, (int)$current_menu_item->menu_item_parent, false, $depth + 1);
      //echo '<pre>Menu Items Passed to Recurse: '; print_r($menu_items); echo '</pre>';
    }
    return $depth;
  }


  /**
   * Get the list of menus.
   */
  protected function getMenus(): array {
    return Theme::menus()->getMenus();
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
   */
  protected function searchTreeForItem(array $menu_items, int $id): ?MenuItem {
    foreach ($menu_items as $menu_item) {
      if ( null !== $menu_item->master_object() && $menu_item->master_object()->ID === $id) {
        return $menu_item;
      }
      elseif ($menu_item->children) {
        $menu_item_match = $this->searchTreeForItem($menu_item->children, $id);
        if ($menu_item_match) {
          return $menu_item_match;
        }
      }
    }
    return null;
  }

}
