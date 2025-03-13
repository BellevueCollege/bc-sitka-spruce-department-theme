<?php

use Timber\Timber;
use BcSitkaSpruce\Library\Theme;

global $post;

$context = Timber::context();
Timber::render( 'content/index.twig', $context );
