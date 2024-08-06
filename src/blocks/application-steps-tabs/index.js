import { InnerBlocks, useBlockProps} from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { RichText } from '@wordpress/block-editor';

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
registerBlockType( 'bc-sitka-spruce/application-steps-tabs', {
	edit: ( props ) => {

		const { attributes: { title, description }, setAttributes } = props;
		const blockProps = useBlockProps({
			className: 'application-steps-component alignwide'
		});

		const BLOCK_TEMPLATE = [
			[ 'bc-sitka-spruce/tabcordion', {
				'allowedBlocks': [ 'bc-sitka-spruce/application-step-single' ],
			} ],
		];

		return (
			<div { ...blockProps }>
				<div
					className="application-steps-header"
				>
					<RichText
						tagName="h2"
						value={ title }
						onChange={ ( title ) => setAttributes( { title } ) }
						placeholder={ __( 'Enter section title (required)...', 'bc-sitka-spruce' ) }
					/>
					<RichText
						tagName="p"
						value={ description }
						onChange={ ( description ) => setAttributes( { description } ) }
						placeholder={ __( 'Enter description (optional)...', 'bc-sitka-spruce' ) }
					/>
				</div>
				<InnerBlocks
					template={ BLOCK_TEMPLATE }
					templateLock={ "all" }
				/>
			</div>
		);

	},
	save: ( props ) => {
		return (
			<InnerBlocks.Content />
		);
	}
} );
