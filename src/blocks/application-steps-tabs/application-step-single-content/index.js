import { InnerBlocks, useBlockProps} from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { RichText } from '@wordpress/block-editor';

import blockSets  from "../../shared-elements/block-sets/wysiwyg.json";

registerBlockType( 'bc-sitka-spruce/application-step-single-content', {
	edit: ( props ) => {
		const blockProps = useBlockProps({
			className: 'application-step-single-content col-md-8'
		})

		const { attributes: { heading }, setAttributes } = props;

		const BLOCK_TEMPLATE = [
			[ 'core/paragraph' ]
		];


		return (
			<div { ...blockProps }>
				<RichText
					tagName="h4"
					className="application-step-single-heading h2"
					value={ heading }
					onChange={ ( heading ) => setAttributes( { heading } ) }
					placeholder={ __( 'Enter Step Heading (required)...', 'bc-sitka-spruce' ) }
				/>
				<InnerBlocks
					allowedBlocks={ blockSets.wysiwygBlocks }
					templateLock={ false }
					template={ BLOCK_TEMPLATE }
				/>
			</div>
		);

	},
	save: ( props ) => {
		const blockProps = useBlockProps.save({
			className: 'application-step-single-content col-md-8'
		});
		return (
			<div { ...blockProps }>
				<RichText.Content
					tagName="h4"
					className="application-step-single-heading h2"
					value={ props.attributes.heading }
				/>
				<InnerBlocks.Content />
			</div>
		);
	}
} );
