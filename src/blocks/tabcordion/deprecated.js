
import {
	InnerBlocks,
	useBlockProps

} from '@wordpress/block-editor';

import { __ } from '@wordpress/i18n';

const deprecated = [
	{
		save: function() {

			const blockProps = useBlockProps.save({
				className: 'card',
			});
			return (
				<div {...blockProps }>
					<InnerBlocks.Content />
				</div>
			);

		},
	},

]
export default deprecated;
