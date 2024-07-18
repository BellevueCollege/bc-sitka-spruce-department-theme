import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { InnerBlocks } from '@wordpress/block-editor';

const BLOCK_TEMPLATE = [
    [ 'bc-sitka-spruce/content-and-location', {
    }],
    [ 'core/group',
        {
            'templateLock': '',
            'className': 'wp-block-group',
            'metadata': {
                'name': 'Full-Width Container'
            },
            'layout': {
                "type": "default",
            }
        },
        [
            [ 'core/paragraph', {
                'placeholder': 'Full-Width Container content...'
            }]
        ]
    ]
];

registerBlockType( 'bc-sitka-spruce/template-homepage', {

    edit: function ( props ) {
        const blockProps = useBlockProps();

        return (
            <div { ...blockProps }>
                <InnerBlocks
                    template={ BLOCK_TEMPLATE }
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
