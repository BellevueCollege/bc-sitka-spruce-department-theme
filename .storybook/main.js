import twig from 'vite-plugin-twig-drupal';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type { import('@storybook/html-vite').StorybookConfig } */
const config = {
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  staticDirs: ["../assets/img"],

  async viteFinal(config, { configType }) {
    config.plugins = config.plugins || [];

    config.plugins.push(
      twig({
        root: join(__dirname, '..'),
        namespaces: {
          'components': join(__dirname, '../stories'),
          'stories': join(__dirname, '../stories'),
        },

      })
    );

    return config;
  },

  addons: [
    "@storybook/addon-links",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
  ],

  framework: {
    name: "@storybook/html-vite",
    options: {}
  },

  docs: {}
};

export default config;
