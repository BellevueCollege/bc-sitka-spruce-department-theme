<?php

use Timber\Timber;
$context = Timber::context();

$context['content']                  = $content;
$context['title']                    = esc_html( $attributes['tabTitle'] ?? '' );
$context['active']                   = $attributes['tabDefault'] ? 'active show' : '';
$context['parent_id']                = $block->context['bc-sitka-spruce/tabcordion/blockId'];
$context['heading_level']            = esc_attr( $block->context['bc-sitka-spruce/tabcordion/headingLevel'] );
$context['display_heading_visually'] = $block->context['bc-sitka-spruce/tabcordion/displayHeadingsVisually'];


Timber::render( '/stories/tabcordion/components/content-panel.twig', $context );
