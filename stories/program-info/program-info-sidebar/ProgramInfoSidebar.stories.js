import programInfoSidebar from "./program-info-sidebar.twig";
import '/assets/dist/blocks/template-program-info/style-index.css';



export default {
    title: "Stories/Program Info/Program Information Sidebar",
    component: "programInfoSidebar",
    tags: ['autodocs'],
};


const Template = ( {
    type,
	degree,
	duration,
	prerequisites,
	pathway_names,
	pathways,
	focus_areas,
 }) =>
    programInfoSidebar({
		type,
		degree,
		duration,
		prerequisites,
		pathway_names,
		pathways,
		focus_areas
    });

export const Default = Template.bind({});
Default.args = {
    type: "Associate Degree",
	degree: "Associate of Arts",
	duration: "128 Credits",
	prerequisites: "<p>Review prerequisites in the <a href='#'>Course Catalog</a></p>",
	pathway_names: ["BC Pathway 1", "BC Pathway 2", "BC Pathway 3"],
	pathways: [
		{
			title: "BC Pathway 1",
			url: "#"
		},
		{
			title: "BC Pathway 2",
			url: "#"
		},
		{
			title: "BC Pathway 3",
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
		},
		{
			title: "Focus Area 3",
			url: "#"
		}
	]
};
