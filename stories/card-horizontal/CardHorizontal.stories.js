import twigCard from "./card-horizontal.twig";

export default {
    title: "Stories/Cards/Horizontal Card (Bellevue 2022)",
    component: "card-horizontal",
    tags: ['autodocs'],
    argTypes: {
        card_classes: {
            control: "array",
            description: "Array of classes to apply to the card (optional)"
        },
        aspect_ratio: {
            value: .72,
            control: {
                type:"number",
                min: .01,
                max: 100,
                step: .01,
            },
            description: "Aspect ratio of the card, as a decimal number",
        },
        media: { description: "Media content for the card, as an HTML `<img>` tag." },
        media_caption: { description: "Caption for the media content (optional)." },
        card_content: { description: "Content for the card." },

    }
};

const Template = ( {
    card_classes,
    aspect_ratio,
    media,
    media_caption,
    card_content

}) =>
    twigCard({
        card_classes,
        aspect_ratio,
        media,
        media_caption,
        card_content
    });

export const Default = Template.bind({});
Default.args = {
    card_classes: [],
    aspect_ratio: .72,
    media: '<img src="https://picsum.photos/id/22/660/500" alt="Placeholder Image" class="img-fluid rounded">',
    media_caption: "",
    card_content: "Sample Card Content",
}
