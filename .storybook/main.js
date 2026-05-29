// .storybook/main.js
import twig from 'vite-plugin-twig-drupal';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mergeConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Normalize backslashes to forward slashes for Vite on Windows
const normalize = (p) => p.replace(/\\/g, '/');

/** @type { import('@storybook/html-vite').StorybookConfig } */
const config = {
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  staticDirs: ["../assets/img"],
  async viteFinal(viteConfig) {
    viteConfig.plugins ||= [];
    viteConfig.plugins.push(
      twig({
        namespaces: {
          stories: normalize(join(__dirname, '../stories')),
          views: normalize(join(__dirname, '../views')),
        },
        framework: 'html',
      })
    );

    return mergeConfig(viteConfig, {
      build: {
        cssMinify: 'esbuild',
      },
      optimizeDeps: {
        include: ['twig'],
      },
    });
  },

  addons: [
    "@storybook/addon-links",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    '@chromatic-com/storybook'
  ],

  framework: {
    name: "@storybook/html-vite",
    options: {}
  },

  docs: {}
};

export default config;
