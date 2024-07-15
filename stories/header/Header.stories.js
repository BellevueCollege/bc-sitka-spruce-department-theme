import bcHeader from "./header.twig";
import logo from "/assets/img/logo-header.svg";

export default {
    title: "Stories/Header",
    component: "header",
    tags: ['autodocs'],
};


const Template = ( { 
    core_homepage_url,
    site_homepage_url,
    site_title,
    logo_url,
    search_expanded,
    menu_expanded,
    menu
 }) =>
    bcHeader({
        core_homepage_url,
        site_homepage_url,
        site_title,
        logo_url,
        search_expanded,
        menu_expanded,
        menu
    });

export const Default = Template.bind({});
Default.args = {
    core_homepage_url: "#",
    site_homepage_url: "#",
    site_title: "Sample Site",
    logo_url: logo,
    search_expanded: false,
    menu_expanded: false,
    menu: ''
};
