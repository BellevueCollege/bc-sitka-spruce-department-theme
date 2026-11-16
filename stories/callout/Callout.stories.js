import twigCallout from "./callout.twig";

import '/assets/dist/blocks/callout/style-index.css';

export default {
    title: "Stories/Callout",
    component: "callout",
    tags: ['autodocs'],
};


const Template = ( { callout_type,wrapper_classes, heading_tag, title, text, links, button }) =>
    twigCallout({
		callout_type,
		wrapper_classes,
		heading_tag,
        title,
        text,
        links,
        button,
    });

export const Default = Template.bind({});
Default.args = {
	callout_type: 'callout-light',
	wrapper_classes: '',
	heading_tag: 'h2',
    title: 'Spring Quarter Starts Monday!',
    text: 'Get ready to celebrate the new year with our new program.',
    links: "<ul><li><a href='#' class='link-arrow'>Learn more</a></li><li><a href='#' class='link-arrow'>Another Link</a></li></ul>",
    button: { url: '#', title: 'Learn More' },
};

export const LightBlue = Template.bind({});
LightBlue.args = {
	...Default.args,
	callout_type: 'callout-info',
};

export const NoButton = Template.bind({});
NoButton.args = {
	...Default.args,
	button: null,
};

export const NoLinks = Template.bind({});
NoLinks.args = {
	...Default.args,
	links: null,
};
