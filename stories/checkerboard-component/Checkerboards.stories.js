import twigCheckerboards from "./checkerboards.twig";
import twigCheckerboard from "./checkerboard.twig";

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
    links: "<ul class='link'><li><a href='#' class='link-arrow'>Learn more</a></li><li><a href='#' class='link-arrow'>Another Link</a></li></ul>"
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
