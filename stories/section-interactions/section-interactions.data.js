/**
 * Background tokens and adjacency test cases for section-interactions stories.
 *
 * Sitka-only: no trees-section, pathway-feature, or promo cases (those exist in Bellevue only).
 * Arch uses plain `arch-shape` (Sitka has no arch-bg-navy class).
 */

export const SECTION_BACKGROUNDS = [
	{
		id: 'white',
		label: 'White',
		classes: 'section section-white',
		showDivider: true,
	},
	{
		id: 'xlight',
		label: 'X-Light',
		classes: 'section section-xlight',
		showDivider: false,
	},
	{
		id: 'accent',
		label: 'Accent blue extralight',
		classes: 'section section-accent-blue-extralight',
		showDivider: false,
	},
	{
		id: 'brutus',
		label: 'Brutus blue',
		classes: 'section section-brutus-blue',
		showDivider: false,
		labelClasses: 'text-white',
	},
	{
		id: 'rainyNight',
		label: 'Rainy night blue',
		classes: 'section section-rainy-night-blue',
		showDivider: false,
		labelClasses: 'text-white',
	},
];

const CURVED_SECTION_HEADING = {
	withSectionHeading: true,
	heading: 'Section Heading',
	subheading: '<p>Curved-top section below arch</p>',
	showContentStub: true,
	contentLabel: 'Content below heading',
};

/**
 * Build a section segment from a background token.
 *
 * @param {object} background
 * @param {string} [labelSuffix]
 * @param {object} [options]
 * @returns {object}
 */
export function sectionSegment(background, labelSuffix = '', options = {}) {
	return {
		type: 'section',
		label: `${background.label}${labelSuffix}`,
		classes: background.classes,
		showDivider: background.showDivider ?? false,
		innerClass: background.innerClass ?? 'container-xl',
		labelClasses: background.labelClasses ?? '',
		...options,
	};
}

/**
 * Build an arch segment. Sitka arch is always rainy-night blue via `.arch-shape`.
 *
 * @param {string} [archClasses]
 * @returns {object}
 */
export function archSegment(archClasses = 'arch-shape') {
	return {
		type: 'arch',
		classes: archClasses,
	};
}

/**
 * Build a block-wrapper segment.
 *
 * @param {string} [label]
 * @returns {object}
 */
export function blockWrapperSegment(label = 'Block wrapper') {
	return {
		type: 'blockWrapper',
		label,
	};
}

/**
 * Build a stub announcement segment (adjacency only; not full banner markup).
 *
 * @param {string} [label]
 * @returns {object}
 */
export function announcementSegment(label = 'Announcement') {
	return {
		type: 'section',
		label,
		classes: 'announcement container-xl',
		showDivider: false,
		innerClass: 'container-xl',
	};
}

const white = SECTION_BACKGROUNDS.find((background) => background.id === 'white');
const xlight = SECTION_BACKGROUNDS.find((background) => background.id === 'xlight');
const accent = SECTION_BACKGROUNDS.find((background) => background.id === 'accent');
const brutus = SECTION_BACKGROUNDS.find((background) => background.id === 'brutus');
const rainyNight = SECTION_BACKGROUNDS.find((background) => background.id === 'rainyNight');

const rainyNightCurved = {
	...rainyNight,
	classes: 'section section-rainy-night-blue curved-top',
};

const diffsRainyNight = {
	id: 'diffsRainyNight',
	label: 'Diffs rainy night',
	classes: 'diffs curved-top section section-rainy-night-blue',
	showDivider: false,
	labelClasses: 'text-white',
	innerClass: 'diffs--container',
};

/**
 * Build all 25 ordered background pair cases.
 *
 * @returns {object[]}
 */
export function buildBackgroundPairCases() {
	const cases = [];

	SECTION_BACKGROUNDS.forEach((firstBackground) => {
		SECTION_BACKGROUNDS.forEach((secondBackground) => {
			cases.push({
				id: `${firstBackground.id}-to-${secondBackground.id}`,
				label: `${firstBackground.label} → ${secondBackground.label}`,
				segments: [
					sectionSegment(firstBackground, ' (first)'),
					sectionSegment(secondBackground, ' (second)'),
				],
			});
		});
	});

	return cases;
}

export const archAndStructuralCases = [
	{
		id: 'xlight-arch-curved',
		label: 'X-Light → Arch → Rainy Night curved-top',
		segments: [
			sectionSegment(xlight, ' (first)'),
			archSegment(),
			sectionSegment(rainyNightCurved, ' (second)', CURVED_SECTION_HEADING),
		],
	},
	{
		id: 'brutus-arch-curved',
		label: 'Brutus blue → Arch → Rainy Night curved-top',
		segments: [
			sectionSegment(brutus, ' (first)'),
			archSegment(),
			sectionSegment(rainyNightCurved, ' (second)', CURVED_SECTION_HEADING),
		],
	},
	{
		id: 'accent-arch-curved',
		label: 'Accent blue extralight → Arch → Rainy Night curved-top',
		segments: [
			sectionSegment(accent, ' (first)'),
			archSegment(),
			sectionSegment(rainyNightCurved, ' (second)', CURVED_SECTION_HEADING),
		],
	},
	{
		id: 'xlight-arch-diffs',
		label: 'X-Light → Arch → Diffs rainy-night curved-top',
		segments: [
			sectionSegment(xlight, ' (first)'),
			archSegment(),
			sectionSegment(diffsRainyNight, ' (second)', {
				...CURVED_SECTION_HEADING,
				wrapInnerClass: 'diffs--container',
			}),
		],
	},
	{
		id: 'rainy-arch-hidden',
		label: 'Rainy Night → Arch (hidden) → Rainy Night',
		segments: [
			sectionSegment(rainyNight, ' (first)'),
			archSegment(),
			sectionSegment(rainyNight, ' (second)'),
		],
	},
	{
		id: 'rainy-arch-curved',
		label: 'Rainy Night → Arch → Rainy Night curved-top',
		segments: [
			sectionSegment(rainyNight, ' (first)'),
			archSegment(),
			sectionSegment(rainyNightCurved, ' (second)', CURVED_SECTION_HEADING),
		],
	},
	{
		id: 'diffs-to-rainy',
		label: 'Diffs rainy-night → Rainy Night',
		segments: [
			sectionSegment(diffsRainyNight, ' (first)'),
			sectionSegment(rainyNight, ' (second)'),
		],
	},
	{
		id: 'diffs-to-arch',
		label: 'Diffs rainy-night → Arch → Rainy Night curved-top',
		segments: [
			sectionSegment(diffsRainyNight, ' (first)'),
			archSegment(),
			sectionSegment(diffsRainyNight, ' (second)', {
				...CURVED_SECTION_HEADING,
				wrapInnerClass: 'diffs--container',
			}),
		],
	},
];

export const specialNeighborCases = [
	{
		id: 'colored-to-announcement',
		label: 'Brutus blue → Announcement',
		segments: [
			sectionSegment(brutus, ' (first)'),
			announcementSegment('Announcement (second)'),
		],
	},
	{
		id: 'announcement-to-section',
		label: 'Announcement → White',
		segments: [
			announcementSegment('Announcement (first)'),
			sectionSegment(white, ' (second)'),
		],
	},
	{
		id: 'announcement-to-arch',
		label: 'Announcement → Arch → Rainy Night curved-top',
		segments: [
			announcementSegment('Announcement (first)'),
			archSegment(),
			sectionSegment(rainyNightCurved, ' (second)', CURVED_SECTION_HEADING),
		],
	},
	{
		id: 'section-to-block',
		label: 'White → Block wrapper',
		segments: [
			sectionSegment(white, ' (first)'),
			blockWrapperSegment('Block wrapper (second)'),
		],
	},
	{
		id: 'last-child-margin',
		label: 'Last-child margin (white → Brutus, second is :last-child of case)',
		segments: [
			sectionSegment(white, ' (first)'),
			sectionSegment(brutus, ' (second, last-child)'),
		],
	},
];
