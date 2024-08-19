import { InnerBlocks, useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { RichText } from '@wordpress/block-editor';
import { useState } from '@wordpress/element';
import { Card, CardBody, CardHeader, CheckboxControl, PanelBody, Spinner, Disabled } from '@wordpress/components';

import transforms from './transforms';
import Link from '../shared-elements/link';
import coreSiteApiFetch from '../shared-elements/coreSiteApiFetch';
import { ComboboxControl } from '@wordpress/components';

import Twig from "twig";
import twigNewsFeatureFeatured from '/stories/news-feature/news-feature-featured.twig';
import twigNewsFeatureSmall from '/stories/news-feature/news-feature-list-item.twig';
import { RawHTML } from '@wordpress/element';


import './style.scss';
import './editor.scss';


Twig.extendFunction("__", (input, namespace) => {
    return input;
});
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

		const [ largeStoryData, setLargeStoryData ] = useState( null );
		const [ smallStoryData, setSmallStoryData ] = useState( [] );

		// Load Available Featured Stories
		if ( ! largeStories.loaded && isSelected ) {
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

		// Load Available Story Types for Small Story List
		if ( ! smallStoryTypesList.loaded && isSelected ) {
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

		// Load Selected Large Story Data for Display in Editor
		if ( largeStoryId && ! largeStoryData ) {
			coreSiteApiFetch( `wp-json/wp/v2/news/${ largeStoryId }` ).then(
				( story ) => {
					setLargeStoryData( story );
				}
			)
		}

		// Load Selected Small Story Data for Display in Editor
		if ( smallStoryTypes.length && smallStoryData.length === 0 ) {

			// Set up URL params
			let urlParams = new URLSearchParams({
				per_page: 3,
				order: 'desc',
				order_by: 'date',
				tax_relation: 'OR',
				news_type: smallStoryTypes.join( ',' ),
			});


			// Exclude large story
			if ( largeStoryId ) {
				urlParams.append( 'exclude', largeStoryId );
			}

			coreSiteApiFetch( `wp-json/wp/v2/news/?${ urlParams.toString() }`, false ).then(
				( story ) => {
					setSmallStoryData( story );
				}
			)
		}

		// Render Small Story Type Selector
		const SmallStoryTypeSelector = ( { onChange, options, selected } ) => {
			return options.map(
				( obj ) => <CheckboxControl
					label={ obj.label }
					checked={ selected.includes( obj.value ) }
					onChange={ ( newValue ) => onChange( newValue ? [ ...selected, obj.value ] : selected.filter( ( value ) => value !== obj.value ) ) }

				/>
			)
		}

		// Render Large Story Preview
		const LargeStoryPreview = ( { largeStoryData } ) => {
			const placeholderImage = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 400" width="760" height="400">
					<rect width="760" height="400" fill="#cccccc"></rect>
					<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="26px" fill="#000000">Placeholder Image</text>
				</svg>`;
			let title = `<span class="placeholder-glow placeholder col-8"></span>`;
			let summary = `
					<span class="placeholder-glow placeholder col-3"></span>
					<span class="placeholder-glow placeholder col-4"></span>
					<span class="placeholder-glow placeholder col-2"></span>
					<span class="placeholder-glow placeholder col-9"></span>
					<span class="placeholder-glow placeholder col-4"></span>
					<span class="placeholder-glow placeholder col-4"></span>
					<span class="placeholder-glow placeholder col-4"></span>
				`;

			if ( largeStoryData ) {
				title = largeStoryData.title.rendered;
				summary = largeStoryData.acf.summary;
			}
			return (
				<RawHTML>
					{ largeStoryId &&
						twigNewsFeatureFeatured({
							title,
							summary,
							image: placeholderImage,
							url: '#',
						})
					}
				</RawHTML>
			);
		}

		// Render Small Story Preview
		const SmallStoryPreview = ( { smallStoryData } ) => {

			// No types selected
			if ( smallStoryTypes.length === 0 ) {
				return '';
			}
			const output = [];

			// Placeholder content
			let title = `<span class="placeholder-glow placeholder col-8"></span>`;
			let summary = `
					<span class="placeholder-glow placeholder col-3"></span>
					<span class="placeholder-glow placeholder col-4"></span>
					<span class="placeholder-glow placeholder col-2"></span>
					<span class="placeholder-glow placeholder col-9"></span>
					<span class="placeholder-glow placeholder col-4"></span>
					`;


			if ( smallStoryData.length === 0 ) {
				output.push(
					twigNewsFeatureSmall({
						title: title,
						url: '#',
						summary: summary,
					})
				);
				output.push(
					twigNewsFeatureSmall({
						title: title,
						url: '#',
						summary: summary,
					})
				);
				output.push(
					twigNewsFeatureSmall({
						title: title,
						url: '#',
						summary: summary,
					})
				);
			} else {
				smallStoryData.forEach( ( story ) => {
					output.push(
						twigNewsFeatureSmall({
							title: story.title.rendered,
							url: story.link,
							summary: story.acf.summary,
						})
					)
				});
			}

			return (
				<RawHTML
					className="row"
					children={ output }
				/>
			);

		}

		// Render block
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
										setLargeStoryData( null );
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
										setSmallStoryData( [] );
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
					<Disabled>
						{ largeStoryId &&
							<LargeStoryPreview
								largeStoryData={largeStoryData}
							/>
						}
						<SmallStoryPreview
							smallStoryData={smallStoryData}
						/>
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
