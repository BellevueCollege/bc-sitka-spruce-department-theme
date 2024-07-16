import AccessibleMenu from './modules/accessible-menu';

(() => {

    /**
     * Add the accessible Main menu.
     */
    const accessibleMainMenu = new AccessibleMenu();
    accessibleMainMenu.add('.main-menu').run();
    accessibleMainMenu.add('.utility-menu').run();
})()