import twigTabcordion from "./tabcordion-top-tabs.twig";

import '/assets/dist/css/blocks/nav.css';
import '/assets/dist/css/blocks/card.css';
import '/assets/dist/css/blocks/accordion.css';
import '/assets/dist/css/blocks/tabs.css';

export default {
    title: "Stories/Tabcordion Top Tabs",
    component: "tabcordion-top-tabs",
    parameters: {
        backgrounds: {
            default: 'bc-blue',
            values: [

            ]
        }
    },
    tags: ['autodocs'],
};


const Template = ( {
    tabs,
 }) =>
    twigTabcordion({
        tabs
    });

const tabDefault = (number) => {
    return {
        title: `Tab Number ${number}`,
        content: `<div class="container-xl">
				<h3>Tab ${number} Title</h3>
				<p>Tab ${number} Content</p>
			</div>
			<div class="container-xl">
				<h3>Tab ${number} Title 2</h3>
				<p>Tab ${number} Content 2</p>
			</div>`
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
