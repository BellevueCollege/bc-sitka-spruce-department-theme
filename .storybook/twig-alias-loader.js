// .storybook/twig-alias-loader.js
// Rewrites Twig {%, %} statements that refer to @stories/... into relative paths.
// Supports: include, extends, import, from
// Example: {% include '@stories/atoms/links/link-arrow.twig' %}
// becomes: {% include '../atoms/links/link-arrow.twig' %}

const path = require('path');

const NEEDLE = /{%\s*(include|extends|import|from)\s+(['"])@stories\/([^'"]+)\2/g;

function toPosix(p) {
return p.split(path.sep).join('/');
}

module.exports = function twigAliasLoader(source) {
    const fromDir = path.dirname(this.resourcePath);
    const storiesRoot = this.getOptions()?.storiesRoot;

    if (!storiesRoot) return source;

    return source.replace(NEEDLE, (match, kw, quote, subpath) => {
        const absTarget = path.resolve(storiesRoot, subpath);
        let rel = path.relative(fromDir, absTarget);
        rel = toPosix(rel);
        if (!rel.startsWith('.')) rel = './' + rel; // make it explicitly relative
        return `{% ${kw} ${quote}${rel}${quote}`;
    });
};