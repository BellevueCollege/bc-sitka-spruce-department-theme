import twigTabsVariant from "./variant-tabs.twig";
import { Default as Tabcordion } from "./Tabcordion.stories";

export default {
    title: "Stories/Tabcordion/Variant: Tabs",
    component: "tabcordion-tabs",
};

const Template = ( {
    heading_text,
    intro_text,
    tabs,
    eyebrow,
    link,
}) =>
    twigTabsVariant({
        heading_text,
        intro_text,
        tabs,
        eyebrow,
        link,
    });


const tabDefault = (number) => {
    return {
        title: `Tab Number ${number}`,
        heading: `Tab Number ${number} Heading`,
        content: `<p>Tab ${number} content</p>`,
        text: `<p>Tab ${number} text</p>`,
        links: `<ul class='btn-row'><li><a class="btn btn-light" href='#'>Tab ${number} link 1</a></li><li><a class="btn btn-light" href='#'>Tab ${number} link 2</a></li></ul>`,
    }
};


export const TabsVariant = Template.bind({});
TabsVariant.args = {
    ...Tabcordion.args,
    intro_text: "<p>Tabcordion intro text</p>",
    eyebrow: 'Tabs Variant',
    link: '<a href="#" class="link-arrow">View All</a>',
    tabs: [
        tabDefault(1),
        tabDefault(2),
        tabDefault(3)
    ]
}
