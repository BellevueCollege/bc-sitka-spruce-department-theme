<?php

namespace BcSitkaSpruce\Library\Container;

/**
 * A simple service container used by the Bellevue theme.
 */
class Container implements ContainerInterface {

  protected array $services = [];

  /**
   * @inheritDoc
   */
  public function get(string $id): ?object {
    if (!$this->has($id)) {
      return null;
    }

    return $this->services[$id];
  }

  /**
   * @inheritDoc
   */
  public function set(string $id, string $class): void {
    if ($this->has($id)) {
      throw new ServiceAlreadyExistsException(sprintf('The service %s already exists.', $id));
    }

    if (!class_exists($class)) {
      throw new ClassDoesNotExistException(sprintf('The class %s does not exist.', $class));
    }

    $this->services[$id] = new $class;
  }

  /**
   * @inheritDoc
   */
  public function has(string $id): bool {
    return isset($this->services[$id]);
  }

}
