<?php
use Timber\Timber;
$context = Timber::context();

$context['tab_links'] = $content;
$context['format']    = $block->context['bc-sitka-spruce/tabcordion/format'];

Timber::render( '/stories/tabcordion/components/tab-list.twig', $context );
