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
			attributes: { title, description, anchor },
			setAttributes,
			isSelected,
		} = props;
		const blockProps = useBlockProps({
			id: anchor,
			className: "section section-xlight listing-section-wrapper alignfull",
		});

		return (
			<div {...blockProps}>
				<div className="section-heading container-xl">
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
				</div>
				<div className="listing-section container-xl">
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
