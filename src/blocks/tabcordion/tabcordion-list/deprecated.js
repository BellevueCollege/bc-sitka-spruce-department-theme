

import { __ } from '@wordpress/i18n';

import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

const deprecated = [
	{
		save: function() {
			const blockProps = useBlockProps.save({
				className: 'card-header',
			});
			return (
				<div {...blockProps }>
					<ul className='nav nav-tabs card-header-tabs' role='tablist'>
						<InnerBlocks.Content />
					</ul>
				</div>
			);
		}
	}
]
export default deprecated;
