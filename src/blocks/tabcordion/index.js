
import './editor.scss';
import './style.scss';

import Edit from './edit';
import deprecated from './deprecated';
import transforms from './transforms';
import save from './save';

import { __ } from '@wordpress/i18n';
import { registerBlockType, registerBlockVariation } from '@wordpress/blocks'; // Import registerBlockType() from wp.blocks

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
registerBlockType( 'bc-sitka-spruce/tabcordion', {
	edit: Edit,
	deprecated,
	transforms,
	save,
} );

registerBlockVariation( 'bc-sitka-spruce/tabcordion', {
	name: 'tabcordion-tabs',
	title: __( 'Classic Tabs', 'bc-sitka-spruce' ),
	icon: 'table-row-after',
	scope: 'transform',
	attributes: {
		format: 'tabs',
	},
	isActive: ['format'],
});

registerBlockVariation( 'bc-sitka-spruce/tabcordion', {
	name: 'tabcordion-pills',
	title: __( 'Tabs with Pill Format', 'bc-sitka-spruce' ),
	icon: 'ellipsis',
	scope: 'transform',
	attributes: {
		format: 'pills',
	},
	isActive: ['format'],
});

registerBlockVariation( 'bc-sitka-spruce/tabcordion', {
	name: 'tabcordion-list',
	title: __( 'Vertical Tabs', 'bc-sitka-spruce' ),
	icon: 'align-pull-right',
	scope: 'transform',
	attributes: {
		format: 'list',
	},
	isActive: ['format'],
});
