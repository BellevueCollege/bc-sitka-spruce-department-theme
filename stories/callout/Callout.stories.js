import twigCallout from "./callout.twig";

export default {
    title: "Stories/Callout",
    component: "callout",
    tags: ['autodocs'],
};


const Template = ( { wrapper_classes, heading_tag, title, text, links }) =>
    twigCallout({
		wrapper_classes,
		heading_tag,
        title,
        text,
        links
    });

export const Default = Template.bind({});
Default.args = {
	wrapper_classes: '',
	heading_tag: 'h2',
    title: 'Spring Quarter Starts Monday!',
    text: '<p>Get ready to celebrate the new year with our new program. </p>',
    links: "<ul><li><a href='#' class='link-arrow'>Learn more</a></li><li><a href='#' class='link-arrow'>Another Link</a></li></ul>"
};
