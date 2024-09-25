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

registerBlockType("bc-sitka-spruce/listing-section", {
	edit: function (props) {
		const blockProps = useBlockProps({
			className: "section listing-section alignwide",
		});
	},
	save: function () {
		return <InnerBlocks.Content />;
	},
});
