import twigBreadcrumbs from "./breadcrumbs.twig";


export default {
    title: "Stories/Breadcrumbs",
    component: "breadcrumbs",
    tags: ['autodocs'],
};


const Template = ( { breadcrumbs }) =>
    twigBreadcrumbs({
		breadcrumbs
    });

export const Default = Template.bind({});
Default.args = {
	breadcrumbs: [
		'<a href="#" class="">Parent Page</a>',
		'Current Page',
	],
};
