import contactItem from "./contact-item.twig";

import '/assets/dist/blocks/contact-selector/style-index.css';

export default {
    title: "Stories/Contact Item",
    component: "contact-item",
    tags: ['autodocs'],
};


const Template = ( {
    first_name,
    last_name,
    position,
    phone,
    email,
    scheduling_text,
    scheduling_link
 }) =>
    contactItem({
        first_name,
        last_name,
        position,
        phone,
        email,
        scheduling_text,
        scheduling_link
    });

export const Default = Template.bind({});
Default.args = {

    first_name: "John",
    last_name: "Doe",
    position: "Manager",
    phone: "555-555-5555",
    email: "XKZfH@example.com",
    scheduling_text: "Schedule Appointment",
    scheduling_link: "https://example.com"

};


export const RequiredOnly = Template.bind({});
RequiredOnly.args = {
    ...Default.args,
    first_name: "John",
    last_name: "Doe",
    position: "Manager",
    phone: null,
    email: null,
    scheduling_text: null,
    scheduling_link: null

};
