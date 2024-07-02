import { registerBlockType } from '@wordpress/blocks';
import ServerSideRender from '@wordpress/server-side-render';
import { useBlockProps } from '@wordpress/block-editor';
import { Fragment, useState } from '@wordpress/element';
import { SelectControl } from '@wordpress/components';
import { Flex, FlexBlock, FlexItem } from '@wordpress/components';

import './style.scss';
import './editor.scss';

import {
    Card,
    CardBody,
    CardHeader
} from '@wordpress/components';

registerBlockType( 'bc-sitka-spruce/differentiators', {

    edit: function ( props ) {
        const blockProps = useBlockProps();


        const [ differentiators, setDifferentiators ] = useState( [ { value: null, label: 'Loading...' } ] );
        const [ areDiffsLoaded, setAreDiffsLoaded ] = useState( false );
        // fetch differentiators

        const restUrl = bc_network_url + 'wp-json/wp/v2/differentiator';
        // console.log( restUrl );
        
        if ( ! areDiffsLoaded ) {
            fetch( restUrl )
                .then( response => response.json() )
                .then( differentiators => {
                    const label = { value: null, label: 'Select Differentiator'};
                    const diffArray = differentiators.map( differentiator => {
                        return { value: differentiator.id, label: differentiator.title.rendered }
                    })
                    setDifferentiators( [ ...[label], ...diffArray ] );
                    setAreDiffsLoaded( true );
                }
            );
        }

        return (
            <div { ...blockProps }>
                { ! areDiffsLoaded && <p>Loading...</p> }
                { ( areDiffsLoaded && props.isSelected)  && (
                    <Card>
                        <CardHeader>
                            <h2>Select Differentiators to Display</h2>
                        </CardHeader>
                        <CardBody>
                            <Flex>
                                <FlexBlock>
                                    <SelectControl
                                        label="Slot 1 Differentiator"
                                        value={ props.attributes.differentiator1 }
                                        onChange={ ( differentiator1 ) => props.setAttributes( { differentiator1 } ) }
                                        options={ differentiators }
                                    />

                                </FlexBlock>

                                <FlexBlock>
                                    <SelectControl
                                        label="Slot 2 Differentiator"
                                        value={ props.attributes.differentiator2 }
                                        onChange={ ( differentiator2 ) => props.setAttributes( { differentiator2 } ) }
                                        options={ differentiators }
                                    />
                                </FlexBlock>

                                <FlexBlock>
                                    <SelectControl
                                        label="Slot 3 Differentiator"
                                        value={ props.attributes.differentiator3 }
                                        onChange={ ( differentiator3 ) => props.setAttributes( { differentiator3 } ) }
                                        options={ differentiators }
                                    />
                                </FlexBlock>
                            </Flex>
                        </CardBody>
                    </Card>
                )}
                
                <ServerSideRender
                    block="bc-sitka-spruce/differentiators"
                    attributes={ props.attributes }
                />
            </div>
        );
    },
} );
