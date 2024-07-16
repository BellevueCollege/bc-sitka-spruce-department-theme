<?php

namespace BcSitkaSpruce\Library\Twig;

/**
 * An API for moving page templates to a sub-folder.
 */
class Templates implements TemplatesInterface {

  public string $subfolder = 'src/controllers/page-templates';

  public function __construct() {
    add_action('init', [$this, 'setupTemplatesFolder'], 10, 0);
  }

  /**
   * Setup templates folder location.
   *
   * Callback for the 'init' action.
   */
  public function setupTemplatesFolder(): void {
    foreach (self::CORE_TEMPLATE_TYPES_TO_MOVE as $template) {
      add_filter("{$template}_template_hierarchy", [$this, 'subfolderCoreTemplates'], 99, 1);
    }
  }

  /**
   * Subfolder core templates.
   *
   * Callback for the '{$type}_template_hierarchy' action.
   *
   * @param string[] $templates
   *   Array of all possible template locations.
   *
   * @retrn string[]
   *   Template locations with the sub-folder path prepended.
   */
  public function subfolderCoreTemplates(array $templates): array {
    foreach ($templates as &$template) {
      // Don't prefix page templates, as they already prepend the folder name.
      if (strpos($template, $this->subfolder) === false) {
        $template = "{$this->subfolder}/{$template}";
      }
    }
    return $templates;
  }

}
