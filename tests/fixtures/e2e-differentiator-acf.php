<?php
/**
 * Register Differentiator CPT ACF fields for e2e.
 *
 * Production loads this group from the Bellevue 2022 theme acf-json. Sitka e2e
 * uses bellevue-2022-components for the CPT only, so the field group must be
 * registered here for seed writes and frontend get_field() reads.
 *
 * @package BcSitkaSpruce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register the Differentiator field group used by core-site stats blocks.
 */
function e2e_register_differentiator_acf_field_group(): void {
	if ( ! function_exists( 'acf_add_local_field_group' ) ) {
		return;
	}

	acf_add_local_field_group(
		array(
			'key'                   => 'group_63061186f15a1',
			'title'                 => 'Differentiator',
			'fields'                => array(
				array(
					'key'        => 'field_6306119e830cb',
					'label'      => 'Top Area',
					'name'       => 'top',
					'type'       => 'flexible_content',
					'required'   => 1,
					'layouts'    => array(
						'layout_630611e8830cd' => array(
							'key'        => 'layout_630611e8830cd',
							'name'       => 'text',
							'label'      => 'Text',
							'display'    => 'row',
							'sub_fields' => array(
								array(
									'key'   => 'field_63061212830d0',
									'label' => 'Text',
									'name'  => 'text',
									'type'  => 'text',
								),
								array(
									'key'   => 'field_63061235830d1',
									'label' => 'Superscript',
									'name'  => 'superscript',
									'type'  => 'text',
								),
							),
						),
					),
					'button_label' => 'Add Top Area',
					'min'          => 1,
					'max'          => 1,
				),
				array(
					'key'      => 'field_63061256830d2',
					'label'    => 'Title',
					'name'     => 'title',
					'type'     => 'text',
					'required' => 1,
				),
				array(
					'key'       => 'field_63061261830d3',
					'label'     => 'Text',
					'name'      => 'text',
					'type'      => 'textarea',
					'new_lines' => 'wpautop',
				),
				array(
					'key'           => 'field_63061270830d4',
					'label'         => 'Link',
					'name'          => 'link',
					'type'          => 'link',
					'return_format' => 'array',
				),
			),
			'location'              => array(
				array(
					array(
						'param'    => 'post_type',
						'operator' => '==',
						'value'    => 'differentiator',
					),
				),
			),
			'active'                => true,
		)
	);
}

if ( ! has_action( 'acf/init', 'e2e_register_differentiator_acf_field_group' ) ) {
	add_action( 'acf/init', 'e2e_register_differentiator_acf_field_group' );
}
