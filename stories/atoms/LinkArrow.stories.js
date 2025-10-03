// stories/atoms/links/LinkArrow.stories.js
import linkArrow from '@stories/atoms/links/link-arrow.twig';

export default {
  title: 'Atoms/Links/Link Arrow (Direct)',
  args: {
    link: {
      title: 'Learn more',
      url: '#',
      target: '', // '' or '_blank'
    },
    linkClass: 'link-accent-lg',
    samePageIcon: 'fa-regular fa-arrow-right-long',
    newPageIcon: 'fa-solid fa-square-arrow-up-right',
    iconClass: '',
  },
};

const Template = (args) => linkArrow(args);

export const Default = Template.bind({});
