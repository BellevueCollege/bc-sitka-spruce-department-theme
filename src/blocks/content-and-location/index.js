import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { InnerBlocks } from '@wordpress/block-editor';
import { RawHTML } from '@wordpress/element';
import Twig from '../../js/modules/twig-setup';
import apiFetch from '@wordpress/api-fetch';
import { useState } from '@wordpress/element';
import { Disabled } from '@wordpress/components';
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

/**
 * Mock the Sanitize Filter in Timber
 */
Twig.extendFilter("esc_html", (input) => {
	return input;
});

/**
 * Build Twig context for the location-and-hours sidebar preview.
 *
 * @param {Object|null} sidebarContent Options API response.
 * @return {Object} Twig render context.
 */
const buildLocationHoursContext = ( sidebarContent ) => {
    const context = {
        location: sidebarContent?.location ?? '',
        hours: sidebarContent?.hours ?? '',
        contact_url: sidebarContent?.contact_page_url ?? '',
    };

    const locationImage = sidebarContent?.location_image;

    if ( locationImage ) {
        const imageSrc = locationImage.sizes?.['homepage-location'] ?? locationImage.url;

        if ( imageSrc ) {
            context.image_array = {
                src: imageSrc,
                alt: locationImage.alt ?? '',
            };
        }
    }

    return context;
};

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
                }
            );
        }


        const LocationAndHours = () => {

            if ( ! locationSidebarContent ) {
                return (
                    <p>Loading...</p>
                );
            }

            let locationHoursHTML = '';
            const twigContext = buildLocationHoursContext( locationSidebarContent );

            try {
                locationHoursHTML = Twig.twig({
                    ref: '@stories/location-and-hours/location-and-hours.twig',
                }).render( twigContext );
            } catch ( error ) {
                return (
                    <p>{ __( 'Unable to preview Location and Hours sidebar.', 'bc-sitka-spruce' ) }</p>
                );
            }

            return (
                <RawHTML>{ locationHoursHTML }</RawHTML>
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
