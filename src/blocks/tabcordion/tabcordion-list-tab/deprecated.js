
import {
	useBlockProps,
	RichText,
	BlockControls,
	InspectorControls,
	AlignmentToolbar,
} from '@wordpress/block-editor';


import { __ } from '@wordpress/i18n';

import { getBlockDefaultClassName } from '@wordpress/blocks';

const attributes = {
	tabActive: {
		type: 'boolean',
		default: false,
	},
	tabId: {
		type: 'string',
		default: '',
	},
	tabTitle: {
		type: 'string',
		default: '',
	},
	tabDefault: {
		type: 'boolean',
		default: false,
	},
}

const deprecated = [
	{
		attributes,
		save: function ( props ) {
			const { attributes: {
				tabActive,
				tabId,
				tabTitle,
				tabDefault,
			} } = props;

			const blockProps = useBlockProps.save({
				role: 'presentation',
				className: 'nav-item',
			});

			return (
				<li { ...blockProps }>
					<a
						className={ `nav-link ${ tabDefault ? ' active' : '' }` }
						id={ `tab_link_${ tabId }` }
						href={ `#tab_${ tabId }` }
						aria-controls={ `tab_${ tabId }` }
						role="tab"
						data-toggle="tab"
						data-bs-toggle="tab"
						data-bs-target={ `#tab_${ tabId }` }
					>
						<RichText.Content
							value={ tabTitle }
						/>
					</a>
				</li>
			);
		}
	}
]
export default deprecated;
