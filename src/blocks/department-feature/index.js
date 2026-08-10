import { InnerBlocks, useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { RichText } from '@wordpress/block-editor';
import { useState } from '@wordpress/element';
import { Card, CardBody, CardHeader, PanelBody, Spinner, Disabled } from '@wordpress/components';

import transforms from './transforms';
import Link from '../shared-elements/link';
import coreSiteApiFetch from '../shared-elements/coreSiteApiFetch';
import { ComboboxControl } from '@wordpress/components';
import Twig from '../../js/modules/twig-setup';
import { RawHTML } from '@wordpress/element';

import './style.scss';
import './editor.scss';


Twig.extendFunction("__", (input, namespace) => {
    return input;
});

/**
 * Mock the Sanitize Filter in Timber
 */
Twig.extendFilter("esc_html", (input) => {
	return input;
});

/**
 * Register: a Gutenberg Block.
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
registerBlockType( 'bc-sitka-spruce/department-feature', {
	edit: ( props ) => {
		const { attributes: {
			title,
			description,
			linkTitle,
			linkUrl,
			departmentId
		}, setAttributes, isSelected } = props;

		const blockProps = useBlockProps({
			className: 'section section-white organization-feature alignwide'
		});

		// Set up stateful variables to manage available departments for the combobox
		const [ departments, setDepartments ] = useState( {
			loaded: false,
			data: [
				{ value: null, label: 'Loading...', disabled: true },
			] } );

		// Set up stateful variables to manage department data for card preview
		const [ departmentData, setDepartmentData ] = useState( null );

		// Load department data for combobox
		if ( ! departments.loaded && isSelected ) {
			coreSiteApiFetch( 'wp-json/wp/v2/organization' ).then(
				( depts ) => {
					const label = {
						value: null,
						label: __( 'Select Department to Feature', 'bc-sitka-spruce' ),
						disabled: true
					};

					const deptArray = depts.map(
						( dpt ) => {
							const noImageNotice = ! dpt.acf.image ? __( ' (No Image)', 'bc-sitka-spruce' ) : '';
							return {
								value: dpt.id,
								label: dpt.title.rendered + noImageNotice,
								disabled: dpt.acf.image ? false : true, // Disable if no image
							};
						}
					);
					setDepartments(
						{
							loaded: true,
							data: [
								...[ label ],
								...deptArray
							]
						}
					)
				}
			)
		}

		// Load department data for preview
		if ( departmentId && ! departmentData ) {
			coreSiteApiFetch( 'wp-json/wp/v2/organization/' + departmentId, false ).then(
				( data ) => {
					setDepartmentData( data );
				}
			)
		}


		// Preview card
		const DepartmentCardPreview = ( { departmentData } ) => {
			const placeholderImage = `<svg class="rounded" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 500" width="760" height="400">
					<rect width="660" height="500" fill="#cccccc"></rect>
					<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="26px" fill="#000000">Placeholder Image</text>
				</svg>`;
			let title = `<span class="placeholder col-8"></span>`;
			let summary = `
					<span class="placeholder col-3"></span>
					<span class="placeholder col-4"></span>
					<span class="placeholder col-2"></span>
					<span class="placeholder col-9"></span>
					<span class="placeholder col-4"></span>
					<span class="placeholder col-4"></span>
					<span class="placeholder col-4"></span>
				`;


			if ( departmentData ) {
				title = departmentData.title.rendered;
				summary = departmentData.acf.summary;
			}

			let card_content = `
				<h3>${ title }</h3>
				<div class="organization-feature__summary">${ summary }</div>
			`;
			const twigCardHTML = Twig.twig({
				ref: '@stories/card-horizontal/card-horizontal.twig',
			}).render({
				media: placeholderImage,
				card_content,
				aspect_ratio: '.72'
			});
			return (
				<RawHTML>
					{ departmentId &&
						twigCardHTML
					}
				</RawHTML>
			);
		}


		// Render block
		return (
			<div { ...blockProps }>
				<InspectorControls>
					<PanelBody
						title={ __( 'Featured Department', 'bc-sitka-spruce' ) }
					>
						{ ! departments.loaded && (
							<Spinner />
						) }
						{ departments.loaded && (
							<ComboboxControl
								label="Select a Department (required)"
								value={
									departmentId
								}
								onChange={ ( departmentId ) => {
										props.setAttributes( {
											departmentId,
										} )
										setDepartmentData( null );
									}
								}
								options={ departments.data }

							/>
						) }
					</PanelBody>

				</InspectorControls>
				<div className="row">
					<div className="col-md-9">
						<RichText
							tagName="h2"
							value={ title }
							allowedFormats={ [] }
							onChange={ ( title ) => setAttributes( { title } ) }
							placeholder={ __( 'Enter section title (required)...', 'bc-sitka-spruce' ) }
						/>
						<RichText
							tagName="p"
							allowedFormats={ [] }
							value={ description }
							onChange={ ( description ) => setAttributes( { description } ) }
							placeholder={ __( 'Enter description (optional)...', 'bc-sitka-spruce' ) }
						/>
					</div>
					<div className="col-md-3">
						<Link
							title={ linkTitle }
							onChangeTitle={ ( linkTitle ) => setAttributes( { linkTitle } ) }
							url={ linkUrl }
							onChangeUrl={ ( linkUrl ) => setAttributes( { linkUrl } ) }
							target=""
							isSelected={ isSelected }
							className= "link-arrow"
						/>
					</div>
				</div>
				<div className='row'>
					<Disabled>
						{ (
							( ! departmentId ||
								departmentId === 0 )
						) && (
							<Card>
								<CardHeader><h3>{__('No Department Selected!', 'bc-sitka-spruce')}</h3></CardHeader>
								<CardBody>{__('Select this block and use the Settings sidebar to configure what should be displayed.', 'bc-sitka-spruce')}</CardBody>
							</Card>
						)}
						<DepartmentCardPreview departmentData={ departmentData } />
					</Disabled>
				</div>
			</div>
		);

	},
	save: ( props ) => {
		return null;
	},
	transforms
} );
