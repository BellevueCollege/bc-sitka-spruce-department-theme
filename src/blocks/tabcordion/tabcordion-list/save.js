import { InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';


import {
	useBlockProps,

} from '@wordpress/block-editor';

export default function save( props ) {
	const blockProps = useBlockProps.save({
		className: 'card-header',
	});
	return (
		<InnerBlocks.Content />
	);
}
