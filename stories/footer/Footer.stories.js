import bcFooter from "./footer.twig";
import logo from "/assets/img/logo-header.svg";
import mountains from "/assets/img/footer-mountains.svg";



// Sample menu output from WordPress
const menu = `<ul class="menu">
<li class="menu-item menu-item-type-custom menu-item-object-custom menu-item-145 ">
<a href="#" target="_self">Menu Item 1</a>
</li>
<li class="menu-item menu-item-type-custom menu-item-object-custom menu-item-146 ">
<a href="#" target="_self">Menu Item 2</a>
</li>
<li class="menu-item menu-item-type-custom menu-item-object-custom menu-item-150 ">
<a href="#" target="_self">Submenu Item 3</a>

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
			icon: "<i class='fab fa-facebook-f' aria-hidden='true'></i>",
			link: {
				url: "#",
				title: "Facebook"
			}
		},
		{
			icon: "<i class='fab fa-twitter' aria-hidden='true'></i>",
			link: {
				url: "#",
				title: "Twitter"
			}
		},
		{
			icon: "<i class='fab fa-instagram' aria-hidden='true'></i>",
			link: {
				url: "#",
				title: "Instagram"
			}
		},
		{
			icon: "<i class='fab fa-linkedin-in' aria-hidden='true'></i>",
			link: {
				url: "#",
				title: "LinkedIn"
			}
		}
	],
	current_year: new Date().getFullYear()
};
