<?php

namespace BcSitkaSpruce\Library\Twig;

use Timber\Timber;
use Twig\Environment;
use Twig\TwigFilter;
use Twig\TwigFunction;
use WP_Block;

/**
 * An API for setup and automatic loading of templates using Timber.
 */
class TimberHelper implements TimberHelperInterface {

  protected array $defaultFolders = [
    'views',
    'views/atoms',
    'views/blocks',
    'views/components',
    'views/content',
    'views/includes',
    'views/listings',
    'views/listings/news',
    'views/listings/organization',
    'views/listings/program',
    'views/other',
    'views/system',
    'views/wordpress',
    'stories'
  ];

  protected array $templateLocations = [
    'views',
    'views/atoms',
    'views/blocks',
    'views/components',
    'views/content',
    'views/includes',
    'views/listings',
    'views/other',
    'views/system',
    'views/wordpress',
    'stories'
  ];

  protected array $filters = [];

  protected array $functions = [];

  public function __construct() {
    Timber::$dirname = $this->defaultFolders;
    Timber::$locations = $this->templateLocations;
    add_action('timber/twig', array($this, 'setupFilters'), 10, 1);
    add_action('timber/twig', array($this, 'setupFunctions'), 10, 1);
  }

  /**
   * @inheritDoc
   */
  public function addBaseExtensions(): void {
    $this->addFilter('acf_email', ['\BcSitkaSpruce\Library\Twig\TwigExtensions', 'acfEmail']);
    $this->addFilter('acf_image', ['\BcSitkaSpruce\Library\Twig\TwigExtensions', 'acfImage']);
    $this->addFilter('acf_link', ['\BcSitkaSpruce\Library\Twig\TwigExtensions', 'acfLink']);
    $this->addFilter('acf_links', ['\BcSitkaSpruce\Library\Twig\TwigExtensions', 'acfLinks']);
    $this->addFilter('acf_phone', ['\BcSitkaSpruce\Library\Twig\TwigExtensions', 'acfPhone']);
    $this->addFilter('acalog_link', ['\BcSitkaSpruce\Library\Twig\TwigExtensions', 'acalogLink']);
    $this->addFilter('ol', ['\BcSitkaSpruce\Library\Twig\TwigExtensions', 'ol']);
    $this->addFilter('li', ['\BcSitkaSpruce\Library\Twig\TwigExtensions', 'li']);
    $this->addFilter('ul', ['\BcSitkaSpruce\Library\Twig\TwigExtensions', 'ul']);

    $this->addFunction('date_block', ['\BcSitkaSpruce\Library\Twig\TwigExtensions', 'dateBlock']);
    $this->addFunction('datetime_range', ['\BcSitkaSpruce\Library\Twig\TwigExtensions', 'datetimeRange']);
    $this->addFunction('flexible_content', ['\BcSitkaSpruce\Library\Twig\TwigExtensions', 'flexibleContent']);
    $this->addFunction('image_attr', ['\BcSitkaSpruce\Library\Twig\TwigExtensions', 'imageAttributes']);
    $this->addFunction('filtered_url', ['BcSitkaSpruce\Library\Twig\TwigExtensions', 'filteredUrl']);
  }

  /**
   * @inheritDoc
   */
  public function addDefaultFolder(string $path, int $weight): void {
    $this->defaultFolders = $this->insertAndReorderArray(
      $weight,
      $path,
      $this->defaultFolders
    );
  }

  /**
   * @inheritDoc
   */
  public function addTemplateLocation(string $path, int $weight): void {
    $this->templateLocations = $this->insertAndReorderArray(
      $weight,
      $path,
      $this->templateLocations
    );
  }

  /**
   * @inheritDoc
   */
  public function addFilter(string $name, $callable = null, array $options = []): void {
    $this->filters[$name] = [
      'callback' => $callable,
      'options' => $options,
    ];
  }

  /**
   * @inheritDoc
   */
  public function addFunction(string $name, $callable = null, array $options = []): void {
    $this->functions[$name] = [
      'callback' => $callable,
      'options' => $options,
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function renderBlock(
    array $block,
    string $content,
    bool $is_preview,
    int $post_id,
    ?WP_Block $wp_block
  ): void {
    $name = str_replace('acf/', '', $block['name']);
    $name_undercore = str_replace('-', '_', $name);
    $context = Timber::context();
    $context['block'] = $block;
    $context['acf'] = get_fields();
    $context['is_preview'] = $is_preview;
    $context = apply_filters("bellevue/block/$name_undercore/context", $context);
    $use_controller = apply_filters("bellevue/block/$name_undercore/controller", false);
    if ($use_controller) {
      include get_template_directory() . "/controllers/components/$layout_sanitized_dashes.php";
    } else {
      Timber::render("components/$name.twig", $context);
    }
  }

  /**
   * Callback for the 'timber/twig/filters' action.
   */
  public function setupFilters(Environment $twig): Environment {
    foreach ($this->filters as $name => $data) {
      $twig->addFilter(new TwigFilter($name, $data['callback'], $data['options']));
    }
    return $twig;
  }

  /**
   * Callback for the 'timber/twig' action.
   */
  public function setupFunctions(Environment $twig): Environment {
    foreach ($this->functions as $name => $data) {
      $twig->addFunction(new TwigFunction($name, $data['callback'], $data['options']));
    }
    return $twig;
  }

  /**
   * Insert a new value in an array at a key. Reorder existing array elements
   * after the key.
   */
  protected function insertAndReorderArray(
    int $key,
    $value,
    array $array
  ): array {
    if (!array_key_exists($key, $array)) {
      $array[$key] = $value;
    }
    else {
      array_splice($array, $key, 0, $value);
    }

    return $array;
  }

}
