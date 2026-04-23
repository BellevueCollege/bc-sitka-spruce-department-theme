/**
 * Allows Twig Namespaces to be used in Twig files used by Gutenberg Blocks
 * 
 * Note: This configuration is specifically for twig files that are rendered with
 * JavaScript within the block editor. Files that Timber or Storybook render
 * use a different namespace configuration.
 */
import Twig from 'twig';

// Register all @stories templates
const storiesContext = require.context(`../../../stories`, true, /\.twig$/);
storiesContext.keys().forEach(filename => {
    const templateContent = storiesContext(filename).default || storiesContext(filename);
    Twig.twig({
        id: filename.replace(/^\./, '@stories'),
        data: templateContent,
        allowInlineIncludes: true,
        rethrow: true,
    });
});

export default Twig;