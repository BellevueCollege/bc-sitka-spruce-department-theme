import locationAndHours from "./location-and-hours.twig";


export default {
    title: "Stories/Content and Location/Location and Hours Sidebar",
    component: "location-and-hours",
    tags: ['autodocs'],
};


const Template = ( {
    image,
    location,
    hours,
    contact_url,
 }) =>
    locationAndHours({
        image,
        location,
        hours,
        contact_url
    });

export const Default = Template.bind({});
Default.args = {
    image: {
        src: "https://placehold.co/360x218",
        alt: "Placeholder Image"
    },
    location: "<p>R Building, First Floor, Room R130</p>",
    hours: "<p>Monday - Friday: 9 a.m. - 5 p.m.</p>",
    contact_url: "https://www.google.com"
};
