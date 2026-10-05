import template from './agenda-list.twig';

export default {
    title: 'Stories/Agenda List',
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['action-item', 'agenda', 'resolution'],
        },
        extra_classes: { control: 'text' },
    },
};

const Template = (args) => template(args);

export const ActionItems = Template.bind({});
ActionItems.args = {
    variant: 'action-item',
    items: [
        {
            link: '#',
            title: 'Action Item 26-01: Operating Budget Request Approval',
            date: 'November 5, 2026',
        },
        {
            link: '#',
            title: 'Action Item 26-02: Campus Facilities Master Plan Amendment',
            date: 'September 12, 2026',
        },
    ],
};

export const Agendas = Template.bind({});
Agendas.args = {
    variant: 'agenda',
    items: [
        {
            link: '#',
            date: 'November 5, 2026',
            is_special: false,
        },
        {
            link: '#',
            date: 'September 12, 2026',
            is_special: true,
        },
    ],
};

export const Resolutions = Template.bind({});
Resolutions.args = {
    variant: 'resolution',
    items: [
        {
            link: '#',
            title: 'Resolution 24-44: Academic Program Review Guidelines',
            date: 'December 4, 2024',
        },
        {
            link: '#',
            title: 'Resolution 24-45: Campus Sustainability Initiative',
            date: 'October 15, 2024',
        },
    ],
};
