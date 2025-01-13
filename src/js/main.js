import * as bootstrap from 'bootstrap'
import AccessibleMenu from './modules/accessible-menu';
import ButtonToggle from './modules/button-toggle';
import HeaderState from './modules/header-state';
import Slider from './modules/slider';
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

(() => {


    /**
     * Add the accessible Main menu.
     */
    const accessibleMainMenu = new AccessibleMenu();
    accessibleMainMenu.add('.main-menu').run();

	/**
	 * Add the accessible Sidebar menu
	 */
	const accessibleSidebarMenu = new AccessibleMenu();
	accessibleSidebarMenu.add('.nav-sidebar-menu').run();

	/**
	 * Add Header State Controls (sticky-ish header)
	 */
	const headerState = new HeaderState();
	headerState.add('.header-wrapper').run();

    /**
     * Global Button Toggle controlled by data attrs.
     */
    const globalButtonToggle = new ButtonToggle();
    globalButtonToggle.add('.button-toggle').run();

    /**
     * Close Search button - on click toggles the search toggle
     */
    document.getElementById('search-collapse').addEventListener('click', (event) => {
        event.preventDefault();
        let searchToggle = document.getElementById('site-header--search-toggle-btn');
        searchToggle.focus();
        searchToggle.click();

    });

	// Enable Tooltips
	const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
	const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

	// Enable Post Filter Navigation
	const archiveFilterForm = document.getElementById('post-filter-by-date-form');
	const categoryFilterForm = document.getElementById('post-filter-by-category-form');
	archiveFilterForm.addEventListener('submit', event => {
		event.preventDefault();
		const url = event.target['post-date-filter'].value;
		window.location.assign(url);
	});
	categoryFilterForm.addEventListener('submit', event => {
		event.preventDefault();
		const url = event.target['post-category-filter'].value;
		window.location.assign(url);
	});

	// Enable Sliders
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
					slidesPerView: 2,
				},
				1024: {
					slidesPerView: 3,
				},
			}
		}
	});
	relatedProgramsSlider.add('.related-program-slides').run();

	// Enable Fancybox
	Fancybox.bind('[data-fancybox]', {
		Html: {
			video: {
			autoplay: false,
			},
		},
	});

})();
