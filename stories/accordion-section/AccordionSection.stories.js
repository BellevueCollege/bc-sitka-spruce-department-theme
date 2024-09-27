import twigAccordionSection from "./accordion-section.twig";
import twigContent from "./accordion-section-content.twig";
import twigCallout from "../callout/callout.twig";


import '/assets/dist/css/blocks/nav.css';
import '/assets/dist/css/blocks/accordion.css';
import '/assets/dist/blocks/callout/style-index.css';
import '/assets/dist/blocks/accordion-section/style-index.css';

export default {
    title: "Stories/Accordion Section",
    component: "accordionSection",
    argTypes: {
    },
    tags: ['autodocs'],
};

const Content = ( {
	title,
	description,
	accordion
}) => {
	return twigContent({
		title,
		description,
		accordion
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
	heading,
	subheading,
	content
}) => {
	return twigAccordionSection({
		heading,
		subheading,
		content
	});
};



const ContentTemplate = ( {
	title,
	description,
	content
}) => {
	return twigContent({
		title,
		description,
		content
	});
}


export const Default = Template.bind({});
Default.args = {
	content:
		Content({
			title: 'Tabcordion Section Heading',
			description: '<p>Tabcordion Section Subheading</p>',
			accordion: '<div class="accordion-placeholder p-3 rounded text-bg-primary"><p>Mayflower Blocks Accordion Goes Here!</p></div>'
		}) +
		Callout({
			wrapper_classes: 'col-md-4',
			heading_tag: 'h3',
			title: 'Callout Heading',
			text: '<p>Callout Text</p>',
			content: "Content!!!",
		})

};
