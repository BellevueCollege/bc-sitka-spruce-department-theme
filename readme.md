# BC "Sitka Spruce" Department Theme

## Required Plugins
This theme requires the following plugins to be installed and activated:
- [Advanced Custom Fields Pro](https://www.advancedcustomfields.com)
- [Advanced Custom Fields: Font Awesome Field](https://wordpress.org/plugins/advanced-custom-fields-font-awesome/)
- [Breadcrumb Trail](https://wordpress.org/plugins/breadcrumb-trail/)

## System Preparation

To build theme assets locally, you will need the following dependencies
installed on your development environment:

1. [NodeJS](https://nodejs.org) - Version 21+.
1. [npm](https://npm.community) - Version 10+.
1. [Composer](https://getcomposer.org) - Version 2.6+.
1. [FontAwesome Pro](https://fontawesome.com/) Key. Get the key from your FontAwesome
   account, and add it to your `.bashrc` or `.zshrc` file, in the format `export FONTAWESOME_KEY="MY KEY"`

Once these requirements are installed, you can install project dependencies via `composer install` and `npm install`.

## File Structure

- `assets/` - Built assents and static files
  - `assets/dist/` - Built assets (SCSS and JS). Folder contents not tracked in git, and are wiped on build.
  - `assets/img/` - Image files used in the theme
- `node_modules/` - NPM dependencies. Not tracked in git.
- `src/` - Source SCSS and JS files. Built to `assets/dist/`
  - `src/blocks/` - Block Editor Blocks bundled with the theme. Includes JS and SCSS specific to blocks. 
  - `src/controllers/` - PHP controller classes used to supply data to twig templates used by blocks
  - `src/library/` - PHP classes used for various utility functions
  - `src/scss/` - SCSS files used by the theme
    - `src/scss/blocks/` - SCSS files to style non-bundled blocks (aka Mayflower Blocks etc). Each are compiled to their own files in `assets/dist/scss/blocks/`
    - `src/scss/lib/` - Setup for third-party libraries like Bootstrap
    - `src/scss/variables/` - SCSS variables used across other files
    - `src/scss/_block_styles.scss` - Does not output any SCSS, but provides basic setup needed to include variables etc in Block specific SCSS files.
- `stories/` - Twig stories, used by Blocks and Storybook
- `templates/` - WordPress HTML Page Templates
- `vendor/` - Composer dependencies. Not tracked in git.

## Build Commands
- `npm run build` - Build SCSS and JS using production settings
- `npm start` - Build SCSS and JS using dev settings, and watch for changes
- `npm run storybook` - Builds specified files in storybook (great for testing!)


## Documentation

### Adding styles to a non-bundled block (aka from Core or Mayflower Bocks)
1. Create a new SCSS file in `src/scss/blocks`, using the naming convention `[namespace]-[block-name].scss`. Example: `mayflower-blocks/alert` would be `mayflower-blocks-alert.scss`
  - If you are adding Bootstrap styles to a block, within the block SCSS file first import `block-styles`, then the Bootstrap component styles for that block. For example: 
  
  ```scss
  @import '/src/scss/block-styles';
  @import "~bootstrap/scss/alert";

  // any other styles here!
  ```

2. In `webpack.config.js`, add a new entry point, setting the `block` flag to `true`, and passing in the file name without the extension. Example: `...scssEntryPoint( 'mayflower-blocks-alert', true ),`
3. In `functions.php`, enqueue the style by adding the block to the array within the `enqueue_block_styles()` function

### Block stylesheets - where they live, and why

Styles for blocks live in two different places, depending on if they are blocks that are bundled with this theme, or if they are blocks that are part of a plugin like Mayflower Blocks. 

- For bundled blocks, the styles are with the block definition, in `src/blocks/[block-name]/style.scss` and `src/blocks/[block-name]/editor.scss`
- For external blocks and core blocks, theme provided styles are in `src/scss/blocks`, with the naming convention of `namespace-name.scss`
- For block-specific styles that are loaded globally (not sure why this would be needed, but just in case), they are also in `src/scss/blocks`, but the file names are proceeded by a `_`, aka `_namespace-name.scss`, to indicate that they are partial files.

### Registering a Bundled Block

Some Block Editor blocks are bundled as part of the theme. These blocks are located in `src/blocks/[block-name]`

Each block folder should include a `block.json` that defines the block and calls any stylesheets, render files, and scripts. 

Once the block has been created, ensure that it is registered in `functions.php`
