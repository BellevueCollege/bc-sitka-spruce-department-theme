import twigRelatedPrograms from "./related-programs.twig";

import { Slider } from 'bc-theme-layer-bs5/js';


// Note: the media gallery slider is not loading fully, which is causing formatting issues
const relatedProgramsSlider = new Slider({
	sliderOpts: {
		slidesPerView: 1.125,
		watchSlidesProgress: true,
		spaceBetween: 40,
		centeredSlides: false,
		loop: false,
		navigation: {
			nextEl: '.slider-navigation__next',
			prevEl: '.slider-navigation__prev',
		},
		breakpoints: {
			640: {
				slidesPerView: 2.25,
			},
			1024: {
				slidesPerView: 3,
			},
		}
	}
});
relatedProgramsSlider.add('.related-program-slides').run();


export default {
    title: "Stories/Related Programs",
    component: "related-programs",
    tags: ['autodocs'],
};


const Template = ( {
    programs
}) =>
    twigRelatedPrograms({
        programs
    });

export const Default = Template.bind({});
Default.args = {
	programs: [
		{
			pathway_names: ["BC Pathway 1", "BC Pathway 2", "BC Pathway 3"],
			short_name: "Program 1",
			url: "#",
			type: "Associate Degree",
			overview: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>",
		},
		{
			pathway_names: ["BC Pathway 1", "BC Pathway 2", "BC Pathway 3"],
			short_name: "Program 2",
			url: "#",
			type: "Associate Degree",
			overview: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>",
		},
		{
			pathway_names: ["BC Pathway 1", "BC Pathway 2", "BC Pathway 3"],
			short_name: "Program 3",
			url: "#",
			type: "Associate Degree",
			overview: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>",
		},
		{
			pathway_names: ["BC Pathway 1", "BC Pathway 2", "BC Pathway 3"],
			short_name: "Program 4",
			url: "#",
			type: "Associate Degree",
			overview: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>",
		},
		{
			pathway_names: ["BC Pathway 1", "BC Pathway 2", "BC Pathway 3"],
			short_name: "Program 5",
			url: "#",
			type: "Associate Degree",
			overview: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>",
		},
	],
};
