import * as bootstrap from 'bootstrap'
import AccessibleMenu from './modules/accessible-menu';
import ButtonToggle from './modules/button-toggle';

(() => {

    /**
     * Add the accessible Main menu.
     */
    const accessibleMainMenu = new AccessibleMenu();
    accessibleMainMenu.add('.main-menu').run();
    //accessibleMainMenu.add('.utility-menu').run();

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
})()
