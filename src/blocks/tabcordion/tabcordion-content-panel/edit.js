/**
 * Block: Card (used to be called Panel)
 */

import { __ } from '@wordpress/i18n';

import {
	useBlockProps,
	InnerBlocks
} from '@wordpress/block-editor';

export default function Edit( props ) {
	const blockProps = useBlockProps(
		{
			role: 'tabpanel',
			className: `tabcordion-pane ${ props.attributes.tabActive ? 'active' : '' }`,
			id: props.attributes.tabId
		}
	);
	const { attributes: {

	}, setAttributes, isSelected, clientId, context } = props;

	let allowedBlocks = context['bc-sitka-spruce/tabcordion/allowedBlocks'];
	allowedBlocks = allowedBlocks.length > 0 ? allowedBlocks : true;

	return (
		<div { ...blockProps }>
			<InnerBlocks
				templateLock={ false }
				allowedBlocks={ allowedBlocks }
				renderAppender={ allowedBlocks !== true ? InnerBlocks.ButtonBlockAppender : InnerBlocks.DefaultBlockAppender }
				placeholder={ <p>Click the + icon to add a block</p> }
			/>
		</div>
	);

}
