<?php

namespace BcSitkaSpruce\Library\Content\TextFilter;

/**
 * Text filter to add a class to all external links.
 */
class ExternalLinkFilter extends TextFilter implements ExternalLinkFilterInterface {

  protected array $domainBlacklist = [];

  protected string $linkClass = 'elf-external';

  /**
   * @inheritDoc
   */
  public function addToBlacklist(string $domain): void {
    if (!in_array($domain, $this->domainBlacklist)) {
      $this->domainBlacklist[] = $domain;
    }
  }

  /**
   * @inheritDoc
   */
  public function removeFromBlacklist(string $domain): void {
    if (in_array($domain, $this->domainBlacklist)) {
      $this->domainBlacklist = array_diff($this->domainBlacklist, [$domain]);
    }
  }

  /**
   * @inheritDoc
   */
  public function setLinkClass(string $class): void {
    $this->linkClass = $class;
  }

  /**
   * @inheritDoc
   */
  public function filter(string $content): string {
    if (
      empty($content) ||
      !$this->domainBlacklist ||
      strpos($content, 'href') === false
    ) {
      return $content;
    }

    $dom = $this->loadHtml($content);

    foreach ($dom->getElementsByTagName('a') as $link) {
      // Skip fancybox links.
      if ($link->hasAttribute('data-fancybox')) {
        continue;
      }
      $href = $link->getAttribute('href');
      if ($this->linkIsExternal($href)) {
        $new_class = $link->getAttribute('class') ?
          $link->getAttribute('class') . ' ' . $this->linkClass :
          $this->linkClass;
        $link->setAttribute('class', $new_class);
      }
    }

    return $this->returnHtml($dom);
  }

  /**
   * Check if a link is an external link.
   */
  protected function linkIsExternal(string $href): bool {
    if (strpos($href, 'mailto:') !== false) {
      return false;
    }
    $pattern = '/(' . implode('|', $this->domainBlacklist) . ')/';
    return !preg_match($pattern, $href);
  }

}
