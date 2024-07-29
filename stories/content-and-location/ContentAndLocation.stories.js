import contentAndLocation from "./content-and-location.twig";

export default {
    title: "Stories/Content And Location",
    component: "content-and-location",
    tags: ['autodocs'],
};

import '/assets/dist/css/blocks/card.css';
import '/assets/dist/blocks/content-and-location/style-index.css';

const Template = ( { 
    wrapper_attrs,
    heading,
    summary,
    content,
    display_location,
    image,
    location,
    hours,
    contact_url
 }) =>
    contentAndLocation({
        wrapper_attrs,
        heading,
        summary,
        content,
        display_location,
        image,
        location,
        hours,
        contact_url
    });

export const Default = Template.bind({});
Default.args = {
    wrapper_attrs: "content-and-location container-xl alignwide",
    heading: "Sample Department",
    summary: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    content: "<div><a class=\"btn btn-primary\" href=\"#\">Get Started</a></div>",
    display_location: true,
    image: {
        src: "https://via.placeholder.com/360x218",
        alt: "Placeholder Image"
    },
    location: "<p>R Building, First Floor, Room R130</p>",
    hours: "<p>Monday - Friday: 9 a.m. - 5 p.m.</p>",
    contact_url: "https://www.google.com"

};