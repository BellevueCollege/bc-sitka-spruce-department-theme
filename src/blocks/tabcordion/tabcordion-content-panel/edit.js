/**
 * Block: Card (used to be called Panel)
 */

import { __ } from '@wordpress/i18n';

import {
	useBlockProps,
	InnerBlocks,
	InspectorControls,
} from '@wordpress/block-editor';

import { ToggleControl, PanelBody } from '@wordpress/components';


export default function Edit( props ) {
	const blockProps = useBlockProps(
		{
			role: 'tabpanel',
			className: `tabcordion-pane ${ props.attributes.tabActive ? 'active' : '' }`,
			id: props.attributes.tabId
		}
	);
	const { attributes: {
		tabTitle,
		displayHeadingVisually
	}, setAttributes, isSelected, clientId, context } = props;

	console.log( context );

	let allowedBlocks = context['bc-sitka-spruce/tabcordion/allowedBlocks'];
	allowedBlocks = allowedBlocks.length > 0 ? allowedBlocks : true;
	const hideFormats = context['bc-sitka-spruce/tabcordion/hideFormats'];
	const HeadingTag = context['bc-sitka-spruce/tabcordion/headingLevel'];

	return (
		<div { ...blockProps }>
			<InspectorControls>
				<PanelBody
					title={ __( 'Usage Information', 'bc-sitka-spruce' ) }
				>
					<p>
						{ __( `In order for tabs to be accessible to screen readers
							across all screen sizes, the tab title must be above the tab content.`, 'bc-sitka-spruce' ) }
					</p>
					<p>
						{ __( `You can choose if this heading should be visible to everyone
							or only to screen readers (this setting may be locked at times).`, 'bc-sitka-spruce' ) }
					</p>
					<p>
						{ __( `Note that you can only edit the heading text by editing the tab title.`, 'bc-sitka-spruce' ) }
					</p>
				</PanelBody>
				<PanelBody
					title={ __( 'Heading Visibility', 'bc-sitka-spruce' ) }
				>
					<ToggleControl
						style="float: right; width: 30%"
						label={ __( 'Display Heading Visually', 'bc-sitka-spruce' ) }
						checked={ displayHeadingVisually }
						disabled={ hideFormats }
						onChange={ ( value ) => setAttributes( { displayHeadingVisually: value } ) }
						help= {
							displayHeadingVisually
								? __( 'Heading will display to all website visitors', 'bc-sitka-spruce' )
								: __( 'Heading will only be read to visitors using screen readers', 'bc-sitka-spruce' )
						}
					/>
					{ hideFormats && (
						<p>{ __( 'This setting is currently locked because of how the block is configured.', 'bc-sitka-spruce' ) }</p>
					)}
				</PanelBody>

			</InspectorControls>

			<HeadingTag
				className={ ! displayHeadingVisually ? 'tab-heading indicate-hidden' : 'tab-heading' }
			>
				{ tabTitle } &nbsp;
				<span class="badge text-bg-secondary">
					{ HeadingTag } { ! displayHeadingVisually && (
						<>
							<i class="fa-solid fa-eye-low-vision" aria-hidden="true"></i>
							<span class="visually-hidden">{ __( 'Heading will be visually hidden', 'bc-sitka-spruce' ) }</span>
						</>
					) }
				</span>
				{ isSelected && (
					<div className='heading-visibility-toggle-container'>

					</div>
				) }
			</HeadingTag>
			<InnerBlocks
				templateLock={ false }
				allowedBlocks={ allowedBlocks }
				renderAppender={ allowedBlocks !== true ? InnerBlocks.ButtonBlockAppender : InnerBlocks.DefaultBlockAppender }
				placeholder={ <p>Click the + icon to add a block</p> }
			/>
		</div>
	);

}
