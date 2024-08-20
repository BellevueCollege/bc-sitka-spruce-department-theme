import twigTestimonial from "./testimonial.twig";
import '/assets/dist/blocks/testimonial-section/style-index.css';
export default {
    title: "Stories/Testimonial",
    component: "testimonial",
    tags: ['autodocs'],
};



const Template = ( {
	title,
	description,
	image,
	quote,
	attribution_name,
	attribution_desc,
	cta
 }) =>
    twigTestimonial({
		title,
		description,
		image,
		quote,
		attribution_name,
		attribution_desc,
		cta
    });

export const Default = Template.bind({});
Default.args = {
	title: 'Featured Experience',
	description: 'Optional description of this section. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.',
	image: '<img src="https://placehold.co/560x680" class="img-fluid" alt="Placeholder Image">',
	quote: 'This is a quote from a student, faculty, alumni, or visitor that demonstrates the quality of Bellevue lorem ipsum dolor sie amet consectet etur adip iscing elit.',
	attribution_name: 'Jane Doe',
	attribution_desc: 'Class of 2033',
	cta: {
		title: 'Get Started',
		url: 'http://example.com',
	}
};
