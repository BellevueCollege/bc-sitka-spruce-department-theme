<?php

/**
 * Plugin Name: OHO Disable Posts
 * Description: Disables posts site-wide.
 * Author: OHO Interactive
 * Author URI: https://www.oho.com/
 */

namespace BcSitkaSpruce\Plugins\Oho\DisablePosts;

use WP_Admin_Bar;

/**
 * Alter the core 'post' post type definition to disable it.
 *
 * Callback for the 'register_post_type_args' filter.
 *
 * @param array $args
 *   Post type definitions.
 * @param string $post_type
 *   The post type name to alter.
 *
 * @return array
 *   Altered post type definitions.
 */
function alter_post_type(array $args, string $post_type): array {
  if ($post_type === 'post') {
    $args['public'] = false;
    $args['exclude_from_search'] = true;
    $args['publicly_queryable'] = false;
    $args['show_ui'] = false;
    $args['show_in_nav_menus'] = false;
    $args['show_in_admin_bar'] = false;
    $args['show_in_rest'] = false;
    $args['can_export'] = false;
  }
  return $args;
}
add_filter('register_post_type_args', __NAMESPACE__ . '\alter_post_type', 99, 2);

/**
 * Alter the core 'post' taxonomy definitions to disable them.
 *
 * Callback for the 'register_taxonomy_args' filter.
 *
 * @param array $args
 *   Taxonomy definitions.
 * @param string $taxonomy
 *   The taxonomy name to alter.
 * @param string[] $object_type
 *   An array of object the taxonomy is associated with.
 *
 * @return array
 *   Altered taxonomy definitions.
 */
function alter_taxonomies(array $args, string $taxonomy, array $object_type): array {
  if (
    in_array($taxonomy, ['category', 'post_tag'], true) &&
    count($object_type) === 1 &&
    in_array('post', $object_type, true)
  ) {
    $args['public'] = false;
    $args['publicly_queryable'] = false;
    $args['show_ui'] = false;
    $args['show_in_menu'] = false;
    $args['show_in_nav_menus'] = false;
    $args['show_in_rest'] = false;
    $args['show_tagcloud'] = false;
    $args['show_in_quickedit'] = false;
  }
  return $args;
}
add_filter('register_taxonomy_args', __NAMESPACE__ . '\alter_taxonomies', 99, 99, 3);

/**
 * Unlink the "+ New" top-level menu item in the admin toolbar.
 *
 * Callback for the 'admin_bar_menu' action.
 *
 * @param \WP_Admin_Bar $admin_bar
 *   The admin toolbar class.
 */
function clean_admin_bar(WP_Admin_Bar $admin_bar): void {
  $nodes = $admin_bar->get_nodes();
  if (isset($nodes['new-content'])) {
    $new_content = $nodes['new-content'];
    $admin_bar->remove_node('new-content');
    $admin_bar->add_node([
      'id' => $new_content->id,
      'title' => $new_content->title,
      'parent' => $new_content->parent,
      'href' => '',
      'group' => $new_content->group,
      'meta' => $new_content->meta,
    ]);
  }
}
add_action('admin_bar_menu', __NAMESPACE__ . '\clean_admin_bar', 99, 1);

/**
 * Remove posts from the sitemap.
 *
 * Callback for the 'the_seo_framework_sitemap_supported_post_types' filter.
 *
 * @param string[] $post_types
 *   An array of all supported post type.
 *
 * @return string[]
 *   Supported post types without location.
 */
function disable_sitemap(array $post_types): array {
  $key = array_search('post', $post_types, true);
  if ($key !== false) {
    unset($post_types[$key]);
  }
  return $post_types;
}
add_filter('the_seo_framework_sitemap_supported_post_types', __NAMESPACE__ . '\disable_sitemap', 99, 1);
