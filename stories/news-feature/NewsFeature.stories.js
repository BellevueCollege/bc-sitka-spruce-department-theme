import twigNewsFeature from "./news-feature.twig";

export default {
    title: "Stories/News Feature",
    component: "news-feature",
    tags: ['autodocs'],
};

import '/assets/dist/blocks/news-feature-core/style-index.css';


const Template = ( {
    eyebrow,
    heading,
    subheading,
    link,
    featured_news,
    news_listing
 }) =>
    twigNewsFeature({
        eyebrow,
        heading,
        subheading,
        link,
        featured_news,
        news_listing
    });

const news_story = {
    link: '#',
    title: 'Bellevue College Receives $0.0 Million Grant',
    summary: 'BC was chosen to receive $0.0 million grant from the National Science Foundation (not the one you are thinking of!).'
};

export const Default = Template.bind({});
Default.args = {
    eyebrow: 'Keep Up to Date',
    heading: 'Bellevue College News',
    subheading: '<p>Get the latest news from the college</p>',
    link: '<a href="#" class="link-arrow">View All</a>',
    featured_news: {
        image: '<img src="https://picsum.photos/id/120/760/400" alt="placeholder image" />',
        link: '#',
        title: 'Bellevue College Receives $0.0 Million Grant',
        summary: 'BC was chosen to receive $0.0 million grant from the National Science Foundation (not the one you are thinking of!).',
		image_orientation: 'horizontal'
	},
    news_listing: [
        news_story,
        news_story,
        news_story
    ]
};

export const NoFeaturedNews = Template.bind({});
NoFeaturedNews.args = {
	...Default.args,
	featured_news: null,
};

export const NoNewsListing = Template.bind({});
NoNewsListing.args = {
	...Default.args,
	news_listing: null,
};

export const VerticalFeaturedNews = Template.bind({});
VerticalFeaturedNews.args = {
	...Default.args,
	featured_news: {
		...Default.args.featured_news,
		image: '<img src="https://picsum.photos/id/120/460/700" alt="placeholder image" />',
		image_orientation: 'vertical'
	},
};
