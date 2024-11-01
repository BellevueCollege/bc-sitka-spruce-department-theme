import twigCheckerboards from "./checkerboards.twig";
import twigCheckerboard from "./checkerboard.twig";
import '/assets/dist/blocks/checkerboard-section/style-index.css';

export default {
    title: "Stories/Checkerboards",
    component: "checkerboards",
    tags: ['autodocs'],
};


const CheckerboardsTemplate = ( { checkerboards }) =>
    twigCheckerboards({ checkerboards });

const CheckerboardTemplate = ( {
    video,
    image,
    caption,
    title,
    text,
    links,
}) =>
    twigCheckerboard({
        video,
        image,
        caption,
        title,
        text,
        links
    });


const SingleCheckerboardImage = {
    video: null,
    image: '<img src="https://picsum.photos/id/35/660/500" alt="Placeholder Image" class="rounded">',
    caption: 'Placeholder Image Caption',
    title: 'Checkerboard Title',
    text: '<p>This is some text.</p>',
	links: [
		{
			title: 'Learn more',
			url: '#',
			target: '_blank',
		},
		{
			title: 'Learn more',
			url: '#',
			target: '_blank',
		}
	]
};

const SingleCheckerboardVideo = {
    ... SingleCheckerboardImage,
    video: 'https://vimeo.com/839193686',
}

export const Default = CheckerboardsTemplate.bind({});
Default.args = {
    checkerboards: [
        SingleCheckerboardImage,
        SingleCheckerboardVideo,
        SingleCheckerboardImage
    ]
};

export const SingleCheckerboardWithVideo = CheckerboardTemplate.bind({});
SingleCheckerboardWithVideo.args = SingleCheckerboardVideo;

export const SingleCheckerboardWithImage = CheckerboardTemplate.bind({});
SingleCheckerboardWithImage.args = SingleCheckerboardImage;
