
import bcStandardSock from "./standard-sock.twig";



export default {
    title: "Stories/Sock",
    component: "sock",
    tags: ['autodocs'],
};


const Template = ( {
    standard_sock,
	display_location_card,
	location,
	location_image,
	hours,
	contact_page_url,
	website_manager,
 }) =>
    bcStandardSock({
		standard_sock,
		display_location_card,
		location,
		location_image,
		hours,
		contact_page_url,
		website_manager,
    });

export const Default = Template.bind({});
Default.args = {
	standard_sock: {
		cta: [
			{
				headline: "Standard Sock CTA",
				additional_text: "Standard Sock CTA",
				buttons: [
					{
						button: {
							url: "#",
							title: "Standard Sock CTA 1",
						},
					},
					{
						button: {
							url: "#",
							title: "Standard Sock CTA 2",
						},
					},
					{
						button: {
							url: "#",
							title: "Standard Sock CTA 3",
						}
					},
				],
			},
		],
	},

	display_location_card: true,
	location: '<p>Standard Sock Location</p>',
	location_image: '<img src="https://picsum.photos/id/18/300/200" alt="Placeholder Image" class="img-fluid rounded">',
	hours: '<p>Standard Sock Hours</p>',
	contact_page_url: "#",
	website_manager: {
		message: "For questions about this site, contact our site manager",
		first_name: "John",
		last_name: "Doe",
		position: "Manager",
		email: "XKZfH@example.com",
	}
};
