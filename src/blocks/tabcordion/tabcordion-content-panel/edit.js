/**
 * Block: Card (used to be called Panel)
 */

import { __ } from '@wordpress/i18n';

import {
	useBlockProps,
	InnerBlocks,
} from '@wordpress/block-editor';

import { textBlocks } from "../../shared-elements/block-sets";


export default function Edit( props ) {
	const blockProps = useBlockProps(
		{
			role: 'tabpanel',
			className: `tabcordion-pane ${ props.attributes.tabActive ? 'active' : '' }`,
			id: props.attributes.tabId
		}
	);
	const { attributes: {
		tabTitle,
	}, setAttributes, isSelected, clientId, context } = props;

	let allowedBlocks = context['bc-sitka-spruce/tabcordion/allowedBlocks'];
	allowedBlocks = allowedBlocks.length > 0 ? allowedBlocks : textBlocks;
	const HeadingTag = context['bc-sitka-spruce/tabcordion/headingLevel'];
	const displayHeadingsVisually = context['bc-sitka-spruce/tabcordion/displayHeadingsVisually'];

	return (
		<div { ...blockProps }>
			<HeadingTag
				className={ ! displayHeadingsVisually ? 'tab-heading indicate-hidden' : 'tab-heading' }
			>
				{ tabTitle } &nbsp;
				<span class="badge text-bg-secondary">
					{ HeadingTag } { ! displayHeadingsVisually && (
						<>
							<i class="fa-solid fa-eye-low-vision" aria-hidden="true"></i>
							<span class="visually-hidden">{ __( 'Heading will be visually hidden', 'bc-sitka-spruce' ) }</span>
						</>
					) }
				</span>
				{ isSelected && (
					<div className='heading-visibility-toggle-container'>

					</div>
				) }
			</HeadingTag>
			<InnerBlocks
				templateLock={ false }
				allowedBlocks={ allowedBlocks }
				renderAppender={ allowedBlocks !== true ? InnerBlocks.ButtonBlockAppender : InnerBlocks.DefaultBlockAppender }
				placeholder={ <p>Click the + icon to add a block</p> }
			/>
		</div>
	);

}
