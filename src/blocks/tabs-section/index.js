import { InnerBlocks, useBlockProps} from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { RichText } from '@wordpress/block-editor';

import transforms from './transforms';
import Link from '../shared-elements/link';
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
registerBlockType( 'bc-sitka-spruce/tabs-section', {
	edit: ( props ) => {

		const { attributes: {
			title,
			description,
			linkTitle,
			linkUrl
		}, setAttributes, isSelected } = props;
		const blockProps = useBlockProps({
			className: 'tabs-section-component alignfull'
		});

		const BLOCK_TEMPLATE = [
			[ 'bc-sitka-spruce/tabcordion', {
				'format': 'list',
				'headingLevel': 'h3',
				'displayHeadingsVisually': true,
				'_hideFormats': true,
			} ],
		];

		return (
			<div { ...blockProps }>
				<div
					className="application-steps-header container-xl"
				>
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
								className= "link-accent-lg text-white"
							/>
						</div>
					</div>
				</div>
				<div className='container-xl alignwide'>
					<InnerBlocks
						template={ BLOCK_TEMPLATE }
						templateLock={ "all" }
					/>
				</div>
			</div>
		);

	},
	save: ( props ) => {
		return (
			<InnerBlocks.Content />
		);
	},
	transforms
} );
