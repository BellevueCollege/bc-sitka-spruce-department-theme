import { __ } from "@wordpress/i18n";
import { registerBlockType } from "@wordpress/blocks";
import { useBlockProps } from "@wordpress/block-editor";
import { InnerBlocks } from "@wordpress/block-editor";
import { RawHTML } from "@wordpress/element";
import { useState } from "@wordpress/element";
import { Disabled } from "@wordpress/components";
import { RichText } from "@wordpress/block-editor";

import { useSelect } from "@wordpress/data";

import {
	BlockControls,
	MediaUpload,
	MediaUploadCheck,
} from "@wordpress/block-editor";

import {
	ToolbarButton,
	ToolbarGroup,
	ToolbarDropdownMenu,
	MenuItem,
	Button,
} from "@wordpress/components";

import "./style.scss";
import "./editor.scss";

import { Card, CardBody, CardHeader } from "@wordpress/components";

registerBlockType("bc-sitka-spruce/card-section-card", {
	edit: function (props) {
		const {
			attributes: { cardImageId, cardImageUrl, cardImageAlt, cardTitle },
			setAttributes,
			isSelected,
		} = props;

		const blockProps = useBlockProps({
			className: "card card-section-card",
		});

		const { media } = useSelect((select) => {
			return {
				media: select("core").getMedia(cardImageId),
			};
		});

		return (
			<>
				<BlockControls group="block">
					<ToolbarGroup>
						<MediaUploadCheck>
							<MediaUpload
								allowedTypes={["image"]}
								value={cardImageId}
								onSelect={(value) => {
									setAttributes({
										cardImageId: value.id,
										cardImageUrl: value.sizes["card-header"].url,
										cardImageAlt: value.alt,
									});
									onClose();
								}}
								render={({ open }) => (
									<ToolbarDropdownMenu
										icon="cover-image"
										label={__("Card Image", "mayflower-blocks")}
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
													{cardImageId === 0
														? __("Choose Image", "mayflower-blocks")
														: __("Replace Image", "mayflower-blocks")}
												</MenuItem>
												<MenuItem
													icon="trash"
													onClick={() => {
														setAttributes({
															cardImageId: 0,
															cardImageUrl: "",
															cardImageAlt: "",
														});
														onClose();
													}}
													isDestructive={true}
													disabled={cardImageId === 0}
												>
													{__("Remove Image", "mayflower-blocks")}
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
					<div className="card-img-top">
						{cardImageId === 0 && (
							<MediaUploadCheck>
								<MediaUpload
									allowedTypes={["image"]}
									value={cardImageId}
									onSelect={(value) =>
										setAttributes({
											cardImageId: value.id,
											cardImageUrl: value.sizes["card-header"].url,
											cardImageAlt: value.alt,
										})
									}
									render={({ open }) => (
										<Card>
											<CardBody>
												<Button className="button button-large" onClick={open}>
													{__("Add an Image", "mayflower-blocks")}
												</Button>
											</CardBody>
										</Card>
									)}
								/>
							</MediaUploadCheck>
						)}

						{media !== undefined && (
							<img
								src={cardImageUrl}
								alt={cardImageAlt}
								className="card-img-top"
							/>
						)}
					</div>

					<div className={"card-body"}>
						<RichText
							tagName="h3"
							className="card-title"
							allowedFormats={["core/link"]}
							placeholder="Heading Text or Link"
							value={cardTitle}
							onChange={(cardTitle) => setAttributes({ cardTitle })}
						/>
						<InnerBlocks />
					</div>
				</div>
			</>
		);
	},
	save: function () {
		return <InnerBlocks.Content />;
	},
});
