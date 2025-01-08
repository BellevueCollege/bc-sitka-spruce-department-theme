import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { InnerBlocks } from '@wordpress/block-editor';

import './style.scss';
import './editor.scss';

import { Card, CardBody, CardHeader } from '@wordpress/components';

const BLOCK_TEMPLATE = [
	[
		'core/heading',
		{
			placeholder: __('e.g. "Learning Areas"', 'bc-sitka-spruce'),
		},
	],
	[
		'core/list',
		{
			placeholder: __('Enter Learning Areas"', 'bc-sitka-spruce'),
		},
	],
	[
		'core/heading',
		{
			placeholder: __('e.g. "Learning Outcomes"', 'bc-sitka-spruce'),
		},
	],
	[
		'core/list',
		{
			placeholder: __('Enter learning outcomes"', 'bc-sitka-spruce'),
		},
	],
];

registerBlockType('bc-sitka-spruce/template-program-info', {
	edit: function (props) {
		const blockProps = useBlockProps({
			className: 'program-information alignwide container-xl',
		});

		return (
			<div {...blockProps}>
				<div className="row">
					<div className="col-md-8">
						<Card className="mb-3">
							<CardHeader>
								<h3>{__('Instructions:', 'bc-sitka-spruce')}</h3>
							</CardHeader>
							<CardBody>
								<p>
									{__(
										'Programs pull much of their information from a centralized program information section on the Core Bellevue College website.',
										'bc-sitka-spruce'
									)}
								</p>
								<p>
									{__(
										'Make sure you name this post the exact same name as the program in the Core Site.',
										'bc-sitka-spruce'
									)}
								</p>
								<p>
									{__(
										'Program information will not display in the editor, but will display on the front-end.',
										'bc-sitka-spruce'
									)}
								</p>
								<p>
									{__(
										'Additional degree information can be added on this post, using the blocks below.',
										'bc-sitka-spruce'
									)}
								</p>
								<p><i>{__('Note: these instructions only display in the editor', 'bc-sitka-spruce')}</i></p>
							</CardBody>
						</Card>
						<InnerBlocks
							template={BLOCK_TEMPLATE}
							allowedBlocks={[
								'core/heading',
								'core/paragraph',
								'core/list',
							]}
							templateLock=""
						/>
					</div>
					<div className="col-md-4">
						<Card>
							<CardBody>
								{__(
									'Program information sidebar will display here on the front-end',
									'bc-sitka-spruce'
								)}
							</CardBody>
						</Card>
					</div>
				</div>
			</div>
		);
	},
	save: function () {
		return <InnerBlocks.Content />;
	},
});
