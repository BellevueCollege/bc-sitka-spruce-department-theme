import twigMediaGallery from "./media-gallery.twig";
import '/assets/dist/blocks/media-gallery-section/style-index.css';

import Slider from '/src/js/modules/slider';
import BCLightboxModal from 'bc-lightbox-modal';


// Note: the media gallery slider is not loading fully, which is causing formatting issues
const mediaGallerySlider = new Slider({
	sliderOpts: {
		slidesPerView: 1.05,
		watchSlidesProgress: true,
		spaceBetween: 40,
		centeredSlides: false,
		loop: false,
		navigation: {
			nextEl: '.slider-navigation__next',
			prevEl: '.slider-navigation__prev',
		},
		breakpoints: {
			1024: {
				slidesPerView: 1.2,
			},
		}
	}
});
mediaGallerySlider.add('.media-gallery-wrapper').run();

// Enable Fancybox
const bcLightboxModal = new BCLightboxModal('bc-lightbox-modal','[data-fancybox]');

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
			video_url: 'https://www.youtube.com/watch?v=gmpksk8booo',
			slide_title: "Sample Title",
			slide_description: "Sample Description",
		},
		{
			image: '<img src="https://picsum.photos/id/29/600/550" alt="Placeholder Image" class="img-fluid rounded">',
			video_url: null,
			slide_title: "Sample Title",
			slide_description: "Sample Description",
		},
	]
};
