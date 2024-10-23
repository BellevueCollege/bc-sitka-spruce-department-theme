<?php
use Timber\Timber;
use BcSitkaSpruce\Library\Theme;

$context = Timber::context();
$context['post'] = Timber::get_post();
$context['breadcrumbs'] = Theme::breadcrumbs()->getItems( 2 );

Timber::render( 'content/single-program.twig', $context );
