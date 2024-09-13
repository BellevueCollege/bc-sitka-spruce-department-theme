import twigDepartmentFeature from "./department-feature.twig";

export default {
    title: "Stories/Department Feature",
    component: "department-feature",
    tags: ['autodocs'],
};


const Template = ( {
    heading,
    subheading,
    link,
    eyebrow,
    dept_image,
    dept_url,
    dept_title,
    dept_summary,
    dept_services,
 }) =>
    twigDepartmentFeature({
        heading,
        subheading,
        link,
        eyebrow,
        dept_image,
        dept_url,
        dept_title,
        dept_summary,
        dept_services
    });

export const Default = Template.bind({});
Default.args = {
    heading: 'Featured Department',
    subheading: '<p>Serving Bellevue College Students</p>',
    link: '<a href="#" class="link-arrow">View All Programs</a>',
    eyebrow: 'Need Help?',
    dept_image: '<img class="img-fluid rounded" src="https://picsum.photos/id/130/660/500" alt="Placeholder" />',
    dept_url: '#',
    dept_title: 'Student Central',
    dept_summary: '<p>One-Stop shop for all your student needs.</p>',
    dept_services: [
        'Admission Services',
        'Financial Aid'
    ]
};
