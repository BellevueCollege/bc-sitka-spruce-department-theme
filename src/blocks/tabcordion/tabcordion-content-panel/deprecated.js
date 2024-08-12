
import {
	InnerBlocks,
	useBlockProps,
} from '@wordpress/block-editor';

import { __ } from '@wordpress/i18n';



const attributes = {
	tabActive: {
		type: 'boolean',
		default: false,
	},
	tabDefault: {
		type: 'boolean',
		default: false,
	},
	tabId: {
		type: 'string',
		default: '',
	},
};

const deprecated = [
	{
		attributes,
		save: function( props ) {
			const { attributes: {
				tabId,
				tabDefault
			} } = props;
			const blockProps = useBlockProps.save({
				role: 'tabpanel',
				'aria-labelledby': `tab_link_${ tabId }`,
				className: `tab-pane${ tabDefault === true ? ' active' : '' }`,
				id: `tab_${ tabId }`
			});
			return (
				<div { ...blockProps }>
					<InnerBlocks.Content />
				</div>
			);
		},
	},

]
export default deprecated;
