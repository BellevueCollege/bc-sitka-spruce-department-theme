import { __ } from "@wordpress/i18n";
import { registerBlockType } from "@wordpress/blocks";
import { useBlockProps } from "@wordpress/block-editor";
import { InnerBlocks } from "@wordpress/block-editor";
import { useState } from "@wordpress/element";
import { Disabled } from "@wordpress/components";
import { RichText } from "@wordpress/block-editor";


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
					allowedBlocks={ [ "core/heading", "core/paragraph", "core/shortcode", ] } // this should be replaced with a global list of allowed blocks. See slide 4 of annotations
				/>
			</div>
		);
	},
	save: function () {
		return <InnerBlocks.Content />;
	},
});
