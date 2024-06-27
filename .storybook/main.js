/** @type { import('@storybook/html-webpack5').StorybookConfig } */const config = {
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  staticDirs: ["../assets/img"],
  async webpackFinal(config, { configType }) {
    if (configType === 'DEVELOPMENT') {
      // Modify config for development
    }
    if (configType === 'PRODUCTION') {
      // Modify config for production
    }
    config.module.rules.push({
      test: /\.twig$/,
      use: {
        loader: "twig-loader",
        options: {
          twigOptions: {
          }
        }
      },
    });
    return config;
  },
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-styling-webpack",
    '@storybook/addon-a11y',
    ({
      name: "@storybook/addon-styling-webpack",

      options: {
        rules: [{
      test: /\.css$/,
      sideEffects: true,
      use: [
          require.resolve("style-loader"),
          {
              loader: require.resolve("css-loader"),
              options: {
                  
                  
              },
          },
      ],
    },],
      }
    }),
    "@storybook/addon-webpack5-compiler-swc",
  ],
  framework: {
    name: "@storybook/html-webpack5",
    options: {
      builder: {},
    },
  },
  docs: {},
};
export default config;
