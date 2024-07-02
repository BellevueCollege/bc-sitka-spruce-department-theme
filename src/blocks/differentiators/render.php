<?php
$context = Timber::context();

$context['assetPath'] = get_template_directory_uri() . '/assets';
$context['wrapperAtts'] = get_block_wrapper_attributes();

/**
 * Get Differentiator Data from Post and ACF
 * 
 * @param int $id Post ID
 * @return array
 */
function get_diff_data( $id ) {
    if ( ! $id ) {
        return;
    }

    $post = get_post( $id );

    if ( ! $post ) {
        return;
    }

    $differentiator_top = get_field( 'top', $id );
    

    $output =  [
        'top_layout' => $differentiator_top[0]['acf_fc_layout'] ?? null,
        'top_text' => $differentiator_top[0]['text'] ?? null,
        'top_superscript' => $differentiator_top[0]['superscript'] ?? null,
        'top_icon' => $differentiator_top[0]['icon'] ?? null,
        'top_image' => isset($differentiator_top[0]['image']['ID']) ? wp_get_attachment_image( $differentiator_top[0]['image']['ID'], ['580', '322'] ) : null,
        'title' => get_field( 'title', $id ),
        'text' => get_field( 'text', $id ),
        'link' => get_field( 'link', $id ),
    ];

    return $output;
}


// Get Root Site ID
$main_site = get_main_site_id();
$differentiators = array();

// Get Differentiators from Core Site
switch_to_blog( $main_site );
    $differentiators[] = get_diff_data( $attributes['differentiator1'] );
    $differentiators[] = get_diff_data( $attributes['differentiator2'] );
    $differentiators[] = get_diff_data( $attributes['differentiator3'] );
restore_current_blog();

// Add Differentiators to Context
$context['differentiators'] = $differentiators;

// Render Twig Template
Timber::render( get_template_directory() . '/stories/differentiators/differentiators.twig', $context );