/**
 * Block: Card (used to be called Panel)
 */

import { __ } from '@wordpress/i18n';
import { Fragment } from '@wordpress/element';
import { select, dispatch } from '@wordpress/data';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useState } from '@wordpress/element';

import {
	Button,
	Dashicon,
	Toolbar,
	ToggleControl,
	Panel,
	PanelBody,
	PanelRow,
	Disabled,

} from '@wordpress/components';

import {
	useBlockProps,
	RichText,
	BlockControls,
	InspectorControls,
} from '@wordpress/block-editor';


const mayflowerBlocksTab = createHigherOrderComponent( ( BlockListBlock ) => {
	return ( props ) => {
		if ( props.attributes.tabId && props.name === 'bc-sitka-spruce/tabcordion-list-tab' ) {
			return <li role="presentation" className={ props.attributes.tabActive ? 'active' : '' }><BlockListBlock { ...props } /></li>;
		}
		return <BlockListBlock { ...props } />;
	};
}, 'mayflowerBlocksTab' );

// Hook the HOC to replace the wrapping div for tab blocks
wp.hooks.addFilter( 'editor.BlockListBlock', 'bc-sitka-spruce/tabcordion-list-tab', mayflowerBlocksTab );


export default function Edit( props ) {
	const { attributes: {
		tabActive,
		tabId,
		tabTitle,
		tabDefault,
	}, setAttributes, isSelected, clientId } = props;

	const blockProps = useBlockProps({
		'aria-controls': `#${ tabId }` ,
		role: 'tab',
		'data-toggle': 'tab',
	});

	const tabListBlock = select( 'core/block-editor' ).getBlock( select( 'core/block-editor' ).getBlockRootClientId( clientId ) );
	const parentTabsBlock = select( 'core/block-editor' ).getBlock( select( 'core/block-editor' ).getBlockRootClientId( tabListBlock.clientId ) );
	const parentTabsInnerBlocks = parentTabsBlock.innerBlocks;
	const tabContentBlock = parentTabsInnerBlocks.find( child => {
		return child.name === 'bc-sitka-spruce/tabcordion-content';
	} );

	/**
	 * Handles updating the default tab.
	 *
	 * The default tab is the tab the user has selected as 'pinned'.
	 */
	const handleUpdateDefaultTab = () => {
		// Set current tab as default
		if ( tabDefault === false ) {
			setAttributes( { tabDefault: true } );
		}

		// Find other tabs that are set as default and set the tabDefault attribute to false
		tabListBlock.innerBlocks.forEach( tab => {
			if ( tab.attributes.tabDefault === true ) {
				dispatch( 'core/block-editor' ).updateBlockAttributes( tab.clientId, { tabDefault: false } );
			}
		} );

		// Set default panel body along with tab
		tabContentBlock.innerBlocks.forEach( panel => {
			// If other panels are default, set to false
			if ( panel.attributes.tabDefault === true ) {
				dispatch( 'core/block-editor' ).updateBlockAttributes( panel.clientId, { tabDefault: false } );
			}
			// Then set default panel if panel tabId matches the default tabId
			if ( panel.attributes.tabId === tabId ) {
				dispatch( 'core/block-editor' ).updateBlockAttributes( panel.clientId, { tabDefault: true } );
			}
		} );
	};

	/**
	 * Handles updating the active (currently selected) tab.
	 *
	 * By all rights this should be handled by state somewhere instead of an attribute, but that makes it difficult to sync between blocks.
	 */
	const handleUpdateActiveTab = () => {
		setAttributes( { tabActive: true } );
		if ( Array.isArray( parentTabsInnerBlocks ) ) {
			// Looks for other tabs that were previously active and set it to false
			tabListBlock.innerBlocks.forEach( tab => {
				if ( tab.attributes.tabId !== tabId ) {
					dispatch( 'core/block-editor' ).updateBlockAttributes( tab.clientId, { tabActive: false } );
				}
			} );
			// Sets new active tab panel then looks for other tabs that were previously active and set it to false
			tabContentBlock.innerBlocks.forEach( panel => {
				if ( panel.attributes.tabId === tabId ) {
					dispatch( 'core/block-editor' ).updateBlockAttributes( panel.clientId, { tabActive: true } );
				} else {
					dispatch( 'core/block-editor' ).updateBlockAttributes( panel.clientId, { tabActive: false } );
				}
			} );
		}
	};
	// Resync active tab with default tab on load
	const [ activeTabNeedsReset, setActiveTabNeedsReset ] = useState( tabDefault !== tabActive ? true : false );
	if ( activeTabNeedsReset && tabDefault ) {
		handleUpdateActiveTab();
		setActiveTabNeedsReset( false );
	}

	// Check if tab is selected and set tabActive attributes to true or false
	if ( isSelected ) {
		handleUpdateActiveTab();
	}

	/**
	 * Handles removing a tab and it's tab panel.
	 */
	const handleRemoveTab = () => {
		// Handles selecting previous or next block when deleting, so the flow of deletion is smoother
		const nextBlockClientId = select( 'core/block-editor' ).getNextBlockClientId( clientId );
		const prevBlockClientId = select( 'core/block-editor' ).getPreviousBlockClientId( clientId );
		if ( nextBlockClientId ) {
			dispatch( 'core/block-editor' ).selectBlock( nextBlockClientId );
		} else {
			dispatch( 'core/block-editor' ).selectBlock( prevBlockClientId );
		}

		// Remove the current tab
		dispatch( 'core/block-editor' ).removeBlock( clientId, false );

		// Find the corresponding tab panel and remove it
		const attachedPanel = tabContentBlock.innerBlocks.find( panel => {
			return panel.attributes.tabId === tabId;
		}
		);
		dispatch( 'core/block-editor' ).removeBlock( attachedPanel.clientId, false );
	};

	const handleUpdateTabTitle = ( newTabTitle ) => {
		// Update attribute on this block
		setAttributes( { tabTitle: newTabTitle } );
		const targetTabPanel = tabContentBlock.innerBlocks.find( ( block ) => block.attributes.tabId === tabId );

		dispatch( 'core/block-editor' ).updateBlockAttributes( targetTabPanel.clientId, { tabTitle: newTabTitle } );

	}

	/**
	 * TabToolBarControl returns a Toolbar component with set default tab and remove buttons to set or remove the tab and corresponding panel.
	 *
	 * @return {Object} Toolbar component with tab control buttons
	 * */
	const TabToolBarControl = () => {
		const controls = [
			{
				icon: <Dashicon icon="sticky" />,
				title: 'Set Default Tab',
				isActive: tabDefault,
				onClick: () => handleUpdateDefaultTab(),
			},
			{
				icon: <Dashicon icon="trash" />,
				title: 'Remove',
				onClick: () => handleRemoveTab(),
				isDestructive: true,
			},
		];

		return (
			<Toolbar controls={ controls } />
		);
	};




	return (
		<>
			<InspectorControls>
				<Panel>
					<PanelBody
						title="Tab Styles"
						initialOpen={ true }
					>
						<PanelRow>
							<ToggleControl
								label="Set as default active tab?"
								help={ tabDefault ? 'Is the default tab.' : 'Not the default tab.' }
								checked={ tabDefault }
								onChange={ ( tabDefault ) => {
									setAttributes( { tabDefault } );
									handleUpdateDefaultTab();
								} }
							/>
						</PanelRow>
					</PanelBody>
				</Panel>
			</InspectorControls>
			<BlockControls>
				<TabToolBarControl />
			</BlockControls>
			<a { ...blockProps } >
				<RichText
					allowedFormats={ [ '' ] }
					placeholder="Enter title..."
					keepPlaceholderOnFocus="true"
					value={ tabTitle }
					onChange={ ( tabTitle ) => handleUpdateTabTitle( tabTitle ) }
				/>
			</a>
		</>
	);

}
