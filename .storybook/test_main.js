import path from 'path';                                   
import { fileURLToPath } from 'url';                      
const __sbFilename = fileURLToPath(import.meta.url);
const __sbDirname  = path.dirname(__sbFilename);     
const storiesRoot  = path.resolve(__sbDirname, '../stories');

/** @type { import('@storybook/html-webpack5').StorybookConfig } */const config = {
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  staticDirs: ["../assets/img"],

  async webpackFinal(config, { configType }) {
    //confirmed console.log('>>> webpackFinal is running');
    if (configType === 'DEVELOPMENT') {
      // Modify config for development
    }
    if (configType === 'PRODUCTION') {
      // Modify config for production
    }
    // Replaced twig rule with this version:
    //    - removes paths: ["/"] (which breaks cross-platform includes)
    //    - adds Twig namespaces → @stories maps to ../stories 
    const twigNamespaces = { stories: path.resolve(__sbDirname, '../stories') };
    // Define a helper to inject our alias loader before twig-loader
    const injectTwigAliasLoader = (use) => {
      if (!use) return false;
      const arr = Array.isArray(use) ? use : [use];
      let touched = false;
      for (let i = 0; i < arr.length; i++) {
        const u = arr[i];
        if (u && typeof u === 'object' && u.loader && u.loader.includes('twig-loader')) {
          // Insert our custom loader immediately BEFORE twig-loader
          arr.splice(i, 0, {
            loader: path.resolve(__sbDirname, './twig-alias-loader.js'),
            options: { storiesRoot },
          });
          touched = true;
          break;
        }
      }
      return touched;
    };
    const enhanceTwigUse = (use) => {
      if (!use) return false;
      const uses = Array.isArray(use) ? use : [use];
      let enhanced = false;
      uses.forEach((u) => {
        if (u && typeof u === 'object' && u.loader && u.loader.includes('twig-loader')) {
          const prevTwigOptions = u.options?.twigOptions || {};
          const prevNamespaces  = prevTwigOptions.namespaces || {};
          // Remove legacy paths that cause cross-platform breaking
          const { paths, ...restTwigOptions } = prevTwigOptions;

          u.options = {
            ...(u.options || {}),
            // Extend the Twig.js runtime so includes get resolved via webpack
            twigOptions: {
              ...(u.options?.twigOptions || {}),
              namespaces: {
                ...prevNamespaces,
                ...twigNamespaces,
                stories: path.resolve(__sbDirname, '../stories')
              },
              rethrow: true,             // nicer errors in Storybook plz
            },
          };
          enhanced = true;
        }
      });
      return enhanced;
    };
    //descend into rule.rules (some configs use it)
    const walkRules = (rules) => {
      let found = false;
      (rules || []).forEach((rule) => {
        if (Array.isArray(rule.oneOf)) rule.oneOf.forEach((r) => { found = enhanceTwigUse(r.use) || found; });
        found = enhanceTwigUse(rule.use) || found;
        if (Array.isArray(rule.rules)) found = walkRules(rule.rules) || found;
      });
      return found;
    };

   // Walk all rules and try to enhance; track if any twig-loader
    let foundTwigLoader = walkRules(config.module.rules);

    // Fallback: If no twig-loader was found, add one
    if (!foundTwigLoader) {
      config.module.rules.push({
        test: /\.twig$/,
        use: [{
          loader: 'twig-loader',
          options: {
            twigOptions: {
            // namespace is fine to keep, but not required anymore
            namespaces: { stories: storiesRoot },
              rethrow: true,
            },
          },
        }],
      });
    }                                                                           

    // JS import alias for other assets/modules
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@stories': storiesRoot,
    };

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
      use: ["style-loader", "css-loader"],
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
//confirmed console.log('>>> .storybook/main.js was evaluated');
export default config;
