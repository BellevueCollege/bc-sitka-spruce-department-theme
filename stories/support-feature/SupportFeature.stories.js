import twigSupportFeature from "./support-feature.twig";
import twigTabList from "../tabcordion/components/tab-list.twig";
import twigTabListTab from "../tabcordion/components/tab-list-tab.twig";
import twigTabContent from "../tabcordion/components/content.twig";
import twigTabContentPanel from "../tabcordion/components/content-panel.twig";


import '/assets/dist/css/blocks/card.css'
import '/assets/dist/css/blocks/nav.css';
import '/assets/dist/css/blocks/accordion.css';
import '/assets/dist/css/blocks/tabcordion-list.css';
import '/assets/dist/blocks/support-feature/style-index.css';


export default {
    title: "Stories/Support Feature",
    component: "supportFeature",
    argTypes: {
    },
    tags: ['autodocs'],
};


const Template = ( {
	wrapper_attrs,
	heading,
	tabs
}) => {
	return twigSupportFeature({
		wrapper_attrs,
		heading,
		tabs
	});
};

console.log(twigSupportFeature({
	wrapper_attrs: `id="tabcordion-1" class="row tabcordion tabcordion-list"`,
	heading: 'Support Features',
	tabs: [
		{
			active: true,
			title: 'Tab 1',
			heading: 'Tab 1 heading',
			image: '<img src="https://via.placeholder.com/300x200">',
			content: 'Tab 1 content',
			links: [
				{
					title: 'Link 1',
					url: 'https://www.example.com',
				}
			]
		},
	]
}));


export const Default = Template.bind({});
Default.args = {
	wrapper_attrs: `id="tabcordion-1" class="row tabcordion tabcordion-list"`,
	heading: 'Support Features',
	tabs: [
		{
			active: true,
			title: 'Tab 1',
			heading: 'Tab 1 heading',
			image: '<img src="https://via.placeholder.com/560x320" class="img-fluid rounded">',
			content: 'Tab 1 content',
			links: [
				{
					title: 'Link 1',
					url: 'https://www.example.com',
				}
			]
		},
	]
};
