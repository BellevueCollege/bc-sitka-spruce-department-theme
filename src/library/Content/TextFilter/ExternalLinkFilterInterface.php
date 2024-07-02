<?php

namespace BcSitkaSpruce\Library\Content\TextFilter;

/**
 * Text filter which adds classes to all external links.
 */
interface ExternalLinkFilterInterface extends TextFilterInterface {

  /**
   * Add a domain to the blacklist.
   *
   * Blacklisted domains will not get the external link class.
   */
  public function addToBlacklist(string $domain): void;

  /**
   * Remove a domain to the blacklist.
   *
   * Blacklisted domains will not get the external link class.
   */
  public function removeFromBlacklist(string $domain): void;

  /**
   * Set the class added to external links.
   */
  public function setLinkClass(string $class): void;

}
