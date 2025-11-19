import twigBodySection from "./body-section.twig";
import twigContent from "./body-section-content.twig";
import twigCallout from "../callout/callout.twig";

import '/assets/dist/blocks/callout/style-index.css';
import '/assets/dist/blocks/body-section/style-index.css';

export default {
    title: "Stories/Body Section",
    component: "bodySection",
    argTypes: {
    },
    tags: ['autodocs'],
};

const Content = ( {
	content
}) => {
	return twigContent({
		content
	});
}


const Callout = ( {
	wrapper_classes,
	heading_tag,
	title,
	text,
	content,
	links
}) => {
	return twigCallout({
		wrapper_classes,
		heading_tag,
		title,
		text,
		content,
		links
	});
}

const Template = ( {
	content
}) => {
	return twigBodySection({
		wrapper_attrs: 'id="example-anchor" class="section section-white body-section-wrapper"',
		content
	});
};


export const Default = Template.bind({});
Default.args = {
	content: [
		Content({
			content: '<h2>Body Section Heading</h2><p>Body Section content</p>',
		}),
		Callout({
			wrapper_classes: 'col-md-4',
			heading_tag: 'h3',
			title: 'Callout Heading',
			text: '<p>Callout Text</p>',
			content: "Content!!!",
		})
	].join('')

};
