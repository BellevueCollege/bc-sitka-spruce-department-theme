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
    position,
    department,
    email,
    phone,
    languages,
    office_locale,
    office_hours,
    url,
    additional_url
 }) =>
    detailsContent({
        profile_image,
        first_name,
        last_name,
        position,
        department,
        email,
        phone,
        languages,
        office_locale,
        office_hours,
        url,
        additional_url
    });

export const Default = Template.bind({});
Default.args = {
    profile_image: '<img class="rounded img-fluid" src="https://picsum.photos/id/237/460/460" alt="Placeholder Image"></img>',
    first_name: "John",
    last_name: "Doe",
    position: "Manager",
    department: "Department or Office",
    email: "XKZfH@example.com",
    phone: "555-555-5555",
    languages: "English, French",
    office_locale: "Bellevue, WA",
    office_hours: "Mon-Fri 9am-5pm",
    url: "https://example.com",
    additional_url: "https://example.com"

};


export const RequiredOnly = Template.bind({});
RequiredOnly.args = {
    first_name: "John",
    last_name: "Doe",
    position: "Manager",
    department: "noneya",
};