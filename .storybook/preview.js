/** @type { import('@storybook/html').Preview } */
import Twig from "twig";
import '../assets/dist/css/main.css';

// --- Twig shims for WordPress/Timber filters & functions ---

// Replace whitespace with dashes, drop non-alphanum 
Twig.extendFilter("sanitize", function (v) {
  return String(v).replace(/\s/g, "-").replace(/[^a-zA-Z0-9-]/g, "-");
});

Twig.extendFunction("__", (input,/*, namespace */) => {
  return input;
});

// Mock Timber functions. Note that NO SANITIZATION is done for the following. This is purely for a preview.
Twig.extendFilter("esc_url",  (v) => v);
Twig.extendFilter("esc_attr", (v) => v);
Twig.extendFilter("esc_html", (v) => v);
Twig.extendFilter("wp_kses_post", (v) => v);

// If templates later complain about other filters, add them here similarly.
// Examples:
// Twig.extendFilter("esc_textarea", (v) => v);
// Twig.extendFilter("sanitize_title", (v) => v);

// -----------------------------------------------------------

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