import { registerBlockType } from '@wordpress/blocks';
import ServerSideRender from '@wordpress/server-side-render';
import { useBlockProps } from '@wordpress/block-editor';
import { useState } from '@wordpress/element';
import { SelectControl } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

import { Card, CardBody, CardHeader } from '@wordpress/components';

registerBlockType( 'bc-sitka-spruce/differentiator', {
	edit: function ( props ) {
		const blockProps = useBlockProps();

		// Set up stateful variables to manage differentiator selection
		const [ differentiators, setDifferentiators ] = useState( [
			{ value: null, label: 'Loading...' },
		] );
		const [ areDiffsLoaded, setAreDiffsLoaded ] = useState( false );

		// Load network site URL from custom API endpoint
		apiFetch( { path: '/bc-sitka-spruce/v1/site-info' } ).then(
			( info ) => {
				const bc_network_url = info.network_url;

				// Build REST URL for differentiators on the core site
				const restUrl = bc_network_url + 'wp-json/wp/v2/differentiator';
				if ( ! areDiffsLoaded ) {
					fetch( restUrl )
						.then( ( response ) => response.json() )
						.then( ( differentiators ) => {
							const label = {
								value: null,
								label: 'Select Differentiator',
							};
							const diffArray = differentiators.map(
								( differentiator ) => {
									return {
										value: differentiator.id,
										label: differentiator.title.rendered,
									};
								}
							);
							setDifferentiators( [
								...[ label ],
								...diffArray,
							] );
							setAreDiffsLoaded( true );
						} );
				}
			}
		);

		return (
			<div { ...blockProps }>
				{ ! areDiffsLoaded && <p>Loading...</p> }
				{ areDiffsLoaded &&
					( props.isSelected ||
						! props.attributes.differentiatorPostId ) && (
						<Card>
							<CardHeader>
								<h2>Select Differentiator to Display</h2>
							</CardHeader>
							<CardBody>
								<SelectControl
									label="Select a Differentiator"
									value={
										props.attributes.differentiatorPostId
									}
									onChange={ ( differentiatorPostId ) =>
										props.setAttributes( {
											differentiatorPostId,
										} )
									}
									options={ differentiators }
								/>
							</CardBody>
						</Card>
					) }
				{ props.attributes.differentiatorPostId && (
					<ServerSideRender
						block="bc-sitka-spruce/differentiator"
						attributes={ props.attributes }
					/>
				) }
			</div>
		);
	},
} );
