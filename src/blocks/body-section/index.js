import { __ } from "@wordpress/i18n";
import { registerBlockType } from "@wordpress/blocks";
import { useBlockProps } from "@wordpress/block-editor";
import { InnerBlocks } from "@wordpress/block-editor";

import "./style.scss";
import "./editor.scss";


registerBlockType("bc-sitka-spruce/body-section", {

	edit: function (props) {
		const blockProps = useBlockProps({
			className: "section section-white body-section-wrapper alignfull",
		});

		const TEMPLATE = [
			[ "bc-sitka-spruce/body-section-content", {} ],
			[ "bc-sitka-spruce/callout", {} ]
		];

		return (
			<div {...blockProps}>
				<div className="body-section container-xl">
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
