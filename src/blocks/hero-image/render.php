<?php
// Probably no Twig needed- this is a very simple block

$block_attrs = get_block_wrapper_attributes( array(
    'class' => 'hero',
) );

$site_type = get_field( 'site_type', 'option' );


if ( $site_type === 'div' ) {
    $hero_image_size = 'featured-home-div-lg';
} elseif ( $site_type === 'suppt' ) {
    $hero_image_size = 'featured-home-suppt';
} else {
    $hero_image_size = 'featured-home-dept-lg';
}

$image_html = wp_get_attachment_image(
    get_field( 'hero_image' ),
    $hero_image_size,
    false,
    array(
        'class' => 'img-fluid',
    )
);

?>
<div <?php echo $block_attrs; ?>>
    <?php echo $image_html; ?>
</div>