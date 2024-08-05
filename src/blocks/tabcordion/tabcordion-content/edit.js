/**
 * Block: Card (used to be called Panel)
 */

import { __ } from '@wordpress/i18n';


import {
	useBlockProps,
	InnerBlocks
} from '@wordpress/block-editor';

export default function Edit( props ) {
	const blockProps = useBlockProps({
		className: 'tabcordion-content'
	});
	const { attributes: {
	}, setAttributes, isSelected } = props;

	return (
		<div { ...blockProps }>
			<InnerBlocks
				allowedBlocks={ [ 'bc-sitka-spruce/tabcordion-content-panel' ] }
				renderAppender={ false }
				templateLock={ false }
			/>
		</div>
	);

}
