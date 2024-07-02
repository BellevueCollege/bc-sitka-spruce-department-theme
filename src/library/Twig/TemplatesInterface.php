<?php

namespace BcSitkaSpruce\Library\Twig;

/**
 * Definition for an API for moving page templates to a sub-folder.
 */
interface TemplatesInterface {

  /**
   * Array of all core templates types.
   *
   * See "{$type}_template_hierarchy" filter for a list of template types. The
   * index template is required to be in the theme root, so it's left off this
   * list.
   *
   * @see get_query_template()
   *
   * @var string[]
   */
  const CORE_TEMPLATE_TYPES_TO_MOVE = [
    '404',
    'archive',
    'author',
    'category',
    'tag',
    'taxonomy',
    'date',
    'embed',
    'home',
    'frontpage',
    'privacypolicy',
    'page',
    'paged',
    'search',
    'single',
    'singular',
    'attachment',
  ];

}
