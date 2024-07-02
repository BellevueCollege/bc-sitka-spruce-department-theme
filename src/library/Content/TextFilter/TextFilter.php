<?php

namespace BcSitkaSpruce\Library\Content\TextFilter;

use DOMDocument;

/**
 * Base class for text filters.
 */
abstract class TextFilter implements TextFilterInterface {

  /**
   * Load an arbitrary HTML string as a DOMDocument object.
   *
   * Use this method instead of DOMDocument::loadHTML() to ensure the correct
   * character encoding is used and to suppress errors concerning HTML5
   * elements.
   */
  protected function loadHtml(string $html): DOMDocument {
    $dom = new DOMDocument();
    // Suppress errors with HTML5 elements.
    libxml_use_internal_errors(true);
    $dom->loadHTML('<meta http-equiv="Content-Type" content="text/html; charset=utf-8">' . $html);
    libxml_use_internal_errors(false);
    return $dom;
  }

  /**
   * Return an HTML string from a DOMDocument object.
   *
   * Use this method instead of DOMDocument::saveHTML() to ensure that character
   * encode meta tags are stripped appropriately.
   */
  protected function returnHtml(DOMDocument $dom): string {
    foreach ($dom->getElementsByTagName('meta') as $meta) {
      if (
        $meta->getAttribute('http-equiv') === 'Content-Type' &&
        $meta->getAttribute('content') === 'text/html; charset=utf-8'
      ) {
        $meta->parentNode->removeChild($meta);
      }
    }
    return $dom->saveHTML();
  }
}
