import twig from "./variant-focus-areas-feature.twig";
import { Default as Tabcordion } from "./Tabcordion.stories";

export default {
    title: "Stories/Tabcordion/Variant: Focus Areas Feature",
    component: "tabcordion-focus-areas-feature",
};

const Template = ( {
    heading_text,
    intro_text,
    tabs,
}) =>
    twig({
        heading_text,
        intro_text,
        tabs,
    });


const tabDefault = (number) => {
    return {
        title: `Tab Number ${number}`,
        content: `<p>Tab ${number} content</p>`,
        programs: [
            programDefault(1),
            programDefault(2),
            programDefault(3),
            programDefault(4),
        ]
    }
};

const programDefault = (number) => {
    return {
        title: `Program Number ${number}`,
        link: `#`,
        type: `Associate Degree`,
    }
}


export const TabsVariant = Template.bind({});
TabsVariant.args = {
    heading_text: "Explore Focus Areas",
    intro_text: "<p>Learn more about the different focus areas in each pathway.</p>",
    tabs: [
        tabDefault(1),
        tabDefault(2),
        tabDefault(3)
    ],
}
