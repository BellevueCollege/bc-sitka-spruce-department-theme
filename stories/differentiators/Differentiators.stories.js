import twigDifferentiators from './differentiators.twig';
import twigDifferentiator from './differentiator.twig';

import {
	differentiatorIcon,
	differentiatorText,
	differentiatorImage,
} from './differentiator.data.js';
import '/assets/dist/blocks/differentiator-section/style-index.css';

export default {
	title: 'Stories/Differentiators',
	component: twigDifferentiators,
	tags: ['autodocs'],
};

const TemplateDifferentiators = ({ title, description, link_custom, content }) =>
	twigDifferentiators({
		title,
		description,
		link_custom,
		content,
	});

const TemplateDifferentiator = ({
	top_layout,
	top_text,
	top_superscript,
	top_icon,
	top_image,
	title,
	text,
	link,
}) =>
	twigDifferentiator({
		top_layout,
		top_text,
		top_superscript,
		top_icon,
		top_image,
		title,
		text,
		link,
	});

export const Default = TemplateDifferentiators.bind({});
Default.args = {
	title: 'Heading',
	description: 'Subheading',
	link_custom: {
		url: '#',
		title: 'Link',
	},
	content: [
		twigDifferentiator({ ...differentiatorText }),
		twigDifferentiator({ ...differentiatorIcon }),
		twigDifferentiator({ ...differentiatorImage }),
	].join(''),
};
