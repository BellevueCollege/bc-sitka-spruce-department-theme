import { InnerBlocks, useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { RichText } from '@wordpress/block-editor';
import { useState } from '@wordpress/element';
import { Card, CardBody, CardHeader, CheckboxControl, PanelBody, Spinner } from '@wordpress/components';
import  ServerSideRender  from '@wordpress/server-side-render';

import transforms from './transforms';
import Link from '../shared-elements/link';
import coreSiteApiFetch from '../shared-elements/coreSiteApiFetch';
import { ComboboxControl } from '@wordpress/components';

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
registerBlockType( 'bc-sitka-spruce/news-feature-core', {
	edit: ( props ) => {
		const { attributes: {
			title,
			description,
			linkTitle,
			linkUrl,
			largeStoryId,
			smallStoryTypes,
		}, setAttributes, isSelected } = props;

		const blockProps = useBlockProps({
			className: 'news-feature-component alignwide container-xl'
		});

		// Set up stateful variables to manage news feature selection
		const [ largeStories, setLargeStories ] = useState( {
			loaded: false,
			data: [
				{ value: null, label: 'Loading...', disabled: true },
			] } );


		// Set up stateful variables to manage available categories of stories to show
		const [ smallStoryTypesList, setSmallStoryTypesList ] = useState( {
			loaded: false,
			data: [
			] } );


		if ( ! largeStories.loaded ) {
			coreSiteApiFetch( 'wp-json/wp/v2/news' ).then(
				( stories ) => {
					const label = {
						value: null,
						label: __( 'Select Story', 'bc-sitka-spruce' ),
						disabled: true
					};
					const storyArray = stories.map(
						( story ) => {
							return {
								value: story.id,
								label: story.title.rendered,
							};
						}
					);
					setLargeStories(
						{
							loaded: true,
							data: [
								...[ label ],
								...storyArray
							]
						}
					)
				}
			)
		}

		if ( ! smallStoryTypesList.loaded ) {
			coreSiteApiFetch( 'wp-json/wp/v2/news_type' ).then(
				( types ) => {
					const typesArray = types.map(
						( type ) => {
							return {
								value: type.id,
								label: type.name,
							};
						}
					);
					setSmallStoryTypesList(
						{
							loaded: true,
							data: typesArray
						}
					)
				}
			)
		}

		const SmallStoryTypeSelector = ( { onChange, options, selected } ) => {
			return options.map(
				( obj ) => <CheckboxControl
					label={ obj.label }
					checked={ selected.includes( obj.value ) }
					onChange={ ( newValue ) => onChange( newValue ? [ ...selected, obj.value ] : selected.filter( ( value ) => value !== obj.value ) ) }

				/>
			)
		}
		return (
			<div { ...blockProps }>
				<InspectorControls>
					<PanelBody
						title={ __( 'Featured Story', 'bc-sitka-spruce' ) }
					>
						<p>{ __( 'Display a large, featured news story from the BC News website', 'bc-sitka-spruce' ) }</p>
						{ ! largeStories.loaded && (
							<Spinner />
						) }
						{ largeStories.loaded && (
							<ComboboxControl
								label="Select a News Story (optional)"
								value={
									largeStoryId
								}
								onChange={ ( largeStoryId ) => {
										props.setAttributes( {
											largeStoryId,
										} )
									}
								}
								options={ largeStories.data }

							/>
						) }
					</PanelBody>
					<PanelBody
						title={ __( 'Story Types', 'bc-sitka-spruce' ) }
					>
						<p>{ __( 'Select the types of news stories to display. The three most recent stories in the selected type(s) will be displayed.', 'bc-sitka-spruce' ) }</p>
						{ ! smallStoryTypesList.loaded && (
							<Spinner />
						) }
						{ smallStoryTypesList.loaded && (
							<fieldset>
								<legend>Select Story Types: </legend><br />
								<SmallStoryTypeSelector
									selected={ smallStoryTypes }
									options={ smallStoryTypesList.data }
									onChange={ ( smallStoryTypes ) => {
										props.setAttributes( {
											smallStoryTypes,
										} )
									} }
								/>

							</fieldset>
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
					<ServerSideRender
						block="bc-sitka-spruce/news-feature-core"
						attributes={ props.attributes }
					/>
				</div>
			</div>
		);

	},
	save: ( props ) => {
		return null;
	},
	transforms
} );
