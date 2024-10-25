import { __ } from "@wordpress/i18n";
import { registerBlockType } from "@wordpress/blocks";
import { useBlockProps } from "@wordpress/block-editor";
import { InnerBlocks, RichText } from "@wordpress/block-editor";

import "./style.scss";
import "./editor.scss";

import { Card, CardBody, CardHeader } from "@wordpress/components";

registerBlockType("bc-sitka-spruce/listing-section", {
	edit: function (props) {
		const {
			attributes: { title, description },
			setAttributes,
			isSelected,
		} = props;
		const blockProps = useBlockProps({
			className: "section listing-section alignfull",
		});

		return (
			<div {...blockProps}>
				<div className="container-xl">
					<RichText
						tagName="h2"
						className="section-heading__heading"
						placeholder={__("Title of Section (required)...", "bc-sitka-spruce")}
						value={title}
						onChange={(title) => setAttributes({ title })}
						identifier="title"
						allowedFormats={[]}
						disableLineBreaks={true}
					/>
					<RichText
						tagName="p"
						className="section-heading__subheading"
						placeholder={__("Description (optional)...", "bc-sitka-spruce")}
						value={description}
						onChange={(description) => setAttributes({ description })}
						identifier="description"
						allowedFormats={[]}
					/>

					<InnerBlocks
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
