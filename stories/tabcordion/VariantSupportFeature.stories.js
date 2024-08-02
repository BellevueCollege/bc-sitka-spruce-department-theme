import twig from "./variant-support-feature.twig";
import { Default as Tabcordion } from "./Tabcordion.stories";

export default {
    title: "Stories/Tabcordion/Variant: Support Feature",
    component: "tabcordion-support-feature",
};

const Template = ( {
    heading_text,
    tabs,
}) =>
    twig({
        heading_text,
        tabs,
    });


const tabDefault = (number) => {
    return {
        image: '<img src="https://picsum.photos/id/110/560/320" alt="Placeholder Image">',
        title: `Tab Number ${number}`,
        heading: `Tab Number ${number} Heading`,
        content: `<p>Tab ${number} content</p>`,
        links: `<ul class='btn-row'><li><a class="btn btn-light" href='#'>Tab ${number} link 1</a></li><li><a class="btn btn-light" href='#'>Tab ${number} link 2</a></li></ul>`,
    }
};


export const TabsVariant = Template.bind({});
TabsVariant.args = {
    heading_text: 'Regardless of where you\'re coming from, we\'re here for you.',
    tabs: [
        tabDefault(1),
        tabDefault(2),
        tabDefault(3)
    ]
}
