import twigCardBootstrap from "./card-bootstrap.twig";
import '/assets/dist/css/blocks/card.css';

export default {
    title: "Stories/Card (Bootstrap)",
    component: "card-bootstrap",
    tags: ['autodocs'],
    argTypes: {
        card_classes: {
            control: "array",
            description: "Array of classes to apply to the card (optional)"
        },
        card_style: {
            value: "max-width: 18rem",
            control: {
                type:"text",
            },
            description: "Inline styles added to the card",
        },
        media: {
            description: "Media content for the card, as an object with `src`, `classes`, and `alt` properties"
        },
        card_header: { description: "Header content for the card (optional)" },
		card_title_tag: {
			control: "select",
			options: [ "h2", "h3", "h4", "h5", "h6"],
			description: "Tag for the card title",
		},
		card_title: { description: "Title for the card (optional)" },
        card_content: { description: "Content for the card (required)" },
        card_footer: { description: "Footer content for the card (optional)" },
    }
};

const Template = ( {
    card_classes,
    card_style,
    media,
    card_header,
	card_title_tag,
	card_title,
    card_content,
    card_footer,
}) =>
    twigCardBootstrap({
        card_classes,
        card_style,
        media,
        card_header,
		card_title_tag,
		card_title,
        card_content,
        card_footer,
    });

export const Default = Template.bind({});
Default.args = {
    card_classes: [],
    card_style: "max-width: 18rem",
    media: {
        src: "https://picsum.photos/id/28/600/200",
        classes: [],
        alt: "Placeholder Image",
    },
    card_header: "Sample Card Header Text",
	card_title_tag: "h3",
	card_title: "Sample Card Title Text",
    card_content: "Sample Card Content Text",
    card_footer: "Sample Card Footer Text",
}


export const SitkaStyle = Template.bind({});
SitkaStyle.args = {
    ...Default.args,
	media: {
        src: "https://picsum.photos/id/28/360/200",
        classes: [],
        alt: "Placeholder Image",
    },
    card_classes: ["card-sitka"],
	card_header: null,
	card_title: "<a href='#'>Sample Card Title Text</a>",
	card_footer: null,
}

export const NoMedia = Template.bind({});
NoMedia.args = {
    ...Default.args,
    media: null,
}

export const BodyOnly = Template.bind({});
BodyOnly.args = {
    card_content: "Sample Card Content Text",
    card_style: "max-width: 18rem",
}

export const PrimaryColor = Template.bind({});
PrimaryColor.args = {
    ...Default.args,
    card_classes: ["bg-primary", "text-white"],
}

export const SecondaryColor = Template.bind({});
SecondaryColor.args = {
    ...Default.args,
    card_classes: ["bg-secondary", "text-white"],
}

export const SuccessColor = Template.bind({});
SuccessColor.args = {
    ...Default.args,
    card_classes: ["bg-success", "text-white"],
}

export const WarningColor = Template.bind({});
WarningColor.args = {
    ...Default.args,
    card_classes: ["bg-warning", "text-dark"],
}

export const DangerColor = Template.bind({});
DangerColor.args = {
    ...Default.args,
    card_classes: ["bg-danger", "text-white"],
}

export const InfoColor = Template.bind({});
InfoColor.args = {
    ...Default.args,
    card_classes: ["bg-info", "text-dark"],
}

export const LightColor = Template.bind({});
LightColor.args = {
    ...Default.args,
    card_classes: ["bg-light", "text-dark"],
}

export const DarkColor = Template.bind({});
DarkColor.args = {
    ...Default.args,
    card_classes: ["bg-dark", "text-white"],
}
