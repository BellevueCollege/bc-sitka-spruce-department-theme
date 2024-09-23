import twigMediaGallery from "./media-gallery.twig";
import '/assets/dist/blocks/media-gallery-section/style-index.css';

export default {
    title: "Stories/Media Gallery",
    component: "media-gallery",
    tags: ['autodocs'],
};


const Template = ( {
    title,
    description,
    slides
}) =>
    twigMediaGallery({
        title,
        description,
        slides
    });

export const Default = Template.bind({});
Default.args = {
    title: "Heading",
    description: "Description",
	slides: [
		{
			image: '<img src="https://picsum.photos/id/28/600/550" alt="Placeholder Image" class="img-fluid rounded">',
			video_url: null,
			title: "Sample Title",
			description: "Sample Description",
		},
		{
			image: '<img src="https://picsum.photos/id/29/600/550" alt="Placeholder Image" class="img-fluid rounded">',
			video_url: null,
			title: "Sample Title",
			description: "Sample Description",
		},
	]
};
