import bcHeader from "./header.twig";
import logo from "/assets/img/logo-header.svg";



// Sample menu output from WordPress
const menu = `<ul class="menu"><li class="menu-item menu-item-type-custom menu-item-object-custom menu-item-145 ">
<a href="#" target="_self">Menu Item 1</a>
</li>
<li class="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children menu-item-146 ">
<a href="#" target="_self">Menu Item 2</a>
<ul class="menu">
<li class="menu-item menu-item-type-custom menu-item-object-custom menu-item-148 ">
<a href="#" target="_self">Submenu Item 1</a>
</li>
<li class="menu-item menu-item-type-custom menu-item-object-custom menu-item-149 ">
<a href="#" target="_self">Submenu Item 2</a>
</li>
<li class="menu-item menu-item-type-custom menu-item-object-custom menu-item-147 ">
<a href="#" target="_self">Submenu Item 3</a>
</li>
</ul>
</li>
<li class="menu-item menu-item-type-custom menu-item-object-custom menu-item-150 ">
<a href="#" target="_self">Menu Item 3</a>
</li>
</ul>`;

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
    menu: menu
};
