import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { InnerBlocks } from '@wordpress/block-editor';
import { useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';


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


		// Detect if the current page is the front page
		const { frontPageId, currentPostId } = useSelect((select) => {
			return {
				frontPageId: select("core").getEntityRecord('root', 'site')?.page_on_front,
				currentPostId: select( 'core/editor' ).getCurrentPostId(),
			};
		});

		// Set the isFrontPage state
		const [ isFrontPage, setIsFrontPage ] = useState( undefined );
		if ( isFrontPage === undefined && frontPageId !== undefined && currentPostId !== undefined ) {
			if ( frontPageId === currentPostId ) {
				setIsFrontPage( true );
			} else {
				setIsFrontPage( false );
			}
		}

        return (
            <>
                <div { ...blockProps }>
					{ isFrontPage === false && (
						<div className="container-xl card text-bg-warning">
							<h2 className="h5"><strong>{__("Warning!", "bc-sitka-spruce")}</strong> {__("You are using a homepage template on a page that is not set as your site's homepage!", "bc-sitka-spruce")}</h2>
							<p>{__("The homepage template is only intended to be used on the homepage of the site. To prevent major visual issues, only use this pattern on the homepage of your site.", "bc-sitka-spruce")}</p>
							<p>{__("To change the homepage of your site to a different page, please submit a ticket to the ITS Service Desk.", "bc-sitka-spruce")}</p>
						</div>
					) }
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
