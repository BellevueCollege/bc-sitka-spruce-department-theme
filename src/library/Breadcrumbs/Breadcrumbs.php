<?php

namespace BcSitkaSpruce\Library\Breadcrumbs;

/**
 * An API for interacting with breadcrumbs.
 *
 * Depends on the 'breadcrumb-trail' plugin.
 */
class Breadcrumbs implements BreadcrumbsInterface {

  /**
   * @inheritDoc
   */
  public function getItems(
    int $min = 2,
    bool $show_home = false,
    bool $link_current = false
  ): array {
    if (!class_exists('Breadcrumb_Trail')) {
      return [];
    }

    $breadcrumbs = (new \Breadcrumb_Trail())->items;
    if (!$show_home) {
      array_shift($breadcrumbs);
    }

    $total = count($breadcrumbs);

    if ($total < $min) {
      return [];
    }

    if ($link_current) {
      $current =& $breadcrumbs[$total - 1];
      $current = $this->linkCurrent($current);
    }

    return $breadcrumbs;
  }

  /**
   * Link a breadcrumb to the current page, if a corresponding object is found.
   *
   * @param string $current
   *   The current unlinked item.
   *
   * @return string
   *   The item, linked.
   */
  protected function linkCurrent(string $current): string {
    $queried_object = get_queried_object();

    switch (get_class($queried_object)) {
      case 'WP_Post':
        $url = get_permalink($queried_object->ID);
        break;
      case 'WP_Term':
        $url = get_term_link($queried_object->term_id);
        break;
      case 'WP_User':
        $url = get_author_posts_url($queried_object->ID);
        break;
      default:
        $url = '';
        break;
    }

    return $url ? '<a href="'. $url . '">' . $current . '</a>' : $current;
  }

}
