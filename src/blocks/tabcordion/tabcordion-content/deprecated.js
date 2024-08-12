
import {
	InnerBlocks,
	useBlockProps

} from '@wordpress/block-editor';

import { __ } from '@wordpress/i18n';

import { getBlockDefaultClassName } from '@wordpress/blocks';

const deprecated = [
	{
		save: function( {} ) {
			const blockProps = useBlockProps.save({
				className: 'card-body tab-content',
			});
			return (
				<div {...blockProps }>
					<InnerBlocks.Content />
				</div>
			);
		}
	},
]
export default deprecated;
