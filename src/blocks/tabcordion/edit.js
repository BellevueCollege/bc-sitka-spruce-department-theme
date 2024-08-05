/**
 * Block: Tabs
 */

import { __ } from '@wordpress/i18n';

import {
	useBlockProps,
	InnerBlocks
} from '@wordpress/block-editor';


import './editor.scss';

export default function Edit( props ) {
	const blockProps = useBlockProps();
	const { attributes: {
	} } = props;

	const TEMPLATE = [
		[ 'bc-sitka-spruce/tabcordion-list', {}, [] ],
		[ 'bc-sitka-spruce/tabcordion-content', {}, [] ],
	];

	return (
		<div { ...blockProps }>
			<InnerBlocks
				template={ TEMPLATE }
				templateLock={ 'insert' }
				allowedBlocks={ [ 'bc-sitka-spruce/tabcordion-list', 'bc-sitka-spruce/tabcordion-content'] }
				renderAppender={ false }
			/>
		</div>
	);

}
