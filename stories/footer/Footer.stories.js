import bcFooter from "./footer.twig";
import logo from "/assets/img/logo-header.svg";
import mountains from "/assets/img/footer-mountains.svg";



// Sample menu output from WordPress
const menu = `<ul class="menu">
<li class="menu-item menu-item-type-custom menu-item-object-custom menu-item-145 ">
<a href="#" target="_self" class="link-arrow">Menu Item 1</a>
</li>
<li class="menu-item menu-item-type-custom menu-item-object-custom menu-item-146 ">
<a href="#" target="_self" class="link-arrow">Menu Item 2</a>
</li>
<li class="menu-item menu-item-type-custom menu-item-object-custom menu-item-150 ">
<a href="#" target="_self" class="link-arrow">Submenu Item 3</a>
</li>
</ul>`;

export default {
    title: "Stories/Footer",
    component: "header",
    tags: ['autodocs'],
};


const Template = ( {
    core_homepage_url,
    site_homepage_url,
    site_title,
    logo_url,
	mountains_url,
    menu,
	address,
	phone,
	social,
	current_year
 }) =>
    bcFooter({
		core_homepage_url,
		site_homepage_url,
		site_title,
		logo_url,
		mountains_url,
		menu,
		address,
		phone,
		social,
		current_year
    });

export const Default = Template.bind({});
Default.args = {
	core_homepage_url: "#",
	site_homepage_url: "#",
	site_title: "Sample Site",
	logo_url: logo,
	mountains_url: mountains,
	menu: menu,
	address: "Bellevue College<br>123 Main Street<br>Bellevue, WA 98004",
	phone: "555-555-5555",
	social: [
		{
			network: "facebook",
			url: "https://www.facebook.com/",
		},
		{
			network: "x",
			url: "https://x.com/",
		},
		{
			network: "linkedin",
			url: "https://www.linkedin.com/",
		},
		{
			network: "youtube",
			url: "https://www.youtube.com/",
		},
		{
			network: "instagram",
			url: "https://www.instagram.com/",
		},
	],
	current_year: new Date().getFullYear()
};
