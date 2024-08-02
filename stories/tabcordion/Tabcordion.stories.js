import twigTabcordion from "./tabcordion.twig";

export default {
    title: "Stories/Tabcordion",
    component: "tabcordion",
    parameters: {
        backgrounds: {
            default: 'bc-blue',
            values: [
                { name: 'bc-blue', value: '#003d79' },
            ]
        }
    },
    tags: ['autodocs'],
};


const Template = ( { 
    heading_text,
    intro_text,
    tabs,
 }) =>
    twigTabcordion({
        heading_text,
        intro_text,
        tabs
    });

const tabDefault = (number) => {
    return {
        title: `Tab Number ${number}`,
        content: `<p>Tab ${number} content</p>`
    }
};

export const Default = Template.bind({});
Default.args = {
    heading_text: "Tabcordion heading",
    intro_text: "Tabcordion intro text",
    tabs: [
        tabDefault(1),
        tabDefault(2),
        tabDefault(3)
    ]
};