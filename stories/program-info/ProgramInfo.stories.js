import programInfo from "./program-info.twig";
import '/assets/dist/blocks/template-program-info/style-index.css';


export default {
    title: "Stories/Program Info",
    component: "programInfo",
    tags: ['autodocs'],
};


const Template = ( {
	overview,
	content,
	type,
	degree,
	duration,
	prerequisite,
	pathway_names,
	pathways,
	focus_areas
 }) =>
    programInfo({
		overview,
		content,
		type,
		degree,
		duration,
		prerequisite,
		pathway_names,
		pathways,
		focus_areas
    });

export const Default = Template.bind({});
Default.args = {
	overview: "<p>Neurodiagnostic technologists perform tests that diagnose problems with the brain and nervous system. They work with doctors who interpret the data and with patients and families in hospital and clinical settings. The work includes electroencephalography and sleep disorder studies, as well as intraoperative and long-term epilepsy monitoring. Learn to calibrate and maintain sophisticated equipment, prepare patients, and be part of a healthcare team in this rewarding field.</p>",
	content: "<h2>Program Objectives</h2><ul><li>Object 1</li><li>Object 2</li><li>Object 3</li></ul>",
	type: "Associate Degree",
	degree: "Associate of Arts",
	duration: "128 Credits",
	prerequisite: "<p>Review prerequisites in the <a href='#'>Course Catalog</a></p>",
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
