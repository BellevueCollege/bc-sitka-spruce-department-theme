/** @type { import('@storybook/html').Preview } */
import Twig from "twig";
import '../assets/dist/css/main.css';

// import '/node_modules/@fortawesome/fontawesome-pro/css/all.css'
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
/**
 * Mock the WordPress __ Function in Timber
 * 
 * Return the input, ignore namespace. __() is used to provide localization.
 */
Twig.extendFunction("__", (input, namespace) => {
  return input;
});