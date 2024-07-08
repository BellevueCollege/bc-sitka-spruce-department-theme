import twigDifferentiator from "./differentiator.twig";
import { differentiatorIcon, differentiatorText, differentiatorImage } from "./differentiator.data.js";

export default {
    title: "Stories/Differentiators/Differentiator (Single)",
    component: "differentiator",
    tags: ['autodocs'],
    argTypes: {
        top_layout: {
            control: 'select',
            options: ['text', 'icon', 'image'],
            description: 'Which type of differentiator?',
        },
    }
};


const Template = ( { 
    top_layout,
    top_text,
    top_superscript,
    top_icon,
    top_image,
    title,
    text,
    link
 }) =>
    twigDifferentiator({
        top_layout,
        top_text,
        top_superscript,
        top_icon,
        top_image,
        title,
        text,
        link
    });


export const Default = Template.bind({});
Default.args = {
    ...differentiatorText
};

export const DifferentiatorIcon = Template.bind({});
DifferentiatorIcon.args = {
    ...differentiatorIcon
};

export const DifferentiatorImage = Template.bind({});
DifferentiatorImage.args = {
    ...differentiatorImage
};

export const DifferentiatorText = Template.bind({});
DifferentiatorText.args = {
    ...differentiatorText
}