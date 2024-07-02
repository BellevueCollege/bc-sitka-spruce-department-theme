import twigDifferentiators from "./differentiators.twig";
import { differentiatorIcon, differentiatorText, differentiatorImage } from "./differentiator.data.js";

export default {
    title: "Stories/Differentiators",
    component: "differentiators",
    tags: ['autodocs'],
};


const Template = ( { 
    heading,
    subheading,
    link,
    differentiators
 }) =>
    twigDifferentiators({
        heading,
        subheading,
        link,
        differentiators
    });

export const Default = Template.bind({});
Default.args = {
    heading: 'What Makes Us Different',
    subheading: '<p>Bellevue College is an exciting place to go to school</p>',
    link: '<a href="https://www.bellevuecollege.edu" class="link-arrow">Bellevue College</a>',
    differentiators: [
        differentiatorIcon,
        differentiatorText,
        differentiatorImage
    ]
};