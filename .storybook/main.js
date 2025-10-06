// .storybook/main.js
import twig from 'vite-plugin-twigjs-loader';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type { import('@storybook/html-vite').StorybookConfig } */
const config = {
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  staticDirs: ["../assets/img"],
  async viteFinal(viteConfig) {
    viteConfig.plugins ||= [];
    viteConfig.plugins.push(
      twig({
        namespaces: {
          '@stories': join(__dirname, '../stories'),
					'@views': join(__dirname, '../views'),
        },
      })
    );
    return viteConfig;
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
