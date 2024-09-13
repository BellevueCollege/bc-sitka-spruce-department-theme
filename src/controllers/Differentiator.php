<?php
namespace BcSitkaSpruce\Controllers;

class Differentiator extends PostData {

	public static function get_single( $id ) {
		if ( ! $id ) {
			return;
		}

		$post = get_post( $id );

		if ( ! $post ) {
			return;
		}

		$differentiator_top = get_field( 'top', $id );

		return array(
			'top_layout'      => esc_attr( $differentiator_top[0]['acf_fc_layout'] ?? null ),
			'top_text'        => esc_html( $differentiator_top[0]['text'] ?? null ),
			'top_superscript' => esc_html( $differentiator_top[0]['superscript'] ?? null ),
			'top_icon'        => wp_kses_post( $differentiator_top[0]['icon'] ?? null ),
			'top_image'       => isset( $differentiator_top[0]['image']['ID'] ) ? wp_get_attachment_image( $differentiator_top[0]['image']['ID'], array( '580', '322' ) ) : null,
			'title'           => esc_html( get_field( 'title', $id ) ),
			'text'            => wp_kses_post( get_field( 'text', $id ) ),
			'link'            => get_field( 'link', $id ),
		);
	}
}
