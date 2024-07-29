import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { InnerBlocks } from '@wordpress/block-editor';

import './editor.scss';
import './style.scss';

const BLOCK_TEMPLATE = [
    [ 'bc-sitka-spruce/hero-image', {} ],
    [ 'bc-sitka-spruce/content-and-location', {}]
];

registerBlockType( 'bc-sitka-spruce/template-homepage', {

    edit: function ( props ) {
        const blockProps = useBlockProps({
            className: 'template-homepage alignwide'
        });

        return (
            <>
                <div className="nothing-above-this"><strong>{__( 'No content above this line!', 'bc-sitka-spruce' )}</strong></div>
                <div { ...blockProps }>
                    <InnerBlocks
                        template={ BLOCK_TEMPLATE }
                        templateLock="all"
                    />
                </div>
            </>
        );
    },
    save: function () {
        const blockProps = useBlockProps.save({
            className: 'homepage-intro alignfull'
        })
        return (
            <div { ...blockProps }>
                <InnerBlocks.Content />
            </div>
        );
    }
} );
