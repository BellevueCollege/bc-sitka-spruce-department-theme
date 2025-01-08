import twigPlayButton from "./play-button.twig";

export default {
    title: "Stories/Atoms/Play Button",
    component: "play-button",
};


const Template = ( { }) =>
twigPlayButton({
    });

export const Default = Template.bind({});
Default.args = {
};