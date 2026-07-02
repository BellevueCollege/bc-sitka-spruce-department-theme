<?php
$context = Timber::context();

$context['is_preview'] = $is_preview;
$context['accordion_id'] = !empty($block['anchor']) ? $block['anchor'] : 'actionItemsYearAccordion';

// Collect field options set up in the ACF custom fields screen
// acf fields match storybook keys: 'keep_one_open_only' and a repeater named 'items'
$context['keep_one_open_only'] = get_field('keep_one_open_only');
$raw_items                     = get_field('items');
$compiled_items                = array();

// Process and sanitize repeater fields if they exist
if ( ! empty( $raw_items ) && is_array( $raw_items ) ) {
    foreach ( $raw_items as $index => $item ) {
        $compiled_items[] = array(
            'id'      => ! empty( $item['id'] ) ? sanitize_title( $item['id'] ) : 'panel-' . $index,
            'title'   => ! empty( $item['title'] ) ? esc_html( $item['title'] ) : '',
            'is_open' => ! empty( $item['is_open'] ) ? (bool) $item['is_open'] : false,
            'content' => ! empty( $item['content'] ) ? wp_kses_post( $item['content'] ) : '',
        );
    }
}
$context['items'] = $compiled_items;

Timber::render( '/stories/bootstrap-accordion/bootstrap-accordion.twig', $context );

// Preview Notice if block is empty
if ( $is_preview && empty( $context['items'] ) ) {
    echo '<div class="accordion-wrapper-preview col"><p>';
    _e( 'The \'Bootstrap Accordion Component\' is not configured. <br />Edit this element to configure it!', 'bc-sitka-spruce' );
    echo '</p></div>';
}