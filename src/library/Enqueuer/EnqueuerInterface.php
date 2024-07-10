<?php

namespace BcSitkaSpruce\Library\Enqueuer;

/**
 * Definition for an API for loading theme scripts and stylesheets.
 */
interface EnqueuerInterface {

  /**
   * Add a script to be loaded by the theme.
   *
   * @param string $handle
   *   Script internal identifier.
   * @param string $src
   *   Script source. Local sources should start with a single slash, external
   *   sources a double slash.
   * @param string[] $dependencies
   *   Array of dependency handles.
   * @param string $base_path
   *   The base script path. Defaults to the current theme's path.
   * @param string|bool|null $version
   *   A version number to append to the script source, false to never generate
   *   one, or null to allow the enqueuer to generate one based on the value of
   *   self::appendVersion.
   * @param bool $footer
   *   Load the script in the footer.
   * @param bool $use_asset_file
   *   Load the script using version and dependencies from an asset file.
   */
  public function addScript(
    string $handle,
    string $src,
    array $dependencies = [],
    $base_path = '',
    $version = null,
    bool $footer = TRUE,
    bool $use_asset_file = false
  ): void;

  /**
   * Remove a script from being loaded by the theme.
   *
   * @param string $handle
   *   Script internal identifier.
   */
  public function removeScript(string $handle): void;

  /**
   * Add a stylesheet to be loaded by the theme.
   *
   * @param string $handle
   *   Stylesheet internal identifier.
   * @param string $src
   *   Stylesheet source. Local sources should start with a single slash,
   *   external sources a double slash.
   * @param string[] $dependencies
   *   Array of dependency handles.
   * @param string $base_path
   *   The base stylesheet path. Defaults to the current theme's path.
   * @param string|bool|null $version
   *   A version number to append to the stylesheet source, false to never
   *   generate one, or null to allow the enqueuer to generate one based on the
   *   value of self::appendVersion.
   * @param string $media
   *   A CSS media query string on which to load the stylesheet.
   * @param bool $use_asset_file
   *   Load the stylesheet using version and dependencies from an asset file.
   */
  public function addStyle(
    string $handle,
    string $src,
    array $dependencies = [],
    $base_path = '',
    $version = null,
    string $media = 'all',
    bool $use_asset_file = false
  ): void;

  /**
   * Remove a stylesheet from being loaded by the theme.
   *
   * @param string $handle
   *   Stylesheet internal identifier.
   */
  public function removeStyle(string $handle): void;

}
