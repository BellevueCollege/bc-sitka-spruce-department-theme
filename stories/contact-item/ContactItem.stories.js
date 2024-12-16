import contactItem from "./contact-item.twig";
import contactLoop from "./contact-loop.twig";

import '/assets/dist/blocks/contact-selector/style-index.css';

export default {
    title: "Stories/Contact Section/Contact Item",
    component: "contact-item",
    tags: ['autodocs'],
};


const Template = ( {
    first_name,
    last_name,
    position,
    phone,
    email,
    scheduling_link
 }) =>
    contactItem({
        first_name,
        last_name,
        position,
        phone,
        email,
        scheduling_link
    });

export const Default = Template.bind({});
Default.args = {

    first_name: "John",
    last_name: "Doe",
    position: "Manager",
    phone: "555-555-5555",
    email: "XKZfH@example.com",
    scheduling_link: {
		title: "Schedule Appointment",
		url: "https://example.com"
	}

};


export const RequiredOnly = Template.bind({});
RequiredOnly.args = {
    ...Default.args,
    first_name: "John",
    last_name: "Doe",
    position: "Manager",
    phone: null,
    email: null,
    scheduling_link: null

};
