/** @type { import('@storybook/html').Preview } */
import Twig from "twig";
import '../assets/dist/css/main.css';
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
