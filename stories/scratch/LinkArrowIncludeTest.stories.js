// stories/scratch/LinkArrowIncludeTest.stories.js
import linkArrowInclude from '@stories/scratch/link-arrow-test.twig';

export default {
  title: 'Scratch/Link Arrow (Include @stories)',
  args: {
    link: { title: 'Included via @stories', url: '#', target: '' },
    linkClass: 'link-accent-lg',
  },
};

const Template = (args) => linkArrowInclude(args);
export const Default = Template.bind({});
