import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';

registerBlockType(metadata.name, {
    ...metadata,
    edit: () => null, // ACF hooks the visual preview window onto render.php
    save: () => null, // Content fields pulled via get_field database arrays
});