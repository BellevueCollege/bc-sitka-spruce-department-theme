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
})()