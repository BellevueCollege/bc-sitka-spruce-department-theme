<?php
// Probably no Twig needed- this is a very simple block

$block_attrs = get_block_wrapper_attributes( array(
    'class' => 'hero',
) );

$image_html = wp_get_attachment_image(
    get_field( 'hero_image' ),
    'featured-home-div-lg',
    false,
    array(
        'class' => 'img-fluid',
    )
);

?>
<div <?php echo $block_attrs; ?>>
    <?php echo $image_html; ?>
</div>