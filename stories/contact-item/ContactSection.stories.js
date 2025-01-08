import contactItem from "./contact-item.twig";
import contactLoop from "./contact-loop.twig";

import '/assets/dist/blocks/contact-selector/style-index.css';

export default {
    title: "Stories/Contact Section",
    component: "contact-section",
    tags: ['autodocs'],
};


const Template = ( {
    title,
	description,
	profiles
 }) =>
    contactLoop({
		title,
		description,
		profiles
    });

const profileAll = {
    first_name: "John",
    last_name: "Doe",
    position: "Manager",
    phone: "555-555-5555",
    email: "XKZfH@example.com",
    scheduling_text: "Schedule Appointment",
    scheduling_link: "https://example.com"
};

const profileRequired = {
    first_name: "John",
    last_name: "Doe",
    position: "Manager",
    phone: null,
    email: null,
    scheduling_text: null,
    scheduling_link: null
};

export const Default = Template.bind({});
Default.args = {
    title: "Contact Selector",
	description: "This section displays a list of contact profiles",
	profiles: [
		profileAll,
		profileRequired,
		profileAll
	]
};
