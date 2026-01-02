import { __ } from "@wordpress/i18n";
import { registerBlockType } from "@wordpress/blocks";
import { useBlockProps } from "@wordpress/block-editor";
import { InnerBlocks } from "@wordpress/block-editor";


import "./style.scss";
import "./editor.scss";

registerBlockType("bc-sitka-spruce/bio-section", {

	edit: function (props) {
		const { attributes } = props;
		const blockProps = useBlockProps({
			className: "section section-white bio-section-wrapper alignfull",
			// make sure ID applies to wrapper in the editor
			id: attributes.anchor
		});

		const TEMPLATE = [
			[ "bc-sitka-spruce/bio-section-content", {} ],
			[ "bc-sitka-spruce/callout", {} ]
		];

		return (
			<div {...blockProps}>
				<div className="bio-section container-xl">
					<InnerBlocks
						template={ TEMPLATE }
						templateLock="all"
					/>
				</div>
			</div>
		);
	},
	save: function () {
		return <InnerBlocks.Content />;
	},
});
