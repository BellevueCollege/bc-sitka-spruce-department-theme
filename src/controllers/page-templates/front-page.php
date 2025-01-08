<?php
use Timber\Timber;

$context                   = Timber::context();
$context['post']           = Timber::get_post();
Timber::render( 'content/front-page.twig', $context );
