import { __ } from "@wordpress/i18n";
import { registerBlockType } from "@wordpress/blocks";
import { useBlockProps } from "@wordpress/block-editor";
import { InnerBlocks } from "@wordpress/block-editor";
import { useState } from "@wordpress/element";
import { Disabled } from "@wordpress/components";
import { RichText } from "@wordpress/block-editor";

import "./style.scss";
import "./editor.scss";

import { Card, CardBody, CardHeader } from "@wordpress/components";

registerBlockType("bc-sitka-spruce/accordion-section", {

	edit: function (props) {
		const blockProps = useBlockProps({
			className: "section section-xlight accordion-section-wrapper alignfull",
		});

		const TEMPLATE = [
			[ "bc-sitka-spruce/accordion-section-content", {} ],
			[ "bc-sitka-spruce/callout", {} ]
		];

		return (
			<div {...blockProps}>
				<div className="accordion-section container-xl">
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
