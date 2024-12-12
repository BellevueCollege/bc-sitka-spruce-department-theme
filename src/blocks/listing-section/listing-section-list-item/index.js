import { __ } from "@wordpress/i18n";
import { registerBlockType } from "@wordpress/blocks";
import { InnerBlocks, RichText, useBlockProps } from "@wordpress/block-editor";
import { __experimentalConfirmDialog as ConfirmDialog } from '@wordpress/components';
import {
	BlockControls,
	MediaUpload,
	MediaUploadCheck,
} from "@wordpress/block-editor";

import { useSelect } from "@wordpress/data";

import {
	ToolbarButton,
	ToolbarGroup,
	ToolbarDropdownMenu,
	MenuItem,
	Button,
} from "@wordpress/components";
import { Card, CardBody, CardHeader } from "@wordpress/components";


registerBlockType("bc-sitka-spruce/listing-section-list-item", {
	edit: function (props) {
		const {
			attributes: { title, placeholder, imageId, imageUrl, imageAlt },
			setAttributes,
			isSelected,
		} = props;

		const blockProps = useBlockProps({
			className: "list-item row",
		});

		const { media } = useSelect((select) => {
			return {
				media: select("core").getMedia(imageId),
			};
		});

		const TEMPLATE = [
			[ "core/paragraph", {
				placeholder: __("Listing item content...", "bc-sitka-spruce"),
			} ],
			[ "bc-sitka-spruce/listing-section-list-item-links", {
				lock: {
					remove: true,
					move: false,
				}
			} ],
		];

		return (
			<>
				<BlockControls group="block">
					<ToolbarGroup>
						<MediaUploadCheck>
							<MediaUpload
								allowedTypes={["image"]}
								value={imageId}
								onSelect={(value) => {
									setAttributes({
										imageId: value.id,
										imageUrl: value.sizes["listing-section"] ? value.sizes["listing-section"].url : value.url,
										imageAlt: value.alt,
									});
									onClose();
								}}
								render={({ open }) => (
									<ToolbarDropdownMenu
										icon="cover-image"
										label={__("Listing Section Image", "bc-sitka-spruce")}
									>
										{({ onClose }) => (
											<>
												<MenuItem
													onClick={() => {
														onClose();
														open();
													}}
													icon="format-image"
												>
													{imageId === 0
														? __("Choose Image", "bc-sitka-spruce")
														: __("Replace Image", "bc-sitka-spruce")}
												</MenuItem>
												<MenuItem
													icon="trash"
													onClick={() => {
														setAttributes({
															imageId: 0,
															imageUrl: "",
															imageAlt: "",
														});
														onClose();
													}}
													isDestructive={true}
													disabled={imageId === 0}
												>
													{__("Remove Image", "bc-sitka-spruce")}
												</MenuItem>
											</>
										)}
									</ToolbarDropdownMenu>
								)}
							/>
						</MediaUploadCheck>
					</ToolbarGroup>
				</BlockControls>
				<div {...blockProps}>
					<div className="col-md-8">
						<RichText
							tagName="h3"
							value={title}
							onChange={(title) => setAttributes({ title })}
							identifier="title"
							placeholder={ placeholder || __("List Item Title...", "bc-sitka-spruce") }
							allowedFormats={[]}
						/>
						<InnerBlocks
							template={TEMPLATE}
						/>
					</div>
					<div className="col-md-4">
						{imageId === 0 && (
							<MediaUploadCheck>
								<MediaUpload
									allowedTypes={["image"]}
									value={imageId}
									onSelect={(value) => setAttributes({
											imageId: value.id,
											imageUrl: value.sizes["listing-section"] ? value.sizes["listing-section"].url : value.url,
											imageAlt: value.alt,
										})
									}
									render={({ open }) => (
										<Card>
											<CardBody>
												<Button className="button button-large" onClick={open}>
													{__("Add an Image (Optional)", "bc-sitka-spruce")}
												</Button>
												<p className="mt-2">{__("Image should be 360px x 240px or larger", "bc-sitka-spruce")}</p>
											</CardBody>
										</Card>
									)}
								/>
							</MediaUploadCheck>
						)}
						{media !== undefined && (
							<img
								src={imageUrl}
								alt={imageAlt}
								className="img-fluid rounded"
							/>
						)}
					</div>
				</div>
			</>
		);
	},
	save: function () {
		return <InnerBlocks.Content />;
	},
});
