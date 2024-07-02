import announcementBanner from "./announcement-banner.twig";

export default {
    title: "Stories/Announcement Banner",
    component: "announcement-banner",
    tags: ['autodocs'],
};


const Template = ( { 
    title,
    description,
    button,
    links,
    image
}) => 
    announcementBanner({
        title,
        description,
        button,
        links,
        image
    });

export const Default = Template.bind({});
Default.args = {
    title: "Heading",
    description: "Description",
    image: '<img src="https://picsum.photos/id/18/260/174" alt="Placeholder Image"></img>',
    links:[
        {
            text:"Learn more",
            url: "#",
        },
        {
            text:"Learn more",
            url: "#",
        },
        {
            text:"Learn more",
            url: "#",
        }
    ],
    
    button: {
        text: "Click Me",
        url: "#",
    }
};

export const NoImage = Template.bind({});
NoImage.args = {
    ...Default.args,
    image: null
}

export const NoButton = Template.bind({});
NoButton.args = {
    ...Default.args,
    button: null
}

export const NoLinks = Template.bind({});
NoLinks.args = {
    ...Default.args,
    links: null
}