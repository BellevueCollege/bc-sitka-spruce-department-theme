
import bcDegreeSock from "./degree-sock.twig";



export default {
    title: "Stories/Sock/Degree Sock",
    component: "degree-sock",
    tags: ['autodocs'],
};


const Template = ( {
	enable,
	main_heading,
	main_text,
	message_segments,
	admissions_contact_image,
	admissions_contact_title,
	admissions_contact_description,
	admissions_contact_button
 }) =>
    bcDegreeSock({
		enable,
		main_heading,
		main_text,
		message_segments,
		admissions_contact_image,
		admissions_contact_title,
		admissions_contact_description,
		admissions_contact_button
    });

export const Default = Template.bind({});
Default.args = {
	enable: true,
	main_heading: "Degree Sock",
	main_text: "This is some text about degree socks.",
	message_segments: [
		{
			title: "Degree Sock Section 1",
			description: "This is some text about degree socks. It has a button!",
			button: {
				url: "#",
				title: "Degree Sock CTA",
			},
		},
		{
			title: "Degree Sock Section 2",
			description: "This is some text about degree socks. It has a link!",
			link: {
				url: "#",
				title: "Degree Sock CTA",
			},
		}
	],
	admissions_contact_image: {
		src: "https://placehold.co/360x240",
		alt: "Placeholder Image",
	},
	admissions_contact_title: "Admissions",
	admissions_contact_description: "Get Admission Help",
	admissions_contact_button: {
		url: "#",
		title: "Admissions CTA",
	},

};
