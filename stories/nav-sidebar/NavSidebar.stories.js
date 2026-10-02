import twigNavSidebar from "./nav-sidebar.twig";

const sampleContextMenu = `
	<div class="menu">
		<ul>
			<li class="page_item page-item-1 current_page_item"><a href="#">Current Page</a></li>
			<li class="page_item page-item-2"><a href="#">Sibling Page</a></li>
			<li class="page_item page-item-3 page_item_has_children">
				<a href="#">Page with Children</a>
				<ul class="children">
					<li class="page_item"><a href="#">Child Page</a></li>
				</ul>
			</li>
		</ul>
	</div>
`;

export default {
	title: "Stories/Navigation Sidebar",
	component: "nav-sidebar",
	tags: ["autodocs"],
};

const Template = (args) => twigNavSidebar(args);

export const ChildPage = Template.bind({});
ChildPage.args = {
	is_child_page: true,
	parent_page: {
		title: "Parent Section",
		url: "#parent-section",
	},
	context_menu: sampleContextMenu,
};

export const TopLevelPage = Template.bind({});
TopLevelPage.args = {
	is_child_page: false,
	parent_page: {
		title: "Home",
		url: "#home",
	},
	context_menu: sampleContextMenu,
	site_name: "Example Department",
};
