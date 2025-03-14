import { __ } from "@wordpress/i18n";
import { registerBlockType } from "@wordpress/blocks";
import { useBlockProps } from "@wordpress/block-editor";
import { InnerBlocks } from "@wordpress/block-editor";
import { useState } from "@wordpress/element";
import { Disabled } from "@wordpress/components";
import { RichText } from "@wordpress/block-editor";


import { Card, CardBody, CardHeader } from "@wordpress/components";

registerBlockType("bc-sitka-spruce/accordion-section-content", {

	edit: function (props) {
		const blockProps = useBlockProps({
			className: "col-md-8",
		});

		const TEMPLATE = [
			[ "mayflower-blocks/collapsibles", {
				lock: {
					move: false,
					remove: false
				}
			} ]
		];

		return (
			<div {...blockProps}>
				<RichText
					placeholder={__("Section Title (Required)", "bc-sitka-spruce")}
					tagName="h2"
					onChange={(title) => props.setAttributes({ title })}
					value={props.attributes.title}
					identifier="title"
					allowedFormats={[]}
				/>
				<RichText
					placeholder={__("Section Description/Subtitle", "bc-sitka-spruce")}
					tagName="p"
					onChange={(description) => props.setAttributes({ description })}
					value={props.attributes.description}
					identifier="description"
					allowedFormats={[]}
				/>
				<InnerBlocks
					template={ TEMPLATE }
					templateLock={ false }
				/>
			</div>
		);
	},
	save: function () {
		return <InnerBlocks.Content />;
	},
});
