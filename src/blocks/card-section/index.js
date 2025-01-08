import { __ } from "@wordpress/i18n";
import { registerBlockType } from "@wordpress/blocks";
import { useBlockProps } from "@wordpress/block-editor";
import { InnerBlocks } from "@wordpress/block-editor";
import { RawHTML } from "@wordpress/element";
import { useState } from "@wordpress/element";
import { Disabled } from "@wordpress/components";
import { RichText } from "@wordpress/block-editor";

import "./style.scss";
import "./editor.scss";

import { Card, CardBody, CardHeader } from "@wordpress/components";

registerBlockType("bc-sitka-spruce/card-section", {
	edit: function (props) {
		const blockProps = useBlockProps({
			className: "section card-section alignwide",
		});

		const TEMPLATE = [
			[ "bc-sitka-spruce/card-section-card", {} ],
			[ "bc-sitka-spruce/card-section-card", {} ],
			[ "bc-sitka-spruce/card-section-card", {} ],
		];

		return (
			<div {...blockProps}>
				<div className="section-heading container-xl">
					<RichText
						tagName="h2"
						className="section-heading__heading"
						placeholder={__("Title of Section (required)", "bc-sitka-spruce")}
						value={props.attributes.title}
						onChange={(title) => props.setAttributes({ title })}
						identifier="title"
						allowedFormats={[]}
						disableLineBreaks={true}
					/>

					<RichText
						tagName="p"
						className="section-heading__subheading"
						placeholder={__("Description (optional)", "bc-sitka-spruce")}
						value={props.attributes.description}
						onChange={(description) => props.setAttributes({ description })}
						identifier="description"
						allowedFormats={[]}
					/>
				</div>
				<div className="container-xl">
					<InnerBlocks
						template={TEMPLATE}
						renderAppender={ InnerBlocks.ButtonBlockAppender }
					/>
				</div>
			</div>
		);
	},
	save: function () {
		return <InnerBlocks.Content />;
	},
});
