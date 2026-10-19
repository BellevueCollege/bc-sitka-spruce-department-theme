import twigSectionInteractions from './section-interactions.twig';
import {
	buildBackgroundPairCases,
	archAndStructuralCases,
	specialNeighborCases,
} from './section-interactions.data.js';

import '/assets/dist/css/blocks/nav.css';
import '/assets/dist/blocks/tabcordion/style-index.css';

export default {
	title: 'Stories/Section Interactions',
	component: 'section-interactions',
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component: [
					'Composite visual QA for `.section` adjacency rules in `_section.scss`.',
					'Three stories keep Chromatic snapshot usage low.',
					'',
					'Acceptance checklist:',
					'1. Adjacent colored sections meet with no white strip.',
					'2. White sections: spacing above content; divider + spacing below content.',
					'3. White before colored: divider hidden; white section still has bottom spacing. White before arch: divider hidden; container bottom margin removed (arch clip-path lead-in supplies one spacing unit).',
					'4. Arch is a transition atom: predecessor → arch → rainy-night curved-top. Predecessor: `padding-bottom: calc(--sitka-container-spacing + 10vw)` (white, colored, intro, announcement); arch clip anchor `100%`; curved-top offset `calc(-10vw + token)` at lg. Crescent + dark body read as one transition.',
					'5. rainy-arch-hidden: arch must not display.',
					'6. Same-color stacks: 2px separator without extra gap.',
					'7. Colored → Announcement: content inset inside the colored band; one spacing unit between band and announcement.',
					'8. Announcement → colored section (e.g. xlight): one white unit below the announcement card; colored section supplies heading inset via padding-top.',
					'9. Last section: no redundant bottom margin.',
					'10. Curved-top headings sit inside the arch crescent without collapsing the gap below.',
					'11. xlight-tabcordion-tabs-white: one spacing unit above the tabcordion card border.',
					'12. xlight-tabcordion-tabs-white: one spacing unit before the white section heading (from section padding, not card margin).',
				].join('\n'),
			},
		},
	},
};

const Template = ({ cases }) => twigSectionInteractions({ cases });

export const BackgroundPairs = Template.bind({});
BackgroundPairs.args = {
	cases: buildBackgroundPairCases(),
};

export const ArchAndStructural = Template.bind({});
ArchAndStructural.args = {
	cases: archAndStructuralCases,
};

export const SpecialNeighbors = Template.bind({});
SpecialNeighbors.args = {
	cases: specialNeighborCases,
};
