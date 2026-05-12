import twigBioSection from "./bio-section.twig";
import twigBioContent from "./bio-section-content.twig";
import twigCallout from "../callout/callout.twig";

import '/assets/dist/blocks/callout/style-index.css';
import '/assets/dist/blocks/bio-section/style-index.css';

export default {
    title: "Stories/Bio Section",
    component: "bioSection",
    tags: ['autodocs'],
};

const Content = ( {
	content
}) => {
	return twigBioContent({
		content
	});
}

const Template = ( {
	content,
	anchor
}) => {
	return twigBioSection({
		content,
		anchor
	});
};
const Callout = ( {
	wrapper_classes,
	heading_tag,
	title,
	text,
	content,
	button
}) => {
	return twigCallout({
		wrapper_classes,
		heading_tag,
		title,
		text,
		content,
		button
	});
}



export const Default = Template.bind({});
Default.args = {
	anchor: 'about-me',
	content:
		Content({
			content:`<h2 class="wp-block-heading">About Me</h2><p>HI this is an about me blurb</p><h3 class="wp-block-heading">Education</h3><ul class="wp-block-list"><li>Shorecrest HS</li><li>Cascadia CC</li>
<li>Bellevue COllege</li></ul><h3 class="wp-block-heading">Current Course(s)</h3><ul class="wp-block-list"><li><a href="http://bc2022.local/sitka/sample-page/" data-type="page" data-id="2">Sample Page</a></li>
<li><a href="http://bc2022.local/sitka/example-page-template/" data-type="page" data-id="104">Example Page template</a></li></ul>`
		}) +
		Callout({
			wrapper_classes: 'col-md-4',
			heading_tag: 'h3',
			title: 'Callout Heading',
			text: '<p>Callout Text</p>',
            button: {
                url: '#',
                title: 'Learn More'
            }
		})
};