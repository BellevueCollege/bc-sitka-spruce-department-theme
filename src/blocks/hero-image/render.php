<?php

use Timber\Timber;

$site_type = get_field( 'site_type', 'option' );

if ( $site_type === 'div' ) {
	$hero_image_size = 'featured-home-div-lg';
} elseif ( $site_type === 'suppt' ) {
	$hero_image_size = 'featured-home-suppt';
} else {
	$hero_image_size = 'featured-home-dept-lg';
}

$hero_image_id = get_field( 'hero_image' );

if ( $hero_image_id ) : ?>
	<div class="hero">
		<?php
			echo wp_get_attachment_image(
				$hero_image_id,
				$hero_image_size,
				false,
				array(
					'class' => 'img-fluid',
				)
			);
		?>
	</div>
<?php elseif ( $is_preview ) : ?>
	<?php
	Timber::render( '/stories/atoms/block-empty-state/block-empty-state.twig', array(
		'block_name'   => __( 'Hero Image', 'bc-sitka-spruce' ),
		'instructions' => __( "Add an optional 'Hero Image' by selecting this block and using the Settings sidebar to choose or upload an image.", 'bc-sitka-spruce' ),
		'variant'      => 'optional',
	) );
	?>
<?php endif;
