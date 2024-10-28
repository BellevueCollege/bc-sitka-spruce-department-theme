import twigDegreesCertificatesSection from "./degrees-certificates-section.twig";
import '/assets/dist/blocks/degrees-certificates-section/style-index.css';

export default {
    title: "Stories/Degrees and Certificates Section",
    component: "degreesCertificatesSection",
    argTypes: {
    },
    tags: ['autodocs'],
};

const Template = ( {
	title,
	description,
	segments,
}) => {
	return twigDegreesCertificatesSection({
		title,
		description,
		segments,
	});
};



export const Default = Template.bind({});
Default.args = {
	title: "Degrees and Certificates",
	description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
	segments: [
		{
			title: "Degree Options",
			description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
			programs: [
				{
					title: "Degree Program 1",
					url: "#",
					overview: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
					degree: "Associate",
					duration: "120 Credits",
					pathways: [
						{
							title: "BC Pathway 1",
							url: "#"
						},
						{
							title: "BC Pathway 2",
							url: "#"
						}
					],
					focus_areas: [
						{
							title: "Focus Area 1",
							url: "#"
						},
						{
							title: "Focus Area 2",
							url: "#"
						}
					]
				},
				{
					title: "Degree Program 2",
					url: "#",
					overview: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
					degree: "Associate",
					duration: "120 Credits",
					pathways: [
						{
							title: "BC Pathway 1",
							url: "#"
						},
						{
							title: "BC Pathway 2",
							url: "#"
						}
					],
					focus_areas: [
						{
							title: "Focus Area 1",
							url: "#"
						},
						{
							title: "Focus Area 2",
							url: "#"
						}
					]
				}
			]
		},
		{
			title: "Certificate Options",
			description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
			programs: [
				{
					title: "Cert Program 1",
					url: "#",
					overview: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
					degree: "Associate",
					duration: "120 Credits",
					pathways: [
						{
							title: "BC Pathway 1",
							url: "#"
						},
						{
							title: "BC Pathway 2",
							url: "#"
						}
					],
					focus_areas: [
						{
							title: "Focus Area 1",
							url: "#"
						},
						{
							title: "Focus Area 2",
							url: "#"
						}
					]
				}
			]
		},
	]
};
