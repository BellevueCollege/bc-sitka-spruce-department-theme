import twigBlockEmptyState from './block-empty-state.twig';

export default {
	title: 'Stories/Atoms/Block Empty State',
	component: 'block-empty-state',
	tags: ['autodocs'],
	argTypes: {
		block_name: {
			control: 'text',
			description: 'Human label used to auto-generate the title (optional)',
		},
		title: {
			control: 'text',
			description: 'Override heading when block_name does not fit (optional)',
		},
		instructions: {
			control: 'text',
			description: 'Body text with sidebar guidance (required)',
		},
		variant: {
			control: 'select',
			options: ['unconfigured', 'disabled', 'optional'],
			description: 'Visual treatment for the empty state',
		},
		classes: {
			control: 'array',
			description: 'Extra wrapper classes (optional)',
		},
	},
};

const Template = ({ block_name, title, instructions, variant, classes }) =>
	twigBlockEmptyState({
		block_name,
		title,
		instructions,
		variant,
		classes,
	});

export const Default = Template.bind({});
Default.args = {
	block_name: 'Contact Selector Section',
	instructions:
		'Select this element, then use the Settings sidebar to add a title, description, and choose contacts to display.',
	variant: 'unconfigured',
	classes: [],
};

export const Disabled = Template.bind({});
Disabled.args = {
	title: "The optional 'Callout' sidebar is disabled.",
	instructions: 'Edit this element to enable it!',
	variant: 'disabled',
	classes: [],
};

export const Optional = Template.bind({});
Optional.args = {
	block_name: 'Hero Image',
	instructions:
		"Add an optional 'Hero Image' by selecting this block and using the Settings sidebar to choose or upload an image.",
	variant: 'optional',
	classes: [],
};

export const CustomTitle = Template.bind({});
CustomTitle.args = {
	title: 'No Department Selected!',
	instructions:
		'Select this block and use the Settings sidebar to configure what should be displayed.',
	variant: 'unconfigured',
	classes: [],
};

export const NoBlockName = Template.bind({});
NoBlockName.args = {
	instructions:
		'Select this element and use the Settings sidebar to add optional links or button.',
	variant: 'unconfigured',
	classes: [],
};
