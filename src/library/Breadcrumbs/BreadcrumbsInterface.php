<?php

namespace BcSitkaSpruce\Library\Breadcrumbs;

/**
 * Define an API for interacting with breadcrumbs.
 */
interface BreadcrumbsInterface {

  /**
   * Get breadcrumb items.
   *
   * This is a wrapper around the breadcrumb-trail plugin, so that raw items can
   * be returned, rather than the full markup the plugin wants to give.
   *
   * @param int $min
   *   The minimum number of items in the breadcrumb for the breadcrumb to
   *   display.
   * @param bool $show_home
   *   Show the homepage in the breadcrumbs.
   * @param bool $link_current
   *   Link the current page.
   *
   * @return string[]
   *   Array of breadcrumb items.
   */
  public function getItems(
    int $min = 2,
    bool $show_home = false,
    bool $link_current = false
  ): array;

}
