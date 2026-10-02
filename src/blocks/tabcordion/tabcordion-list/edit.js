/**
 * Block: Card (used to be called Panel)
 */

import { __ } from '@wordpress/i18n';

import { useEffect } from '@wordpress/element';

import { select, dispatch, useSelect } from '@wordpress/data';

import { createBlock } from '@wordpress/blocks';

import { Button } from '@wordpress/components';

import {
	useBlockProps,
	InnerBlocks
} from '@wordpress/block-editor';

/**
 * Keeps mobile accordion order in sync with tab order.
 *
 * Tabs and their content are stored as two separate lists. Dragging a tab
 * only changes the tab list, but on mobile the accordion shows panels in
 * the order they appear in the content list — so we reorder panels to match.
 *
 * @param {string} tabListClientId Client ID of the tabcordion-list block.
 */
const syncPanelOrderToTabList = ( tabListClientId ) => {
	const blockEditor = select( 'core/block-editor' );
	const parentTabsBlock = blockEditor.getBlock( blockEditor.getBlockRootClientId( tabListClientId ) );
	const tabListBlock = blockEditor.getBlock( tabListClientId );

	// The block might still be loading or getting deleted — wait until it's ready.
	if ( ! parentTabsBlock || ! tabListBlock ) {
		return;
	}

	// Panel content is stored in a separate block next to the tab list.
	const tabContentBlock = parentTabsBlock.innerBlocks.find( ( child ) => {
		return child.name === 'bc-sitka-spruce/tabcordion-content';
	} );

	// Can't reorder panels if the content area doesn't exist yet.
	if ( ! tabContentBlock ) {
		return;
	}

	const tabOrder = tabListBlock.innerBlocks.map( ( tab ) => tab.attributes.tabId );
	const panelOrder = tabContentBlock.innerBlocks.map( ( panel ) => panel.attributes.tabId );
	// Check if the tab order and panel order have the same length and if the tab order is the same as the panel order
	const hasOrderMismatch = tabOrder.length !== panelOrder.length
		|| tabOrder.some( ( tabId, index ) => tabId !== panelOrder[ index ] );

	// Panels are already in the right order — no changes needed.
	if ( ! hasOrderMismatch ) {
		return;
	}

	const { moveBlockToPosition } = dispatch( 'core/block-editor' );

	for ( let targetIndex = 0; targetIndex < tabOrder.length; targetIndex++ ) {
		// Check the current order again after each move, since positions change.
		const currentTabContentBlock = blockEditor.getBlock( tabContentBlock.clientId );

		// Stop if the content area was removed (for example, the user hit undo).
		if ( ! currentTabContentBlock ) {
			return;
		}

		const panelBlock = currentTabContentBlock.innerBlocks.find( ( panel ) => {
			return panel.attributes.tabId === tabOrder[ targetIndex ];
		} );

		// This tab has no matching panel — move on to the next one.
		if ( ! panelBlock ) {
			continue;
		}

		const currentIndex = currentTabContentBlock.innerBlocks.findIndex( ( panel ) => {
			return panel.clientId === panelBlock.clientId;
		} );

		if ( currentIndex !== targetIndex ) {
			moveBlockToPosition(
				panelBlock.clientId,
				tabContentBlock.clientId,
				tabContentBlock.clientId,
				targetIndex
			);
		}
	}
};

export default function Edit( props ) {
	const blockProps = useBlockProps({
		className: 'nav nav-tabs',
		role: 'tablist',
	});
	const { clientId } = props;

	const currentBlockData = select( 'core/block-editor' ).getBlock( clientId );

	// Watch the tab list order so we know when the user drags tabs around.
	const tabOrderKey = useSelect( ( selectFn ) => {
		const tabListBlock = selectFn( 'core/block-editor' ).getBlock( clientId );

		// The block isn't ready yet — this is normal when the page first loads.
		if ( ! tabListBlock ) {
			return '';
		}

		return tabListBlock.innerBlocks.map( ( tab ) => tab.clientId ).join( ',' );
	}, [ clientId ] );

	// Fix panel order when the page loads and whenever tabs are reordered.
	useEffect( () => {
		// No tabs yet — nothing to sync.
		if ( ! tabOrderKey ) {
			return;
		}

		syncPanelOrderToTabList( clientId );
	}, [ clientId, tabOrderKey ] );

	/**
		 * Adds a Tab Block (child) as an innerblock to the Tab List Block (parent).
		 *
		 * Also adds a corresponding panel with the tab clientId and updates the tab with it's clientId.
		 */
	const addTab = () => {
		const currentBlockDataInnerBlocks = currentBlockData.innerBlocks.length;
		// Create a tab to put into tab list
		const tabBlock = createBlock( 'bc-sitka-spruce/tabcordion-list-tab', { tabActive: currentBlockDataInnerBlocks === 0 ? true : false, tabDefault: currentBlockDataInnerBlocks === 0 ? true : false }, [] );
		// Add new tab into tab list
		dispatch( 'core/block-editor' ).insertBlock( tabBlock, currentBlockData.innerBlocks.length, clientId );
		// Add new panel and update the panel and tab with the clientId of that tab so that they connect to each other
		addPanel( tabBlock.clientId );
		updateTab( tabBlock.clientId );

		// Select new block after adding to prevent selecting panel block
		dispatch( 'core/block-editor' ).selectBlock( tabBlock.clientId );
	};

	/**
	 * Updates the Tab's attribute 'tabId' with it's clientId.
	 *
	 * Ensures that the Tab keeps a persistent id between refreshes.
	 * @param {string} tabClientId Client ID of the tab
	 */
	const updateTab = ( tabClientId ) => {
		dispatch( 'core/block-editor' ).updateBlockAttributes( tabClientId, { tabId: tabClientId } );
	};

	/**
	 * Adds a Panel Block (child) as an innerblock to the Tab Content Block (parent).
	 *
	 * A Panel is only added with a Tab and it's corresponding Tab's tabId.
	 * @param {string} tabClientId Client ID of the tab
	 */
	const addPanel = ( tabClientId ) => {
		// Get the parent block 'Tabs'
		const parentTabsBlock = select( 'core/block-editor' ).getBlock( select( 'core/block-editor' ).getBlockRootClientId( clientId ) );
		// Get the parent block Tabs innerblocks
		const parentTabsInnerBlocks = parentTabsBlock.innerBlocks;
		// Check if parent tab has innerblocks
		if ( Array.isArray( parentTabsInnerBlocks ) ) {
			// Find the tabcordion-content block
			const tabContentBlock = parentTabsInnerBlocks.find( child => {
				return child.name === 'bc-sitka-spruce/tabcordion-content';
			} );
			if ( tabContentBlock ) {
				// Create a panel body with the tabId to put into tab content list
				const panelBlock = createBlock( 'bc-sitka-spruce/tabcordion-content-panel', { tabId: tabClientId, tabActive: tabContentBlock.innerBlocks.length === 0 ? true : false, tabDefault: tabContentBlock.innerBlocks.length === 0 ? true : false }, [] );
				// Add new panel body into tab content list
				dispatch( 'core/block-editor' ).insertBlock( panelBlock, tabContentBlock.innerBlocks.length, tabContentBlock.clientId );
			}
		}
	};

	return (
		<ul {...blockProps } >
			<InnerBlocks
				allowedBlocks={ [ 'bc-sitka-spruce/tabcordion-list-tab' ] }
				templateLock={ false }
				renderAppender={ false }
				orientation="horizontal"
			/>
			<li role="presentation">
				<Button onClick={ addTab } className="add-tab">
					<i className="fa-solid fa-plus add-tab-icon" aria-hidden="true" />
					{ currentBlockData.innerBlocks.length === 0 ? <span>Add Tab</span> : <span className="screen-reader-text">Add Tab</span> }
				</Button>
			</li>
		</ul>
	);

}
