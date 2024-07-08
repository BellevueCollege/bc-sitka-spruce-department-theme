import twigDifferentiators from "./differentiators.twig";
import twigDifferentiatorGroup from "./differentiator-group.twig";
import twigDifferentiator from "./differentiator.twig";

import { differentiatorIcon, differentiatorText, differentiatorImage } from "./differentiator.data.js";

export default {
    title: "Stories/Differentiators",
    component: twigDifferentiators,
    tags: ['autodocs'],
};


const TemplateDifferentiators = ({ content }) => twigDifferentiators({ content });
const TemplateDifferentiatorGroup = ({ content }) => twigDifferentiatorGroup({ content });
const TemplateDifferentiator = ( { 
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



export const Default = TemplateDifferentiators.bind({});
Default.args = {
    content: twigDifferentiatorGroup({ 
        content: [ 
            twigDifferentiator({ ...differentiatorText }),
            twigDifferentiator({ ...differentiatorIcon }),
            twigDifferentiator({ ...differentiatorImage })
        ].join()
    })
};

export const DifferentiatorGroupContainer = TemplateDifferentiatorGroup.bind({});
DifferentiatorGroupContainer.args = {
    content: [ 
        twigDifferentiator({ ...differentiatorText }),
        twigDifferentiator({ ...differentiatorIcon }),
        twigDifferentiator({ ...differentiatorImage })
    ].join()
};