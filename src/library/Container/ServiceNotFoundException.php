<?php

namespace BcSitkaSpruce\Library\Container;

use InvalidArgumentException;
use Psr\Container\NotFoundExceptionInterface;

/**
 * This exception is thrown when a non-existent service is requested.
 */
class ServiceNotFoundException extends InvalidArgumentException implements NotFoundExceptionInterface {

}
