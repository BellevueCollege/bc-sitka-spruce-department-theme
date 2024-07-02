<?php

namespace BcSitkaSpruce\Library\Content;

use BcSitkaSpruce\Library\Content\TextFilter\TextFilterInterface;

/**
 * An API for adding text filters.
 */
class TextFilters implements TextFiltersInterface {

  /**
   * @var \BcSitkaSpruce\Library\Content\TextFilter\TextFilterInterface[]
   */
  protected array $filters = [];

  public function __construct() {
    foreach ($this->filters as $filter) {
      add_filter('the_content', [$filter, 'filter'], 99, 1);
      add_filter('acf_the_content', [$filter, 'filter'], 99, 1);
    }
  }

  public function addFilter(string $name, TextFilterInterface $filter): void {
    if (!isset($this->filters[$name])) {
      $this->filters[$name] = $filter;
    }
  }

  public function removeFilter(string $name): void {
    unset($this->filters[$name]);
  }

}
