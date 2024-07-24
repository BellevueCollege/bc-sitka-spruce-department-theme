<?php
/**
 * TODO: This template should be replaced by a proper twig template
 */
?>
<div class="section-heading">
    <p>Eyebrow: <?php echo get_field( 'eyebrow' ); ?></p>
    <h2>Heading: <?php echo get_field( 'heading' ); ?></h2>
    <p>Subheading: <?php echo get_field( 'subheading' ); ?></p>
    <p>Link: <?php echo print_r( get_field( 'link' ) ); ?></p>
</div>