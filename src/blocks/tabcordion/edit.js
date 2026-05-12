/**
 * Block: Tabs
 */

import { __ } from '@wordpress/i18n';

import {
	useBlockProps,
	InnerBlocks,
	BlockControls,
	InspectorControls,

} from '@wordpress/block-editor';

import { ToolbarGroup, ToolbarDropdownMenu, ToolbarButton } from '@wordpress/components';
import { ToggleControl, PanelBody } from '@wordpress/components';

import {
	// ToolbarBootstrapColorSelector,
	ToolbarBootstrapHeadingLevelSelector
} from '../shared-elements/toolbar';


export default function Edit( props ) {

	const { attributes: {
		format,
		headingLevel,
		displayHeadingsVisually,
		_hideFormats
	}, setAttributes, clientId } = props;

	const blockProps = useBlockProps({
		className: `tabcordion-${ format } ${ format !== 'tabs' ? 'alignwide' : '' }`
	});

	// Populate Block ID attribute
	setAttributes( { blockId: `tabcordion-${clientId}` } );


	const TEMPLATE = [
		[ 'bc-sitka-spruce/tabcordion-list', {}, [] ],
		[ 'bc-sitka-spruce/tabcordion-content', {}, [] ],
	];

	return (
		<div { ...blockProps }>
			<InspectorControls>
				<PanelBody
					title={ __( 'Heading Visibility', 'bc-sitka-spruce' ) }
				>
					<ToggleControl
						style={{ float: 'right', width: '30%' }}
						label={ __( 'Display Tab Headings Visually', 'bc-sitka-spruce' ) }
						checked={ displayHeadingsVisually }
						disabled={ _hideFormats }
						onChange={ ( value ) => setAttributes( { displayHeadingsVisually: value } ) }
						help= {
							displayHeadingsVisually
								? __( 'Headings will display to all website visitors', 'bc-sitka-spruce' )
								: __( 'Headings will only be read to visitors using screen readers', 'bc-sitka-spruce' )
						}
					/>
					{ _hideFormats && (
						<p>{ __( 'This setting is currently locked because of how the block is configured.', 'bc-sitka-spruce' ) }</p>
					)}
				</PanelBody>

			</InspectorControls>
			{ ! _hideFormats && (
				<BlockControls>
					<ToolbarGroup>
						<ToolbarBootstrapHeadingLevelSelector
							values= {  [ 'Heading 2', 'Heading 3', 'Heading 4', 'Heading 5', 'Heading 6' ] }
							active = { headingLevel }
							onClick = { ( value ) => setAttributes( { headingLevel: value } ) }
						/>
						<ToolbarDropdownMenu
							label={ __( 'Tab Format', 'bc-sitka-spruce' ) }
							icon="admin-appearance"
							title={ __( 'Tab Format', 'bc-sitka-spruce' ) }
							controls = { [
								{
									icon: 'table-row-after',
									title: __( 'Tabs', 'bc-sitka-spruce' ),
									isActive: format === 'tabs',
									onClick: () => setAttributes( { format: 'tabs' } ),
								},
								{
									icon: 'ellipsis',
									title: __( 'Pills', 'bc-sitka-spruce' ),
									isActive: format === 'pills',
									onClick: () => setAttributes( { format: 'pills' } ),
								},
								{
									icon: 'align-pull-right',
									title: __( 'Vertical List', 'bc-sitka-spruce' ),
									isActive: format === 'list',
									onClick: () => setAttributes( { format: 'list' } ),
								}
							]}
						/>
					</ToolbarGroup>
				</BlockControls>
			)}
			<InnerBlocks
				template={ TEMPLATE }
				templateLock={ 'insert' }
				allowedBlocks={ [ 'bc-sitka-spruce/tabcordion-list', 'bc-sitka-spruce/tabcordion-content'] }
				renderAppender={ false }
			/>
		</div>
	);

}
