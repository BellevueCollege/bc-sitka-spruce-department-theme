import announcementBanner from "./announcement-banner.twig";
import '/assets/dist/blocks/announcement-banner/style-index.css';

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
    image: '<img class="rounded img-fluid" src="https://picsum.photos/id/18/260/174" alt="Placeholder Image"></img>',
    links:[
        {
            title:"Learn more",
            url: "#",
        },
        {
            title:"Learn more",
            url: "#",
        },
        {
            title:"Learn more",
            url: "#",
        }
    ],

    button: {
        title: "Click Me",
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
