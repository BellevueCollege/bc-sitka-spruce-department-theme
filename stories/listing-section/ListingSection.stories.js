import twigListingSection from './listing-section.twig';
import twigListItem from './list-item.twig';
import twigListItemLinks from './list-item-links.twig';
import '/assets/dist/blocks/listing-section/style-index.css';
export default {
	title: 'Stories/Listing Section',
	component: 'listing-section',
	tags: ['autodocs'],
};

const Template = ({ title, description, list_items }) =>
	twigListingSection({
		title,
		description,
		list_items,
	});

export const Default = Template.bind({});
Default.args = {
	title: 'Listing Section',
	description:
		'Optional description of this section. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.',
	list_items: [
		twigListItem({
			title: 'Item 1',
			content: [
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.',
				twigListItemLinks({
					links: [
						{
							title: 'Link 1',
							url: '#',
						},
						{
							title: 'Link 2',
							url: '#',
						},
						{
							title: 'Link 3',
							url: '#',
						},
					],
					button: {
						title: 'Button 1',
						url: '#',
					},
				})
			].join(''),
			image: '<img src="https://placehold.co/360x240" class="img-fluid rounded" alt="Placeholder Image">',
		}),
		twigListItem({
			title: 'Item 2',
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.',
				content: [
					'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.',
					twigListItemLinks({
						links: [
							{
								title: 'Link 1',
								url: '#',
							},
							{
								title: 'Link 2',
								url: '#',
							},
							{
								title: 'Link 3',
								url: '#',
							},
						]
					})
				].join(''),
			image: '<img src="https://placehold.co/360x240" class="img-fluid rounded" alt="Placeholder Image">',
		}),
	].join(''),
};
