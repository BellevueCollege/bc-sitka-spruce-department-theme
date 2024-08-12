import twigSectionHeading from "./section-heading.twig";

export default {
    title: "Stories/Section Heading",
    component: "section-heading",
    tags: ['autodocs'],
    argTypes: {
        link_field: {
            control: 'boolean',
            description: 'Priority 2. Use ACF Link Field if `true`. Not Storybook compatible.',
        },
        link_custom: {
            control: 'object',
            description: 'Priority 1. Use Custom Link. Should have URL and Title.',
        },
        link: {
            control: 'text',
            description: 'Priority 3. Use HTML Link.',
        }
    }
};


const Template = ( { 
    eyebrow,
    heading,
    subheading,
    link,
    link_field,
    link_custom,
    classes,
    link_classes,
    css_vars,
 }) =>
    twigSectionHeading({
        eyebrow,
        heading,
        subheading,
        link,
        link_field,
        link_custom,
        classes,
        link_classes,
        css_vars
    });

export const Default = Template.bind({});
Default.args = {
    eyebrow: 'Eyebrow',
    heading: 'Section Heading',
    subheading: '<p>Subheading for this section</p>',
    link: null,
    link_field: null,
    link_custom: null,
    classes: [],
    link_classes: [],
    css_vars: [],
};

export const WithCustomLink = Template.bind({});
WithCustomLink.args = {
    ... Default.args,
    link_custom: {
        url: '#',
        title: 'Link Custom',
    },
}

export const WithLink = Template.bind({});
WithLink.args = {
    ... Default.args,
    link: '<a href="#" class="link-arrow">Link</a>',
}