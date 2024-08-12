import { InnerBlocks, useBlockProps} from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

registerBlockType( 'bc-sitka-spruce/application-step-single', {
	edit: ( props ) => {
		const blockProps = useBlockProps({
			className: 'application-step-single alignwide container-xl'
		})

		const { attributes: { }, setAttributes } = props;

		const BLOCK_TEMPLATE = [
			[ 'bc-sitka-spruce/application-step-single-content' ],
			[ 'bc-sitka-spruce/callout' ],
		];


		return (
			<div { ...blockProps }>
				<InnerBlocks
					templateLock={ 'all' }
					template={ BLOCK_TEMPLATE }
				/>
			</div>
		);

	},
	save: ( props ) => {
		const blockProps = useBlockProps.save({
			className: 'application-step-single'
		});
		return (
			<div { ...blockProps }>
				<div className='container-xl'>
					<div className='row'>
						<InnerBlocks.Content />
					</div>
				</div>
			</div>
		);
	}
} );
