import { __ } from "@wordpress/i18n";
import { registerBlockType } from "@wordpress/blocks";
import { useBlockProps } from "@wordpress/block-editor";
import { InnerBlocks } from "@wordpress/block-editor";
import { useState } from "@wordpress/element";
import { Disabled } from "@wordpress/components";
import { RichText } from "@wordpress/block-editor";


import { Card, CardBody, CardHeader } from "@wordpress/components";

registerBlockType("bc-sitka-spruce/course-information-section-content", {

	edit: function (props) {
		const blockProps = useBlockProps({
			className: "col-md-8",
		});

		const TEMPLATE = [
			[ "core/paragraph", {
				placeholder: "Welcome to our program..."
			} ],
			[ "core/paragraph", {
				placeholder: "Example courses:"
			} ],
			[ "core/list", {} ],
			[ "mayflower-blocks/button", {} ],
			[ "bawb/program", {
				_headingTagOverride: "p",
				_linkTextOverride: __("Review Catalog for all Requirements", "bc-sitka-spruce"),
				lock: {
					move: false,
					remove: true
				}
			} ]
		];

		return (
			<div {...blockProps}>
				<RichText
					placeholder={__("Section Title", "bc-sitka-spruce")}
					tagName="h2"
					onChange={(title) => props.setAttributes({ title })}
					value={props.attributes.title}
					identifier="title"
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
