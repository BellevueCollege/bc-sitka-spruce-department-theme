import { __ } from "@wordpress/i18n";
import { registerBlockType } from "@wordpress/blocks";
import { useBlockProps } from "@wordpress/block-editor";
import { InnerBlocks } from "@wordpress/block-editor";
import metadata from "./block.json";

import "./style.scss";
import "./editor.scss";

// Updated to use metadata.name instead of the hardcoded string
// Pass ...metadata to include all settings
registerBlockType(metadata.name, {
	edit: function (props) {
		const blockProps = useBlockProps({
			className: "section section-xlight course-information-section-wrapper alignfull",
		});

		const TEMPLATE = [
			[ "bc-sitka-spruce/course-information-section-content", {} ],
			[ "bc-sitka-spruce/callout", {} ]
		];

		return (
			<div {...blockProps}>
				<div className="course-information-section container-xl">
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
