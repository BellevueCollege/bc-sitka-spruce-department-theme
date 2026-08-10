import detailsContent from "./details-content.twig";

export default {
    title: "Stories/Profile Detail Content",
    component: "profile-detail-content",
    tags: ['autodocs'],
};


const Template = ( {
    profile_image,
    first_name,
    last_name,
    gender_pronouns,
    position,
    department,
    email,
    phone,
    languages,
    office_location,
    office_hours,
    linkedin,
    additional_url,
 }) =>
    detailsContent({
        profile_image,
        first_name,
        last_name,
        gender_pronouns,
        position,
        department,
        email,
        phone,
        languages,
        office_location,
        office_hours,
        linkedin,
        additional_url,
    });

export const Default = Template.bind({});
Default.args = {
    profile_image: '<img class="rounded img-fluid a11y-decorative" src="https://picsum.photos/id/237/460/460" alt="Placeholder Image"></img>',
    first_name: "John",
    last_name: "Doe",
    gender_pronouns: "they/them",
    position: "Manager",
    department: [{name: 'Campus Ops'}],
    email: "XKZfH@example.com",
    phone: "555-555-5555",
    languages: "English, French",
    office_location: "Bellevue, WA",
    office_hours: "Mon-Fri 9am-5pm",
    linkedin: {title:"My LinkedIn"},
    additional_url: {additional_url:"https://example.com"}
};


export const RequiredOnly = Template.bind({});
RequiredOnly.args = {
    first_name: "John",
    last_name: "Doe",
    position: "Manager",
    department: [{name: 'Campus Ops'}],
};
