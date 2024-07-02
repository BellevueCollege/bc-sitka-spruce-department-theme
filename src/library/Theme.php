<?php

namespace BcSitkaSpruce\Library;

use BcSitkaSpruce\Library\Acf\OptionsPageInterface;
use BcSitkaSpruce\Library\Breadcrumbs\BreadcrumbsInterface;
use BcSitkaSpruce\Library\Configuration\BlockEditorInterface;
use BcSitkaSpruce\Library\Configuration\CustomizerInterface;
use BcSitkaSpruce\Library\Configuration\ThemeOptionsInterface;
use BcSitkaSpruce\Library\Container\Container as ServiceContainer;
use BcSitkaSpruce\Library\Container\ContainerInterface;
use BcSitkaSpruce\Library\Content\TextFiltersInterface;
use BcSitkaSpruce\Library\Content\WysiwygInterface;
use BcSitkaSpruce\Library\Enqueuer\EnqueuerInterface;
use BcSitkaSpruce\Library\ImageCrops\ImageCropsInterface;
use BcSitkaSpruce\Library\LoginPage\LoginPageInterface;
use BcSitkaSpruce\Library\Menus\MenusInterface;
use BcSitkaSpruce\Library\Menus\NavBuilderInterface;
use BcSitkaSpruce\Library\Twig\TemplatesInterface;
use BcSitkaSpruce\Library\Twig\TimberHelperInterface;

/**
 * Main container class.
 *
 * This class is responsible for setting up the service container, and provides
 * type-hinted methods for retrieving the services.
 */
class Theme {

  /**
   * An array of service definitions, keyed by service name and containing
   * classes as values.
   *
   * @var string[]
   */
  const SERVICE_DEFINITIONS = [
    'acf_options_page' => 'BcSitkaSpruce\Library\\Acf\\OptionsPage',
    'breadcrumbs' => 'BcSitkaSpruce\Library\\Breadcrumbs\\Breadcrumbs',
    'block_editor' => 'BcSitkaSpruce\Library\\Configuration\\BlockEditor',
    'theme_options' => 'BcSitkaSpruce\Library\\Configuration\\ThemeOptions',
    'customizer' => 'BcSitkaSpruce\Library\\Configuration\\Customizer',
    'text_filters' => 'BcSitkaSpruce\Library\\Content\\TextFilters',
    'wysiwyg' => 'BcSitkaSpruce\Library\\Content\\Wysiwyg',
    'enqueuer' => 'BcSitkaSpruce\Library\\Enqueuer\\Enqueuer',
    'image_crops' => 'BcSitkaSpruce\Library\\ImageCrops\\ImageCrops',
    'login_page' => 'BcSitkaSpruce\Library\\LoginPage\\LoginPage',
    'menus' => 'BcSitkaSpruce\Library\\Menus\\Menus',
    'nav_builder' => 'BcSitkaSpruce\Library\\Menus\\NavBuilder',
    'templates' => 'BcSitkaSpruce\Library\\Twig\\Templates',
    'timber_helper' => 'BcSitkaSpruce\Library\\Twig\\TimberHelper',
  ];

  protected static ?ContainerInterface $container = null;

  /**
   * Get the service container.
   *
   * @return \BcSitkaSpruce\Library\Container\ContainerInterface
   *   The service container.
   */
  public static function getContainer(): ContainerInterface {
    if (static::$container === null) {
      static::setupContainer();
    }
    return static::$container;
  }

  /**
   * Set the service container to a new container.
   *
   * @param \BcSitkaSpruce\Library\Container\ContainerInterface $container
   *   The container to set.
   */
  public static function setContainer(ContainerInterface $container): void {
    static::$container = $container;
  }

  /**
   * Set up the service container according to the service definitions.
   */
  protected static function setupContainer() {
    $container = new ServiceContainer();
    foreach (static::SERVICE_DEFINITIONS as $service => $class) {
      $container->set($service, $class);
    }
    static::setContainer($container);
  }

  /**
   * Retrieve the options service.
   *
   * @return \BcSitkaSpruce\Library\Acf\OptionsPageInterface
   *   The options service.
   */
  public static function acfOptions(): OptionsPageInterface {
    return static::getContainer()->get('acf_options_page');
  }

  /**
   * Retrieve the block_editor service.
   */
  public static function blockEditor(): BlockEditorInterface {
    return static::getContainer()->get('block_editor');
  }

  /**
   * Retrieve the breadcrumbs service.
   */
  public static function breadcrumbs(): BreadcrumbsInterface {
    return static::getContainer()->get('breadcrumbs');
  }

  /**
   * Retrieve the customizer service.
   */
  public static function customizer(): CustomizerInterface {
    return static::getContainer()->get('customizer');
  }

  /**
   * Retrieve the enqueuer service.
   */
  public static function enqueuer(): EnqueuerInterface {
    return static::getContainer()->get('enqueuer');
  }

  /**
   * Retrieve the image_crops service.
   */
  public static function imageCrops(): ImageCropsInterface {
    return static::getContainer()->get('image_crops');
  }

  /**
   * Retrieve the login_page service.
   */
  public static function loginPage(): LoginPageInterface {
    return static::getContainer()->get('login_page');
  }

  /**
   * Retrieve the menus service.
   */
  public static function menus(): MenusInterface {
    return static::getContainer()->get('menus');
  }

  /**
   * Retrieve the nav builder service.
   */
  public static function navBuilder(): NavBuilderInterface {
    return static::getContainer()->get('nav_builder');
  }

  /**
   * Retrieve the templates service.
   */
  public static function templates(): TemplatesInterface {
    return static::getContainer()->get('templates');
  }

  /**
   * Retrieve the text_filters service.
   */
  public static function textFilters(): TextFiltersInterface {
    return static::getContainer()->get('text_filters');
  }

  /**
   * Retrieve the theme options service.
   */
  public static function themeOptions(): ThemeOptionsInterface {
    return static::getContainer()->get('theme_options');
  }

  /**
   * Retrieve the timber_helper service.
   */
  public static function timberHelper(): TimberHelperInterface {
    return static::getContainer()->get('timber_helper');
  }

  /**
   * Retrieve the wysiwyg service.
   */
  public static function wysiwyg(): WysiwygInterface {
    return static::getContainer()->get('wysiwyg');
  }

}
