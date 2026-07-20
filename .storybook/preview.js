/** @type { import('@storybook/html-vite').Preview } */
import Twig from "twig";
import '../assets/dist/js/main.css';
import '../assets/dist/css/bootstrap.css';
import '../assets/dist/css/main.css';

// import '/node_modules/@awesome.me/kit-7a7c3bfd75/icons/css/all.css'
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
 * Mock the Sanitize Filter in Timber
 *
 * Replace non-alphanumeric characters with dashes
 */
Twig.extendFilter("sanitize", function (a, b) {
  return a.replace(/\s/g, "-").replace(/[^a-zA-Z0-9-]/g, "-");
});

/**
 * Mock the WordPress __ Function in Timber
 *
 * Return the input, ignore namespace. __() is used to provide localization.
 */
Twig.extendFunction("__", (input, namespace) => {
  return input;
});

/**
 * Mock the Timber esc_url function. Note that NO SANITIZATION is done. This is purely for a preview.
 */
Twig.extendFilter("esc_url", (input) => {
	return input;
});

/**
 * Mock the Timber esc_attr function. Note that NO SANITIZATION is done. This is purely for a preview.
 */
Twig.extendFilter("esc_attr", (input) => {
	return input;
});

/**
 * Mock the Timber esc_html function. Note that NO SANITIZATION is done. This is purely for a preview.
 */
Twig.extendFilter("esc_html", (input) => {
	return input;
});


/**
 * Mock the Timber wp_kses_post function. Note that NO SANITIZATION is done. This is purely for a preview.
 */
Twig.extendFilter("wp_kses_post", (input) => {
	return input;
});
