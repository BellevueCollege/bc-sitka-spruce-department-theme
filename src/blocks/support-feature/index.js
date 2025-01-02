import {
	InnerBlocks,
	useBlockProps,
	InspectorControls,
} from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { RichText } from '@wordpress/block-editor';
import { useState } from '@wordpress/element';
import {
	Card,
	CardBody,
	CardHeader,
	CheckboxControl,
	PanelBody,
	Spinner,
	Disabled,
} from '@wordpress/components';

import transforms from './transforms';
import coreSiteApiFetch from '../shared-elements/coreSiteApiFetch';

import './style.scss';
import './editor.scss';

/**
 * Register: aa Gutenberg Block.
 *
 * Registers a new block provided a unique name and an object defining its
 * behavior. Once registered, the block is made editor as an option to any
 * editor interface where blocks are implemented.
 *
 * @link https://wordpress.org/gutenberg/handbook/block-api/
 * @param  {string}   name     Block name.
 * @param  {Object}   settings Block settings.
 * @return {?WPBlock}          The block, if it has been successfully
 *                             registered; otherwise `undefined`.
 */
registerBlockType('bc-sitka-spruce/support-feature', {
	edit: (props) => {
		const {
			attributes: { heading, supportPosts, sectionId },
			setAttributes,
			isSelected,
			clientId,
		} = props;

		if (!sectionId || sectionId === '') {
			setAttributes({ sectionId: `support-feature-${clientId}` });
		}

		const blockProps = useBlockProps({
			className: 'section section-rainy-night-blue alignfull',
			id: sectionId,
		});

		// Set up stateful variables to manage available support posts
		const [supportPostsList, setSupportPostsList] = useState({
			loaded: false,
			data: [],
		});

		// Load Available Support Posts
		if (!supportPostsList.loaded && isSelected) {
			coreSiteApiFetch('wp-json/wp/v2/identity-support').then((posts) => {
				const postsArray = posts.map((post) => {
					return {
						value: post.id,
						label: post.title.rendered,
					};
				});
				setSupportPostsList({
					loaded: true,
					data: postsArray,
				});
			});
		}

		// Render Small Story Type Selector
		const SupportPostSelector = ({ onChange, options, selected }) => {
			return options.map((obj) => (
				<CheckboxControl
					label={obj.label}
					checked={selected.includes(obj.value)}
					onChange={(newValue) =>
						onChange(
							newValue
								? [...selected, obj.value]
								: selected.filter(
										(value) => value !== obj.value
									)
						)
					}
				/>
			));
		};

		// Render block
		return (
			<>
				<InspectorControls>
					<PanelBody
						title={__(
							'Identity Based Support Elements',
							'bc-sitka-spruce'
						)}
					>
						<p>
							{__(
								'Select which identity-based support elements to display. These elements are managed centrally.',
								'bc-sitka-spruce'
							)}
						</p>
						{!supportPostsList.loaded && <Spinner />}
						{supportPostsList.loaded && (
							<fieldset>
								<legend>Select Options to Display: </legend>
								<br />
								<SupportPostSelector
									selected={supportPosts}
									options={supportPostsList.data}
									onChange={(supportPosts) => {
										props.setAttributes({
											supportPosts,
										});
									}}
								/>
							</fieldset>
						)}
					</PanelBody>
				</InspectorControls>
				<div className="arch-shape alignfull"></div>
				<div {...blockProps}>
					<div className="tab-wrapper-dark tabcordion tabcordion-list curved-top">
						<div className="container-xl">
							<div className="row">
								<div className="col-md-12">
									<RichText
										tagName="h2"
										value={heading}
										allowedFormats={[]}
										onChange={(heading) =>
											setAttributes({ heading })
										}
										placeholder={__(
											'Enter section title (required)...',
											'bc-sitka-spruce'
										)}
									/>
								</div>
							</div>
							{!supportPosts || supportPosts.length === 0 ? (
								<Card>
									<CardHeader>
										<h3>
											{__(
												'No Story or Story Types Selected!',
												'bc-sitka-spruce'
											)}
										</h3>
									</CardHeader>
									<CardBody>
										{__(
											'Select this block and use the Settings sidebar to configure what should be displayed.',
											'bc-sitka-spruce'
										)}
									</CardBody>
								</Card>
							) : (
								<div className="tab-editor-row">
									<div className="tab-header left-pane">
										<ul className="nav flex-column d-flex card-header-tabs">
											{supportPosts.map((post) => {
												return (
													<li className="nav-item">
														<span className="nav-link placeholder col-5"></span>
													</li>
												);
											})}
										</ul>
									</div>

									<div className="tab-editor-body">
										<div className="tab-image-placeholder rounded"></div>
										<div>
											<span className="h2 placeholder col-8"></span>
										</div>
										<div>
											<span className="placeholder col-4"></span>
											<span className="placeholder col-3"></span>
											<span className="placeholder col-2"></span>
											<span className="placeholder col-4"></span>
											<span className="placeholder col-7"></span>
											<span className="placeholder col-5"></span>
											<span className="placeholder col-3"></span>
											<span className="placeholder col-4"></span>
											<span className="placeholder col-5"></span>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</>
		);
	},
	save: (props) => {
		return null;
	},
	transforms,
});
