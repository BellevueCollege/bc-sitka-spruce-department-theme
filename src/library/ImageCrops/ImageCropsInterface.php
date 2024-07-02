<?php

namespace BcSitkaSpruce\Library\ImageCrops;

/**
 * Definition for an API for adding image crops.
 */
interface ImageCropsInterface {

  /**
   * Add a new image size to the theme.
   *
   * @param string $name
   *   The image size name to add.
   * @param int $width
   *   The width.
   * @param int $height
   *   The height.
   * @param bool|array $crop
   *   Image cropping behavior.
   *
   * @see \add_image_size()
   */
  public function addImageSize(
    string $name,
    int $width,
    int $height,
    $crop = false
  ): void;

}
