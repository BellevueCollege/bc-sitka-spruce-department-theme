import { __ } from "@wordpress/i18n";
import { registerBlockType } from "@wordpress/blocks";
import { useBlockProps } from "@wordpress/block-editor";
import { InnerBlocks } from "@wordpress/block-editor";

import blockSets from "../../shared-elements/block-sets/wysiwyg.json";


import { Card, CardBody, CardHeader } from "@wordpress/components";

registerBlockType("bc-sitka-spruce/body-section-content", {

	edit: function (props) {
		const blockProps = useBlockProps({
			className: "col-md-8",
		});

		const TEMPLATE = [
			[ "core/heading" ],
			[ "core/paragraph" ],
		];

		return (
			<div {...blockProps}>
				<InnerBlocks
					template={ TEMPLATE }
					templateLock={ false }
					allowedBlocks={ blockSets.wysiwygBlocks }
				/>
			</div>
		);
	},
	save: function () {
		return <InnerBlocks.Content />;
	},
});
