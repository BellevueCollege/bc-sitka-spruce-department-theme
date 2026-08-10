import twigSectionInteractions from './section-interactions.twig';
import {
	buildBackgroundPairCases,
	archAndStructuralCases,
	specialNeighborCases,
} from './section-interactions.data.js';

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
					'3. White before colored / arch: divider hidden.',
					'4. Arch is a transition atom: valid cases are predecessor → arch → rainy-night curved-top with real section-heading. Crescent + dark body read as one transition.',
					'5. rainy-arch-hidden: arch must not display.',
					'6. Same-color stacks: 2px separator without extra gap.',
					'7. Announcement / block-wrapper margins correct.',
					'8. Last section: no redundant bottom margin.',
					'9. Curved-top headings sit inside the arch crescent without collapsing the gap below.',
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
