import {__} from '@wordpress/i18n';
import {
	useBlockProps,
	RichText,
	BlockControls,
	InspectorControls,
	AlignmentToolbar,
} from '@wordpress/block-editor';



export default function save( props ) {
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

	return null;
}
