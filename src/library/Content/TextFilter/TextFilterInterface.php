<?php

namespace BcSitkaSpruce\Library\Content\TextFilter;

/**
 * Defines an API for text filters.
 */
interface TextFilterInterface {

  /**
   * Callback for the 'the_content' filter.
   *
   * @param string $content
   *   Unfiltered content.
   */
  public function filter(string $content): string;

}
