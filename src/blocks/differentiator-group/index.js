import { registerBlockType } from '@wordpress/blocks';
import ServerSideRender from '@wordpress/server-side-render';
import { useBlockProps } from '@wordpress/block-editor';
import { Fragment, useState } from '@wordpress/element';
import { SelectControl } from '@wordpress/components';
import { Flex, FlexBlock, FlexItem } from '@wordpress/components';
import { InnerBlocks } from '@wordpress/block-editor';

import {
    Card,
    CardBody,
    CardHeader
} from '@wordpress/components';

const BLOCK_TEMPLATE = [
    [ 'bc-sitka-spruce/differentiator', {} ],
    [ 'bc-sitka-spruce/differentiator', {} ],
    [ 'bc-sitka-spruce/differentiator', {} ]
];

registerBlockType( 'bc-sitka-spruce/differentiator-group', {

    edit: function ( props ) {
        const blockProps = useBlockProps();

        return (
            <div { ...blockProps }>
                <div className="container-xl global-spacing--6x oho-animate-sequence">
                    <div className="row justify-content-sm-center gy-3">
                        <InnerBlocks
                            template={ BLOCK_TEMPLATE }
                            templateLock="false"
                            orientation="horizontal"
                        />
                    </div>
                </div>
            </div>
        );
    },
    save: function () {
        return (
            <InnerBlocks.Content />
        );
    }
} );
