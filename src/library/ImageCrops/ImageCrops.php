<?php

namespace BcSitkaSpruce\Library\ImageCrops;

/**
 * An API for adding image crops.
 */
class ImageCrops implements ImageCropsInterface {

  protected array $imageSizes = [];

  public function __construct() {
    add_action('after_setup_theme', [$this, 'setupAddImageSizes'], 10, 0);
  }

  /**
   * {@inheritdoc}
   */
  public function addImageSize(
    string $name,
    int $width,
    int $height,
    $crop = false
  ): void {
    $this->imageSizes = array_merge($this->imageSizes, [
      $name => [
        'width' => $width,
        'height' => $height,
        'crop' => $crop,
      ],
    ]);
  }

  /**
   * Callback for the 'after_setup_theme' action.
   */
  public function setupAddImageSizes(): void {
    foreach ($this->imageSizes as $name => $size) {
      add_image_size($name, $size['width'], $size['height'], $size['crop']);
    }
  }

  /**
   * Callback for the 'after_setup_theme' action.
   */
  public function setupRemoveImageSizes(): void {
  foreach ($this->imageSizes as $name) {
      remove_image_size($name);
    }
  }

}
