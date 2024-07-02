import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { InnerBlocks } from '@wordpress/block-editor';

import './style.scss';
import './editor.scss';

import {
    Card,
    CardBody,
    CardHeader
} from '@wordpress/components';

const BLOCK_TEMPLATE = [
    [ 'bc-sitka-spruce/section-heading' ],
    [ 'bc-sitka-spruce/differentiator-group' ]
];

registerBlockType( 'bc-sitka-spruce/differentiators', {

    edit: function ( props ) {
        const blockProps = useBlockProps();

        return (
            <div { ...blockProps }>
                <InnerBlocks
                    template={ BLOCK_TEMPLATE }
                    allowedBlocks={ [ 'bc-sitka-spruce/section-heading', 'bc-sitka-spruce/differentiator-group' ] }
                    templateLock="all"
                />
            </div>
        );
    },
    save: function () {
        return (
            <InnerBlocks.Content />
        );
    }
} );
