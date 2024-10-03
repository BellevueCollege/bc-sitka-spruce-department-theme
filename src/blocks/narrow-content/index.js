import { __ } from "@wordpress/i18n";
import { registerBlockType } from "@wordpress/blocks";
import { useBlockProps } from "@wordpress/block-editor";
import { InnerBlocks } from "@wordpress/block-editor";

import "./editor.scss";


registerBlockType("bc-sitka-spruce/narrow-content", {

	edit: function (props) {
		const blockProps = useBlockProps({
			className: "narrow-content row alignwide",
		});

		const TEMPLATE = [
			[ "core/paragraph", {} ]
		];

		return (
			<div {...blockProps}>
				<div className="col-lg-4 py-3">
					<div className="p-lg-5 p-1 sidebar-placeholder shadow rounded">
						<p>{ __( "Navigation sidebar will display here when published", "bc-sitka-spruce" ) }</p>
					</div>
				</div>
				<div className="col-lg py-3 narrow-content-area">
					<InnerBlocks
						template={ TEMPLATE }
					/>
				</div>
			</div>
		);
	},
	save: function () {
		const blockProps = useBlockProps.save({
			className: "narrow-content",
		})
		return (
			<div { ...blockProps }>
				<InnerBlocks.Content />
			</div>
		);
	},
});
