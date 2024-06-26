import { registerBlockType } from '@wordpress/blocks';
import ServerSideRender from '@wordpress/server-side-render';
import { useBlockProps } from '@wordpress/block-editor';

registerBlockType( 'bc-sitka-spruce/bc-brand-bar', {

    edit: function ( props ) {
        const blockProps = useBlockProps();
        return (
            <div { ...blockProps }>
                <ServerSideRender
                    block="bc-sitka-spruce/bc-brand-bar"
                    attributes={ props.attributes }
                />
            </div>
        );
    },
} );