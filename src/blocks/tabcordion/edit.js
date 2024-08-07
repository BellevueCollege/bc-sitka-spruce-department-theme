/**
 * Block: Tabs
 */

import { __ } from '@wordpress/i18n';

import {
	useBlockProps,
	InnerBlocks,
	BlockControls,

} from '@wordpress/block-editor';

import { ToolbarGroup, ToolbarDropdownMenu, ToolbarButton } from '@wordpress/components';


import './editor.scss';

export default function Edit( props ) {

	const { attributes: {
		format,
	}, setAttributes, clientId } = props;

	const blockProps = useBlockProps({
		className: `tabcordion-${ format }`
	});

	// Populate Block ID attribute
	setAttributes( { blockId: `tabcordion-${clientId}` } );


	const TEMPLATE = [
		[ 'bc-sitka-spruce/tabcordion-list', {}, [] ],
		[ 'bc-sitka-spruce/tabcordion-content', {}, [] ],
	];

	return (
		<div { ...blockProps }>
			<BlockControls>
				<ToolbarGroup>
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
			<InnerBlocks
				template={ TEMPLATE }
				templateLock={ 'insert' }
				allowedBlocks={ [ 'bc-sitka-spruce/tabcordion-list', 'bc-sitka-spruce/tabcordion-content'] }
				renderAppender={ false }
			/>
		</div>
	);

}
