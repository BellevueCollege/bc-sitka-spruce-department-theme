import twigProfilesSection from "./profiles-section.twig";
import '/assets/dist/blocks/profiles-section/style-index.css';

export default {
    title: "Stories/Profiles Section",
    component: "profilesSection",
    tags: ['autodocs'],
};



const Template = ( {
	title,
	description,
    cta_button,
    sections, 
    profile_url,
 }) =>
    twigProfilesSection({
		title,
		description,
        cta_button,
        sections,
        profile_url,
    });

export const Default = Template.bind({});
Default.args = {
	title: 'Featured Profiles Section',
    cta_button:{
        url: 'https://google.com',
        title: 'Get Started',
    },
    sections: [
        {
            title: 'Section Title (i.e. Leadership)',
            profiles: [
                {
                    profile_image: '<img class="rounded-top img-fluid" src="https://picsum.photos/id/69/200/200" alt="Placeholder Image"></img>',
                    first_name: "John",
                    last_name: "Doe",
                    pronouns: "he/him",
                    position: "Manager",
                },
                {
                    profile_image:'<img class="rounded-top img-fluid" src="https://picsum.photos/id/237/200/200" alt="Placeholder Image"></img>',
                    first_name: "Jane",
                    last_name: "Doe",
                    profile_url: "https://google.com",
                    pronouns: "she/her",
                    position: "Team Lead",
                },
            ]
        },
        {
            title: 'Section Title (i.e. Servants to the man)',
            profiles: [
                {
                    profile_image: '<img class="rounded-top  img-fluid" src="https://picsum.photos/id/69/200/200" alt="Placeholder Image"></img>',
                    first_name: "Boxer",
                    last_name: "Doe",
                    pronouns: "they/them",
                    position: "Assistant Manager",
                },
                {
                    profile_image: null,
                    first_name: "Jane",
                    last_name: "Doe",
                    profile_url: "https://google.com",
                    position: "Team Lead",
                },
            ]
        }
    ]
};
