import { createBlock } from '@wordpress/blocks';

const transforms = {

	from: [
		{
			type: 'block',
			blocks: [ 'bc-sitka-spruce/tabcordion' ],
			transform: ( attributes, innerBlocks ) => {

				const tabsComponent = createBlock( 'bc-sitka-spruce/tabcordion', {
					blockId: attributes.blockId,
					format: "list",
					headingLevel: "h3",
					displayHeadingsVisually: true,
					_hideFormats: true,
				}, innerBlocks );
				return createBlock( 'bc-sitka-spruce/tabs-section', attributes, [ tabsComponent ] );
			}
		},
	],

	to: [
		{
			type: 'block',
			blocks: [ 'bc-sitka-spruce/tabcordion' ],
			transform: ( attributes, innerBlocks ) => {
				const tabs = innerBlocks[0];
				return createBlock( 'bc-sitka-spruce/tabcordion', {
					blockId: tabs.attributes.blockId,
					format: "list",
				}, tabs.innerBlocks );
			}
		}
	],
};

export default transforms;
