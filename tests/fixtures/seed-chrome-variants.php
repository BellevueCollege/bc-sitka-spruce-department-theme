<?php
/**
 * Seed ACF options for extended header/footer e2e states.
 *
 * @package BcSitkaSpruce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/e2e-query-helpers.php';

/**
 * @param string $variant default|notice|sock|emailFooter.
 */
function e2e_apply_chrome_variant( string $variant ): void {
	if ( ! function_exists( 'update_field' ) ) {
		return;
	}

	update_field( 'display_notice', 0, 'option' );
	update_field( 'sitewide_notice_text', '', 'option' );
	update_field( 'display_location_card', 0, 'option' );
	update_field( 'footer_contact_method', 'phone', 'option' );
	update_field( 'phone', '425-564-1000', 'option' );
	update_field( 'footer_email', '', 'option' );
	// Sock is opt-in. Clear it so a previous sock variant cannot leak into later specs.
	update_field(
		'standard_sock',
		array(
			'cta' => array(),
		),
		'option'
	);

	if ( $variant === 'notice' ) {
		update_field( 'display_notice', 1, 'option' );
		update_field( 'sitewide_notice_text', 'E2E sitewide notice message.', 'option' );
	}

	if ( $variant === 'sock' ) {
		update_field(
			'standard_sock',
			array(
				'cta' => array(
					array(
						'headline'        => 'E2E Sock CTA',
						'additional_text' => 'E2E sock supporting text.',
					),
				),
			),
			'option'
		);
		update_field( 'display_location_card', 1, 'option' );
		update_field( 'location', 'E2E Location<br>123 Test Street', 'option' );
	}

	if ( $variant === 'emailFooter' ) {
		update_field( 'footer_contact_method', 'email', 'option' );
		update_field( 'footer_email', 'e2e-footer@example.com', 'option' );
		update_field( 'phone', '', 'option' );
	}
}

/**
 * @param string $variant Chrome variant key.
 * @return array{variant: string, pageUrl: string}
 */
function e2e_chrome_variant_seed( string $variant ): array {
	e2e_apply_chrome_variant( $variant );
	$page = e2e_get_post_by_title( 'E2E Site Chrome', 'page' );

	return array(
		'variant' => $variant,
		'pageUrl' => $page ? get_permalink( $page ) : '',
	);
}
