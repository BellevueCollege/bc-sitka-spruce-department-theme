<?php
$site_type = get_field( 'site_type', 'option' );


if ( $site_type === 'div' ) {
	$hero_image_size = 'featured-home-div-lg';
} elseif ( $site_type === 'suppt' ) {
	$hero_image_size = 'featured-home-suppt';
} else {
	$hero_image_size = 'featured-home-dept-lg';
}

if ( get_field( 'hero_image' ) ) : ?>
	<div class="hero">
		<?php
			echo wp_get_attachment_image(
				get_field( 'hero_image' ),
				$hero_image_size,
				false,
				array(
					'class' => 'img-fluid',
				)
			)
		?>
	</div>
<?php else: ?>
	<?php
		if ( $is_preview ) {
			echo '<div class="card mw-100"><p class="my-0">';
			_e( 'Add an optional \'Hero Image\' by selecting this block and using the Settings sidebar to choose or upload an image.', 'bc-sitka-spruce' );
			echo '</p></div>';
		} else {
			echo '';
		}
	?>
<?php endif;
