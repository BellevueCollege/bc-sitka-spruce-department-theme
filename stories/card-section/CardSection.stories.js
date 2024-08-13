import twigCardSection from "./card-section.twig";
import '/assets/dist/blocks/card-section/style-index.css';

export default {
    title: "Stories/Card Section",
    component: "card-section",
    tags: ['autodocs'],

};


const Template = ( {
	wrapper_attrs,
    title,
    description,
    cards
 }) =>
    twigCardSection({
		wrapper_attrs,
		title,
		description,
		cards
    });

const cards = `
	<div class="card card-section-card">
		<img class="card-img-top" src="https://via.placeholder.com/360x218" alt="Card image cap">
		<div class="card-body">
			<h3 class="card-title">Card title</h3>
			<p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
		</div>
	</div>
	<div class="card card-section-card">
		<img class="card-img-top" src="https://via.placeholder.com/360x218" alt="Card image cap">
		<div class="card-body">
			<h3 class="card-title">Card title</h3>
			<p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
		</div>
	</div>
	<div class="card card-section-card">
		<img class="card-img-top" src="https://via.placeholder.com/360x218" alt="Card image cap">
		<div class="card-body">
			<h3 class="card-title">Card title</h3>
			<p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
		</div>
	</div>
`;

export const Default = Template.bind({});
Default.args = {
	wrapper_attrs: 'class="section card-section alignfull"',
    title: 'Section Heading',
    description: '<p>Subheading for this section</p>',
	cards: cards
};
