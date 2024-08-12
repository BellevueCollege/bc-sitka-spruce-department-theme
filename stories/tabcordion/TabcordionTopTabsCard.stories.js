import twigTabcordion from "./tabcordion-top-tabs-card.twig";
import twigTabList from "./components/tab-list.twig";
import twigTabListTab from "./components/tab-list-tab.twig";
import twigTabContent from "./components/content.twig";
import twigTabContentPanel from "./components/content-panel.twig";


import '/assets/dist/css/blocks/card.css'
import '/assets/dist/css/blocks/nav.css';
import '/assets/dist/css/blocks/accordion.css';
import '/assets/dist/blocks/tabcordion/style-index.css';


export default {
    title: "Stories/Tabcordion/Tabcordion with Tabs and Card",
    component: "tabcordionTopTabsCard",
    argTypes: {
		heading_level: {
			control: 'select',
			options: ['h2', 'h3', 'h4', 'h5', 'h6'],
			description: 'Which heading level should be used?',
		},
    },
    tags: ['autodocs'],
};

const activeClasses = ( active = false ) => {
	return active ? 'active show' : '';
}

const tabListItem = ( title, active = '' ) => twigTabListTab({
	title,
	active,
	aria_selected: title
});



const Template = ( {
	id,
	heading_level,
	display_heading_visually,
	wrap_content,
}) => {
	const format = 'tabs';
	const wrapper_attrs = `id="${id}" class="tabcordion tabcordion-${format}"`;
	const tabList = twigTabList({
		format: format,
		tab_links: [
			tabListItem( 'Tab 1', 'active show' ),
			tabListItem( 'Tab 2' ),
			tabListItem( 'Tab 3' ),
		].join('')
	});

	const tabContent = twigTabContent({
		panels: [
			twigTabContentPanel({
				heading_level: heading_level,
				display_heading_visually: display_heading_visually,
				title: "Tab 1",
				content: "<p>Tab 1 content</p>",
				active: 'active show',
			}),
			twigTabContentPanel({
				heading_level: heading_level,
				display_heading_visually: display_heading_visually,
				title: "Tab 2",
				content: "<p>Tab 2 content</p>",
			}),
			twigTabContentPanel({
				heading_level: heading_level,
				display_heading_visually: display_heading_visually,
				title: "Tab 3",
				content: "<p>Tab 3 content</p>",
			}),
		].join('')
	});

	return twigTabcordion({
		wrapper_attrs,
		structure: tabList + tabContent
	});
};


export const Default = Template.bind({});
Default.args = {
	id: 'tabcordion-1',
	heading_level: 'h2',
	display_heading_visually: true,
	wrap_content: true
};
