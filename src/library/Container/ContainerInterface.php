<?php

namespace BcSitkaSpruce\Library\Container;

use Psr\Container\ContainerInterface as PsrContainerInterface;

/**
 * Interface for a simple service container used by the Bellevue theme.
 */
interface ContainerInterface extends PsrContainerInterface {

  /**
   * @inheritDoc
   */
  public function get(string $id): ?object;

  /**
   * Sets an entry in the container.
   *
   * @param string $id
   *   The service id.
   * @param string $class
   *   The service object class name.
   */
  public function set(string $id, string $class): void;

}
