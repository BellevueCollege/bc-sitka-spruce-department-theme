<?php

namespace BcSitkaSpruce\Library\Twig;

use DateTimeImmutable;
use Timber\Image;
use Timber\Post;
use Timber\Timber;

/**
 * Custom functions and filters to extend Twig.
 */
class TwigExtensions {

  /**
   * Render an ACF email field as a link.
   *
   * @param array|bool|null $email
   *   The email field array.
   * @param string $title
   *   Optional link text.
   * @param array $attributes
   *   Link attribute values, keyed by attribute name.
   */
  public static function acfEmail($email, string $title = '', array $attributes = []): string {
    return static::acfLink(
      [
        'title' => $title ?: $email,
        'url' => "mailto:$email",
      ],
      $attributes,
    );
  }

  /**
   * Render and ACF image field as HTML.
   *
   * @param \Timber\Image|string[] $image
   *   A \Timber\Image object or an array from an ACF image field.
   * @param string $src_size
   *   The string name of a WordPress image size.
   * @param string[] $srcset_sizes
   *   An array of WordPress image size strings to be used as the srcset.
   * @param string[] $sizes
   *   Array of sizes for the sizes attribute.
   * @param string[] $attributes
   *   Additional attributes.
   *
   * @return string
   *   A string of all attributes.
   */
  public static function acfImage(
    $image,
    string $src_size = '',
    array $srcset_sizes = [],
    array $sizes = [],
    array $attributes = []
  ): string {
    if (!$image) {
      return '';
    }

    return sprintf(
      '<img %s>',
      self::imageAttributes($image, $src_size, $srcset_sizes, $sizes, $attributes)
    );
  }

  /**
   * Render an ACF link field as HTML.
   *
   * @param array|bool|null $link
   *   The link field array.
   * @param array $attributes
   *   Link attribute values, keyed by attribute name.
   */
  public static function acfLink($link, array $attributes = []): string {
    if (!$link) {
      return '';
    }

    $attributes = array_merge([
      'target' => (isset($link['target']) && $link['target']) ? $link['target'] : '_self',
    ], $attributes);

    if ($attributes['target'] === '_blank') {
      $attributes['aria-label'] = __(sprintf(
        '%1$s (opens in a new window)',
        $link['title']
      ), 'bellevue_2022');
    }

    return sprintf(
      '<a href="%1$s"%2$s>%3$s</a>',
      $link['url'],
      self::parseAttributes($attributes),
      $link['title'],
    );
  }

  /**
   * Render an ACF repeater of link fields as HTML.
   *
   * @param array|bool|null $links
   *   The link field array.
   * @param array $attributes
   *   Link attribute values, keyed by attribute name.
   * @param string $link_field_name
   *   The repeater field name.
   */
  public static function acfLinks(
    $links,
    array $attributes = [],
    string $link_field_name = 'link'
  ): array {
    if (!$links) {
      return [];
    }

    foreach ($links as &$link) {
      $link = self::acfLink($link[$link_field_name], $attributes);
    }

    return $links;
  }

  /**
   * Render an ACF phone field as a link.
   *
   * @param array|bool|null $phone
   *   The phone field array.
   * @param string $title
   *   Optional link text.
   * @param array $attributes
   *   Link attribute values, keyed by attribute name.
   */
  public static function acfPhone($phone, string $title = '', array $attributes = []): string {
    return static::acfLink(
      [
        'title' => $title ?: $phone,
        'url' => 'tel:' . preg_replace('/\D/', '', $phone),
      ],
      $attributes,
    );
  }

  /**
   * Render an Acalog link
   *
   * @param string $program_name
   *   The email field array.
   * @param string $title
   *   Link text.
   * @param array $attributes
   */
  public static function acalogLink(string $program_name, string $title = '', array $attributes = []): string {

    // Allow URL to be filtered. Used by BC Acalog WordPress Blocks plugin to inject an accurate link.
    $url = apply_filters( 'bellevue2022_acalog_url', 'https://catalog.bellevuecollege.edu/', $program_name );

    
    return static::acfLink([
      'title' => $title ?: $program_name,
      'url' => $url,
    ], $attributes);
  }

  /**
   * Wrap items in li tags.
   *
   * @param string[]|null $items
   *   Items to wrap.
   * @param array $attributes
   *   li attribute values, keyed by attribute name.
   */
  public static function li(?array $items, array $attributes = []): array {
    return self::wrapTags($items, 'li', $attributes);
  }

  /**
   * Wrap items in an ol tag.
   *
   * @param string[]|null $items
   *   Items to wrap.
   * @param array $attributes
   *   ol attribute values, keyed by attribute name.
   */
  public static function ol(?array $items, array $attributes = []): string {
    return self::wrapTag(implode(PHP_EOL, $items), 'ol', $attributes);
  }

  /**
   * Wrap items in an ul tag.
   *
   * @param string[]|null $items
   *   Items to wrap.
   * @param array $attributes
   *   ul attribute values, keyed by attribute name.
   */
  public static function ul(?array $items, array $attributes = []): string {
    return self::wrapTag(implode(PHP_EOL, $items), 'ul', $attributes);
  }

  /**
   * Build an attributes string for an image.
   *
   * @param \Timber\Image|string[] $image
   *   A \Timber\Image object or an array from an ACF image field.
   * @param string $src_size
   *   The string name of a WordPress image size.
   * @param string[] $srcset_sizes
   *   An array of WordPress image size strings to be used as the srcset.
   * @param string[] $sizes
   *   Array of sizes for the sizes attribute.
   * @param string[] $attributes
   *   Additional attributes.
   *
   * @return string
   *   A string of all attributes.
   */
  public static function imageAttributes(
    $image,
    string $src_size = '',
    array $srcset_sizes = [],
    array $sizes = [],
    array $attributes = []
  ): string {
    if (!$image instanceof Image) {
      $image = Timber::get_image($image['id']);
    }

    // Define our default attributes.
    $image_attributes = [
      'src' => $image->src($src_size),
      // Default width and height to those from the original image.
      'width' => $image->width(),
      'height' => $image->height(),
      'alt' => $image->alt(),
      'srcset' => '',
    ] + $attributes;

    // Update width / height width values from src_size if the size exists.
    if (!empty($src_size) && isset($image->sizes[$src_size])) {
      $image_attributes['width'] = $image->sizes[$src_size]['width'];
      $image_attributes['height'] = $image->sizes[$src_size]['height'];
    }

    // Build srcset with available sizes.
    foreach ($srcset_sizes as $s) {
      if (!empty($s) && isset($image->sizes[$s])) {
        $size_string = empty($image_attributes['srcset']) ? '' : ', ';
        $size_string .= $image->src($s) . ' ' . $image->sizes[$s]['width'] . 'w, ';
        $image_attributes['srcset'] .= $size_string;
      } elseif (!empty($s)) {
        $image_attributes['srcset'] .= $image->src() . ' ' . $image->width() . 'w, ';
      }
    }

    // Add the sizes attribute.
    if ($sizes) {
      $image_attributes['sizes'] = implode(', ', $sizes);
    }

    // Convert the attributes array to an attributes string.
    $attributes_string = '';
    foreach ($image_attributes as $attr => $val) {
      if (!empty($val)) {
        $attributes_string .= $attr . '="' . $val . '" ';
      }
    }

    return trim($attributes_string);
  }

  /**
   * Render a flexible content field on a post.
   *
   * Each row within the flexible content field is rendered by individual Twig
   * templates, based on the layout name. A layout of featured_news will use the
   * featured-news.twig template. The template used can be overridden with the
   * "bellevue/flexible_content/{layout}/template" filter, documented below. Context
   * data can also be altered per-layout before rendering, with the
   * "bellevue/flexible_content/{layout}/content" filter, also documented below.
   * Example usage follows.
   *
   * Render the page sections field:
   * @code
   * {{ flexible_content(post, 'page_sections') }}
   * @endcode
   *
   * Check if a flexible content field has data:
   * @code
   * {% set accordions = flexible_content(post, 'accordions') %}
   * {% if accordions %}
   *   # Do something...
   *   {{ accordions }}
   * {% endif %}
   * @endcode
   *
   * Alter the template used to render a layout on news:
   * @code
   * function alter_accordions_template(string $template, \Timber\Post $post): string {
   *   if ($post->post_type === 'news') {
   *     return 'accordions-news.twig';
   *   }
   *   return $template;
   * }
   * add_filter('bellevue/flexible_content/accordions/template, 'alter_accordions_template', 10, 2);
   * @endcode
   *
   * Add data to the Twig context before rendering:
   * @code
   * function alter_accordions_context(array $context, \Timber\Post $post): array {
   *   $context['related_posts'] = get_related_posts($post->id);
   *   return $context;
   * }
   * add_filter('bellevue/flexible_content/accordions/context, 'alter_accordions_context', 10, 2);
   * @endcode
   *
   * @param \Timber\Post $post
   *   The post containing the flexible content field.
   * @param string $field_name
   *   The flexible content field name.
   *
   * @return string
   *   The rendered flexible content field.
   */
  public static function flexibleContent(Post $post, string $field_name): string {
    $fields = get_fields($post->id);
    if (!isset($fields[$field_name]) || !$fields[$field_name]) {
      return '';
    }

    $field_name_sanitized_underscore = str_replace('-', '_', $field_name);

    $rendered = [];

    foreach ($fields[$field_name] as $field) {
      $layout = $field['acf_fc_layout'];
      $layout_sanitized_dashes = str_replace('_', '-', $layout);
      $layout_sanitized_underscore = str_replace('-', '_', $layout);
      $context = Timber::context();

      /**
       * Alter the template used to render the flexible content field.
       *
       * By default, a template name corresponding to the flexible content
       * layout name will be used (e.g. featured-news.twig for the featured_news
       * layout).
       *
       * @param string $template
       *   The template used to render the flexible content field.
       * @param \Timber\Post $post
       *   The current Timber post object.
       *
       * @return string
       *   The name of the template to render.
       */
      $template = apply_filters("bellevue/flexible_content/$layout_sanitized_underscore/template", "$layout_sanitized_dashes.twig", $post);
      $template = apply_filters("bellevue/flexible_content/$field_name_sanitized_underscore/$layout_sanitized_underscore/template", $template, $post);

      $context['acf'] = $field;
      /**
       * Alter the field data before rendering the flexible content field.
       *
       * @param array $field
       *   The field data to alter.
       * @param \Timber\Post $post
       *   The current Timber post object.
       *
       * @return array
       *   Field data to pass to the template.
       */
      $context = apply_filters("bellevue/flexible_content/$layout_sanitized_underscore/context", $context, $post);
      $context = apply_filters("bellevue/flexible_content/$field_name_sanitized_underscore/$layout_sanitized_underscore/context", $context, $post);

      $use_controller = apply_filters("bellevue/flexible_content/$layout_sanitized_underscore/controller", false);
      if ($use_controller) {
        $rendered[] = include get_template_directory() . "/controllers/components/$layout_sanitized_dashes.php";
      } else {
        $rendered[] = Timber::compile($template, $context) ?: '';
      }
    }

    /**
     * Alter the rendered flexible content field data.
     *
     * @param string[] $rendered
     *   An array of each rendered layout, keyed by layout name.
     * @param \Timber\Post $post
     *   The current Timber post object.
     *
     * @return string[]
     *   The rendered layouts.
     */
    $rendered = apply_filters("bellevue/flexible_content/$field_name_sanitized_underscore/rendered", $rendered, $post);

    return implode('', $rendered);
  }

  /**
   * Build a filtered url from an array of parameters and objects.
   *
   * Build a news page url with type and topic (taxonomy) parameters:
   * @code
   * {{ filtered_url(bellevue_news_path, {
   *   type: {
   *     id_key: 'term_id',
   *     values: acf.news_types,
   *   },
   *   topic: {
   *     id_key: 'term_id',
   *     values: acf.news_topics,
   *   },
   * }) }}
   * @endcode
   *
   * Build a profile page url with program (post type) parameter:
   * @code
   * {{ filtered_url(bellevue_profile_path, {
   *   program: {
   *     id_key: 'ID',
   *     values: acf.programs,
   *   },
   * }) }}
   * @endcode
   *
   * @param string $url
   *   The base url string.
   * @param array[] $parameters
   *   Parameters keyed by parameter name. Each array must have the following
   *   keys:
   *     - id_key: The id key for the type of objects passed.
   *     - values: An array of objects to create values from.
   */
  public static function filteredUrl(
    string $url,
    array $parameters = []
  ): string {
    $parsed_parameters = [];

    foreach ($parameters as $parameter => $values) {
      foreach ($values['values'] as $value) {
        $parsed_parameters[$parameter][] = [$value->{$values['id_key']}];
      }
    }

    return $url . http_build_query($parsed_parameters);
  }

  /**
   * Render a datetime range.
   *
   * @param string $start_date
   *   A start date string.
   * @param string $end_date
   *   An end date string.
   * @param string $date_format
   *   A date format string.
   * @param string $time_format
   *   A time format string.
   * @param bool $all_day
   *   If TRUE, display the all day label.
   * @param bool $various_times
   *   If TRUE, display the various times label.
   * @param string $date_time_join
   *   The date/time join string.
   * @param string $date_separator
   *   A start/end date separator string.
   * @param string $all_day_label
   *   The all day label.
   * @param string $various_times_label
   *   The various times label.
   *
   * @return string
   *   The rendered datetime range.
   */
  public static function datetimeRange(
    string $start_date,
    string $end_date,
    string $date_format = '',
    string $time_format = '',
    bool $all_day = FALSE,
    bool $various_times = FALSE,
    string $date_time_join = ', ',
    string $date_separator = ' - ',
    string $all_day_label = 'All day',
    string $various_times_label = 'Various times'
  ): string {
    $datetime_range = '';
    $start_datetime = new DateTimeImmutable($start_date);

    // Get the formatted start date.
    $formatted_start_date = !empty($date_format) ? $start_datetime->format($date_format) : '';

    // Get the formatted start time.
    $formatted_start_time = !empty($time_format) ? $start_datetime->format($time_format): '';

    // Get the formatted end date and time strings.
    $formatted_end_date = '';
    $formatted_end_time = '';
    if (!empty($end_date)) {
      $end_datetime = new DateTimeImmutable($end_date);

      // Get the formatted end date.
      $formatted_end_date = !empty($date_format) ? $end_datetime->format($date_format) : '';

      // Get the formatted end time.
      $formatted_end_time = !empty($time_format) ? $end_datetime->format($time_format): '';
    }

    // Determine whether the start date and time strings will be appended.
    $append_start_date = !empty($formatted_start_date);
    $append_start_time = (
      !empty($formatted_start_time) &&
      !$various_times &&
      !$all_day &&
      (strcmp($formatted_start_time, $formatted_end_time) !== 0)
    );

    // Append the formatted start date.
    if ($append_start_date) {
      $datetime_range .= $formatted_start_date;
    }

    // Append the datetime join string if there is a date and a time
    // to join.
    if ($append_start_date && $append_start_time) {
      $datetime_range .= $date_time_join;
    }

    // Append the formatted start time.
    if ($append_start_time) {
      $datetime_range .= $formatted_start_time;
    }

    // Determine whether the end date and time strings will be appended.
    $append_end_date = (
      !empty($formatted_end_date) &&
      (strcmp($formatted_end_date, $formatted_start_date) !== 0)
    );
    $append_end_time = (
      !empty($formatted_end_time) &&
      !$various_times &&
      !$all_day
    );

    // Append the date separator string if there is a start and end
    // date and/or time to join.
    if (!empty($datetime_range) && ($append_end_date || $append_end_time)) {
      $datetime_range .= $date_separator;
    }

    // Append the formatted end date.
    if ($append_end_date) {
      $datetime_range .= $formatted_end_date;
    }

    // Append the datetime join string if there is a date and a time
    // to join.
    if ($append_end_date && ($append_end_time || $various_times || $all_day)) {
      $datetime_range .= $date_time_join;
    }

    // Append the formatted end time.
    if ($append_end_time) {
      $datetime_range .= $formatted_end_time;
    }

    // Add the various times or all day label if applicable.
    if ($various_times) {
      $datetime_range .= $various_times_label;
    }
    elseif ($all_day) {
      $datetime_range .= $all_day_label;
    }

    return $datetime_range;
  }

  /**
   * Render a date block.
   *
   * @param string $start_date
   *   A start date string.
   * @param string $end_date
   *   An end date string.
   * @param string[] $date_format_parts
   *   An array of date format strings keyed by names (e.g. 'day', 'month').
   */
  public static function dateBlock(string $start_date, string $end_date, array $date_format_parts): string {
    // Build the array of formatted start date parts.
    $start_datetime = new DateTimeImmutable($start_date);
    $start_date_parts = [];
    foreach ($date_format_parts as $name => $date_format) {
      if (!empty($date_format)) {
        $start_date_parts[$name] = $start_datetime->format($date_format);
      }
    }

    // Build the array of formatted end date parts if there is
    // an end date and it is not the same day as the start date.
    $end_date_parts = [];
    if (!empty($end_date)) {
      $end_datetime = new DateTimeImmutable($end_date);
      if (strcmp($start_datetime->format('Y-m-d'), $end_datetime->format('Y-m-d')) !== 0) {
        foreach ($date_format_parts as $name => $date_format) {
          if (!empty($date_format)) {
            $end_date_parts[$name] = $end_datetime->format($date_format);
          }
        }
      }
    }

    // Prepare the date block for rendering.
    $context['start_date'] = $start_datetime->format('U');
    $context['end_date'] = $end_date ? $end_datetime->format('U') : '';
    $context['start_date_parts'] = $start_date_parts;
    $context['end_date_parts'] = $end_date_parts;
    return Timber::compile('includes/date-block.twig', $context);
  }

  /**
   * Parse an attributes array into an attributes string.
   *
   * @param array[]|string[] $attributes
   *   Attribute values, keyed by attribute name. Values can be an array or
   *   string.
   */
  protected static function parseAttributes(array $attributes): string {
    foreach ($attributes as $attribute => &$value) {
      $value = sprintf(
        '%1$s="%2$s"',
        $attribute,
        is_array($value) ?
          implode(' ', $value) :
          (string) $value
      );
    }

    return ' ' . implode(' ', $attributes);
  }

  /**
   * Wrap markup in an HTML tag.
   *
   * @param ?string $markup
   *   Markup to wrap.
   * @param string $tag
   *   The wrapping tag.
   * @param array $attributes
   *   Tag attribute values, keyed by attribute name.
   */
  protected static function wrapTag(
    ?string $markup,
    string $tag,
    array $attributes = []
  ): string {
    if (!$markup) {
      return '';
    }

    return sprintf(
      '<%1$s%2$s>%3$s</%1$s>',
      $tag,
      self::parseAttributes($attributes),
      $markup
    );
  }

  /**
   * Wrap markup in an HTML tag.
   *
   * @param ?string[] $items
   *   Items to wrap.
   * @param string $tag
   *   The wrapping tag.
   * @param array $attributes
   *   Tag attribute values, keyed by attribute name.
   */
  protected static function wrapTags(
    ?array $items,
    string $tag,
    array $attributes = []
  ): array {
    if (!$items) {
      return [];
    }

    foreach ($items as &$item) {
      $item = self::wrapTag($item, $tag, $attributes);
    }

    return $items;
  }

}
