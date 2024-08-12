import { createBlock } from '@wordpress/blocks';

const transforms = {
	from: [
		{
			type: 'block',
			blocks: [ 'mayflower-blocks/tabs' ],
			transform: ( attributes, innerBlocks ) => {

				// Create the tabs
				let tabList = createBlock(
					'bc-sitka-spruce/tabcordion-list',
					{},
					innerBlocks[0].innerBlocks.map( ( block, index ) => {
						return createBlock(
							'bc-sitka-spruce/tabcordion-list-tab',
							{
								tabId: block.attributes.tabId,
								tabTitle: block.attributes.tabTitle,
								tabDefault: block.attributes.tabDefault,
							},
						);
					}),
				);

				// Create the tab panels
				let tabPanels = createBlock(
					'bc-sitka-spruce/tabcordion-content',
					{},
					innerBlocks[1].innerBlocks.map( ( block, index ) => {
						return createBlock(
							'bc-sitka-spruce/tabcordion-content-panel',
							{
								tabId: block.attributes.tabId,
								tabDefault: block.attributes.tabDefault,
							},
							block.innerBlocks
						);
					})
				);

				// Update tab IDs, since they will have changed when the new block was created
				tabList.innerBlocks.forEach( ( block, index ) => {

					// Update tab ID on tab panel
					const panelIndex = tabPanels.innerBlocks.findIndex( ( tabPanels ) => tabPanels.attributes.tabId === block.attributes.tabId );
					tabPanels.innerBlocks[panelIndex].attributes.tabId = block.clientId;
					tabPanels.innerBlocks[panelIndex].attributes.tabTitle = block.attributes.tabTitle;

					// Update tab ID on tab list item
					block.attributes.tabId = block.clientId;
				});


				// Return array of innerblocks for main tab block
				const newInnerBlocks = [ tabList, tabPanels ];

				// Return new block with new innerblocks
				return createBlock('bc-sitka-spruce/tabcordion', {}, newInnerBlocks );
			}
		},
	],
}

export default transforms;
