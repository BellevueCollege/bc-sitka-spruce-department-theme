import template from './bootstrap-accordion.twig';
import agendaList from '../agenda-list/agenda-list.twig';

export default {
    title: 'Stories/Bootstrap Accordion',
    tags: ['autodocs'],
    argTypes: {
        accordion_id: { control: 'text' },
        keep_one_open_only: { control: 'boolean' },
    },
};

const Template = (args) => template(args);

const actionItemListContent = agendaList({
    variant: 'action-item',
    extra_classes: 'mb-0',
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
});

const actionItemListContent2025 = agendaList({
    variant: 'action-item',
    extra_classes: 'mb-0',
    items: [
        {
            link: '#',
            title: 'Action Item 25-14: Faculty Tenure Approvals',
            date: 'May 10, 2025',
        },
        {
            link: '#',
            title: 'Action Item 25-15: Student Housing Fee Adjustments',
            date: 'January 15, 2025',
        },
    ],
});

const actionItemListContent2024 = agendaList({
    variant: 'action-item',
    extra_classes: 'mb-0',
    items: [
        {
            link: '#',
            title: 'Action Item 24-44: Academic Program Review Guidelines',
            date: 'December 4, 2024',
        },
    ],
});

export const Default = Template.bind({});
Default.args = {
    accordion_id: 'actionItemsYearAccordion',
    keep_one_open_only: true,
    items: [
        {
            id: 'year-2026',
            title: '2026 Meetings',
            is_open: true,
            content: actionItemListContent,
        },
        {
            id: 'year-2025',
            title: '2025 Meetings',
            is_open: false,
            content: actionItemListContent2025,
        },
        {
            id: 'year-2024',
            title: '2024 Meetings',
            is_open: false,
            content: actionItemListContent2024,
        },
    ],
};
