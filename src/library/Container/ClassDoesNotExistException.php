<?php

namespace BcSitkaSpruce\Library\Container;

use InvalidArgumentException;
use Psr\Container\ContainerExceptionInterface;

/**
 * This exception is thrown when an already existing service is re-set.
 */
class ClassDoesNotExistException extends InvalidArgumentException implements ContainerExceptionInterface {

}
