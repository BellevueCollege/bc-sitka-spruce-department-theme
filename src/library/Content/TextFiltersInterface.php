<?php

namespace BcSitkaSpruce\Library\Content;

use BcSitkaSpruce\Library\Content\TextFilter\TextFilterInterface;

/**
 * Definition for an API for adding text filters.
 */
interface TextFiltersInterface {

  /**
   * Add a text filter.
   */
  public function addFilter(string $name, TextFilterInterface $filter): void;

  /**
   * Remove a text filter.
   */
  public function removeFilter(string $name): void;

}
