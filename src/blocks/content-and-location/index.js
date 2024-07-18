import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { InnerBlocks } from '@wordpress/block-editor';

import './style.scss';
// import './editor.scss';

import {
    Card,
    CardBody,
    CardHeader
} from '@wordpress/components';

registerBlockType( 'bc-sitka-spruce/content-and-location', {

    edit: function ( props ) {
        const blockProps = useBlockProps();

        return (
            <div { ...blockProps }>
                <div className = "row">
                    <div className = "col-md-8">
                        <InnerBlocks
                            templateLock=""
                        />
                    </div>
                    <div className = "col-md-4">
                        <Card>
                            <CardHeader>
                                <h2>{ __( 'Location and Hours', 'bc-sitka-spruce' ) }</h2>
                            </CardHeader>
                            <CardBody>
                                {__( 'Edit location and hours and control display from Site Options', 'bc-sitka-spruce' )}
                            </CardBody>
                        </Card>
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
