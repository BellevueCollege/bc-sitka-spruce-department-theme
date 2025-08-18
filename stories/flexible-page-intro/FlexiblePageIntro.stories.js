import twigPageIntro from "./flexible-page-intro.twig";


export default {
    title: "Stories/Page Intros/Flexible Page Intro",
    component: "flexiblePageIntro",
    tags: ['autodocs'],
};


const Template = ({ title, intro_text, header_image }) =>
	twigPageIntro({
		title,
		intro_text,
		header_image,
		has_header_image: !!header_image, 
	});

export const Default = Template.bind({});
Default.args = {
	breadcrumbs: [
		'<a href="#" class="">Parent Page</a>',
		'<a href="#" class="">Current Page</a>',
	],
	title: "Flexible Page Title",
	intro_text: "Cras et faucibus tellus. Praesent urna erat, convallis fringilla magna nec, vehicula vestibulum elit. In vulputate ultricies ipsum eget bibendum. Duis sollicitudin erat eget purus tempus mattis. Morbi eu dapibus turpis, sed dapibus orci. Nullam non pellentesque tellus. Nam ut aliquam tortor, eget faucibus tortor",
	header_image: '<img src="https://picsum.photos/id/28/560/440" alt="Placeholder Image" class="img-fluid rounded">',
};

export const NoImage = Template.bind({});
NoImage.args = {
	...Default.args,
	header_image: null
}

export const TitleOnly = Template.bind({});
TitleOnly.args = {
	...NoImage.args,
	intro_text: null
}
