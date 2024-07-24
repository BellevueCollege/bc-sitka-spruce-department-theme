import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { InnerBlocks } from '@wordpress/block-editor';
import { RawHTML } from '@wordpress/element';
import Twig from "twig";
import apiFetch from '@wordpress/api-fetch';
import { useState } from '@wordpress/element';
import { Disabled } from '@wordpress/components';
import locationAndHours from '/stories/location-and-hours/location-and-hours.twig';
import { RichText } from '@wordpress/block-editor';

import './style.scss';
import './editor.scss';

import {
    Card,
    CardBody,
    CardHeader
} from '@wordpress/components';

/**
 * Mock the WordPress __ Function in Timber
 * 
 * Return the input, ignore namespace. __() is used to provide localization.
 */
Twig.extendFunction("__", (input, namespace) => {
    return input;
});


const BLOCK_TEMPLATE = [
    [ 'mayflower-blocks/button', {
        'buttonText': 'Optional Button',
        'lock': {
            'move': false,
            'remove': false
        }
    }],
    ['gravityforms/form', {
        'lock': {
            'move': false,
            'remove': false
        }
    }]
];


registerBlockType( 'bc-sitka-spruce/content-and-location', {

    edit: function ( props ) {
        const blockProps = useBlockProps({
            className: 'content-and-location alignwide'
        });

        const [ locationSidebarContent, setLocationSidebarContent ] = useState(null);

        if ( ! locationSidebarContent ) {
            apiFetch( {
                path: '/bc-sitka-spruce/v1/options'
            } )
                .then( ( response ) => {
                    setLocationSidebarContent( response );
                    console.log( locationSidebarContent );

                }
            );
        }


        const LocationAndHours = () => {

            if ( ! locationSidebarContent ) {
                return (
                    <p>Loading...</p>
                );
            }
            return (
                <RawHTML>{
                    locationSidebarContent.display_location_card && (
                        locationAndHours({
                            image: {
                                src: locationSidebarContent.location_image.url,
                                alt: locationSidebarContent.location_image.alt
                            },
                            location: locationSidebarContent.location,
                            hours: locationSidebarContent.hours,
                            contact_url: locationSidebarContent.contact_page_url
                        })
                    )
                }</RawHTML>
            );

        }

        return (
            <div { ...blockProps }>
                <div className = "row">
                    <div className = "col-md-8">
                        <RichText
                            tagName="h1"
                            className="content-and-location-heading"
                            placeholder={__( 'Division/Department/Service Name', 'bc-sitka-spruce' )}
                            value={ props.attributes.heading }
                            onChange={ ( newHeading ) => props.setAttributes( { heading: newHeading } ) }
                            identifier='heading'
                            allowedFormats={ [] }
                            disableLineBreaks={ true }
                        />
                        <RichText
                            tagName="p"
                            className="content-and-location-summary lead"
                            placeholder={__( 'Unit summary: Mission statement, service overview, or other introduction to your unit', 'bc-sitka-spruce' )}
                            value={ props.attributes.summary }
                            onChange={ ( newSummary ) => props.setAttributes( { summary: newSummary } ) }
                            identifier='summary'
                            allowedFormats={ [] }
                        />
                        <InnerBlocks
                            template={ BLOCK_TEMPLATE }
                            allowedBlocks={[
                                'mayflower-blocks/button',
                                'core/shortcode',
                                'gravityforms/form',
                            ]}
                            renderAppender={ InnerBlocks.ButtonBlockAppender }
                            templateLock=""
                        />
                    </div>
                    <div className = "col-md-4">
                        <Disabled>
                            <LocationAndHours />
                        </Disabled>
                        <hr />
                        <Card>
                            <CardBody>
                                {__( 'Visit the "Site Options" area to edit or disable the Location and Hours Sidebar', 'bc-sitka-spruce' )}
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
