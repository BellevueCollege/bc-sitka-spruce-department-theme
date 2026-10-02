import twigTabcordionTopTabs from "./tabcordion-top-tabs.twig";
import twigTabcordionTopTabsCard from "./tabcordion-top-tabs-card.twig";
import twigTabcordionSideTabs from "./tabcordion-side-tabs.twig";
import twigTabList from "./components/tab-list.twig";
import twigTabListTab from "./components/tab-list-tab.twig";
import twigTabContent from "./components/content.twig";
import twigTabContentPanel from "./components/content-panel.twig";

import '/assets/dist/css/blocks/nav.css';
import '/assets/dist/blocks/tabcordion/style-index.css';
import '/assets/dist/css/blocks/tabcordion-list.css';

export default {
	title: "Stories/Tabcordion",
	component: "tabcordion",
	argTypes: {
		heading_level: {
			control: 'select',
			options: [ 'h2', 'h3', 'h4', 'h5', 'h6' ],
			description: 'Which heading level should be used?',
		},
	},
	tags: [ 'autodocs' ],
};

const sampleTabs = [
	{ title: 'Tab 1', content: '<p>Tab 1 content</p>', isDefault: true },
	{ title: 'Tab 2', content: '<p>Tab 2 content</p>' },
	{ title: 'Tab 3', content: '<p>Tab 3 content</p>' },
];

const tabListItem = ( title, isDefault ) =>
	twigTabListTab( {
		title,
		active: isDefault ? 'active show' : '',
		aria_selected: isDefault ? 'true' : 'false',
	} );

const Template = ( {
	format,
	id,
	heading_level,
	display_heading_visually,
	wrap_content,
} ) => {
	const wrapperClasses = [
		'wp-block-bc-sitka-spruce-tabcordion',
		'tabcordion',
		`tabcordion-${ format }`,
	];

	if ( wrap_content ) {
		wrapperClasses.push( 'wrap-content' );
	}

	if ( format === 'tabs' ) {
		wrapperClasses.push( 'card' );
	}

	if ( format === 'list' ) {
		wrapperClasses.push( 'row' );
	}

	const wrapper_attrs = `id="${ id }" class="${ wrapperClasses.join( ' ' ) }"`;

	const tabList = twigTabList( {
		format,
		tab_links: sampleTabs
			.map( ( tab ) => tabListItem( tab.title, tab.isDefault ) )
			.join( '' ),
	} );

	const tabContent = twigTabContent( {
		panels: sampleTabs
			.map( ( tab ) =>
				twigTabContentPanel( {
					heading_level,
					display_heading_visually,
					title: tab.title,
					content: tab.content,
					active: tab.isDefault ? 'active show' : '',
					parent_id: id,
				} )
			)
			.join( '' ),
	} );

	const structure = tabList + tabContent;

	if ( format === 'tabs' ) {
		return twigTabcordionTopTabsCard( { wrapper_attrs, structure } );
	}

	if ( format === 'pills' ) {
		return twigTabcordionTopTabs( { wrapper_attrs, structure } );
	}

	return twigTabcordionSideTabs( { wrapper_attrs, structure } );
};

const sharedArgs = {
	id: 'tabcordion-1',
	heading_level: 'h2',
	display_heading_visually: true,
	wrap_content: true,
};

export const Tabs = Template.bind( {} );
Tabs.args = {
	...sharedArgs,
	format: 'tabs',
};

export const Pills = Template.bind( {} );
Pills.args = {
	...sharedArgs,
	format: 'pills',
};

export const VerticalList = Template.bind( {} );
VerticalList.args = {
	...sharedArgs,
	format: 'list',
};
