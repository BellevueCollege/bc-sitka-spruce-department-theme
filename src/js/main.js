import {
	bootstrap,
	initTooltips,
	setWindowBootstrap,
	AccessibleMenu,
	ButtonToggle,
	HeaderState,
	Slider,
	UntilFoundCollapse,
	UntilFoundTab,
} from 'bc-theme-layer-bs5/js';
import BCLightboxModal from 'bc-lightbox-modal';

(() => {
	setWindowBootstrap();

	  /**
	 * Teleport the nav offcanvas to <body> on open to escape ancestor stacking
	 * contexts that would otherwise cause it to render behind the admin bar.
	 * The placeholder comment node restores it to its original DOM position
	 * on close, keeping the lg+ inline nav rendering intact.
	 */
	const offcanvasEl = document.getElementById('site-header--offcanvas');
	if (offcanvasEl) {
		let placeholder = null;

		offcanvasEl.addEventListener('show.bs.offcanvas', () => {
		placeholder = document.createComment('offcanvas-placeholder');
		offcanvasEl.before(placeholder);
		document.body.appendChild(offcanvasEl);
		});

		offcanvasEl.addEventListener('hidden.bs.offcanvas', () => {
		if (placeholder) {
			placeholder.replaceWith(offcanvasEl);
			placeholder = null;
		}
		});
	}

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
	 * Find-in-page search via hidden=until-found on collapsed panels and inactive tab panes.
	 */
	const untilFoundCollapse = new UntilFoundCollapse();
	untilFoundCollapse.add('.accordion-collapse.collapse').run();

	const untilFoundTabs = new UntilFoundTab();
	untilFoundTabs.add('.tab-content > .tab-pane').run();

    /**
     * Close Search button - on click toggles the search toggle
     */
    document.getElementById('search-collapse').addEventListener('click', (event) => {
        event.preventDefault();
        let searchToggle = document.getElementById('site-header--search-toggle-btn');
        searchToggle.focus();
        searchToggle.click();

    });

	initTooltips();

	// Enable Post Filter Navigation
	const archiveFilterForm = document.getElementById('post-filter-by-date-form');
	const categoryFilterForm = document.getElementById('post-filter-by-category-form');
	if ( archiveFilterForm ) {
		archiveFilterForm.addEventListener('submit', event => {
			event.preventDefault();
			const url = event.target['post-date-filter'].value;
			window.location.assign(url);
		});
	};
	if ( categoryFilterForm ) {
		categoryFilterForm.addEventListener('submit', event => {
			event.preventDefault();
			const url = event.target['post-category-filter'].value;
			window.location.assign(url);
		});
	};

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
			loop: true,
			loopAddBlankSlides: true,
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

	const bcLightboxModal = new BCLightboxModal(bootstrap, 'bc-lightbox-modal', '[data-fancybox]');



})();
