import { __ } from "@wordpress/i18n";
import { registerBlockType } from "@wordpress/blocks";
import { useBlockProps } from "@wordpress/block-editor";
import { InnerBlocks } from "@wordpress/block-editor";

registerBlockType("bc-sitka-spruce/bio-section-content", {

	edit: function (props) {
		const blockProps = useBlockProps({
			className: "col-md-8",
		});

		const BLOCK_TEMPLATE = [
			[ 'core/heading', {
				'level': 2,
				'content': __( 'About Me', 'bc-sitka-spruce' )
			} ],
			[ 'core/paragraph', {
				'placeholder': __( 'Enter About Me Blurb', 'bc-sitka-spruce' )
			} ],

			[ 'core/heading', {
				'level': 3,
				'content': __( 'Education', 'bc-sitka-spruce' )
			} ],
			[ 'core/list', {
			}, [['core/list-item', {
				'placeholder': __( 'Enter Education History', 'bc-sitka-spruce' )
			}]]  ],


			[ 'core/heading', {
				'level': 3,
				'content': __( 'Current Course(s)', 'bc-sitka-spruce' )
			} ],
			[ 'core/list', {
			}, [['core/list-item', {
				'placeholder': __( 'Link to Course Catalog sections of courses being taught; these will need to be updated each semester', 'bc-sitka-spruce' )
			}]]  ]
		];

		return (
			<div {...blockProps}>
				<InnerBlocks
					template={ BLOCK_TEMPLATE }
					templateLock={ false }
				/>
			</div>
		);
	},
	save: function () {
		return <InnerBlocks.Content />;
	},
});
