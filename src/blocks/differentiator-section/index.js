import metadata from './block.json';
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { InnerBlocks } from '@wordpress/block-editor';
import Link from '../shared-elements/link';
import { RichText } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';


import './style.scss';
import './editor.scss';


const BLOCK_TEMPLATE = [
    [ 'bc-sitka-spruce/differentiator', {} ],
    [ 'bc-sitka-spruce/differentiator', {} ],
    [ 'bc-sitka-spruce/differentiator', {} ]
];

registerBlockType( metadata.name, {
	...metadata, // pulls in supports/attributes so anchor persists
    edit: function ( props ) {
		const {
			attributes: { title, description, linkTitle, linkUrl },
			setAttributes,
			isSelected,
		} = props;
        const blockProps = useBlockProps({
			className: "section section-rainy-night-blue diffs curved-top alignfull",
		});

        return (
			<>
				<div className="arch-shape alignfull"></div>
				<div { ...blockProps }>
					<div className="diffs--container">
						<div className="container-xl">
							<div className="row text-white">
								<div className="col-md-9">
									<RichText
										tagName="h2"
										value={ title }
										allowedFormats={ [] }
										onChange={ ( title ) => setAttributes( { title } ) }
										placeholder={ __( 'Enter section title (required)...', 'bc-sitka-spruce' ) }
									/>
									<RichText
										tagName="p"
										allowedFormats={ [] }
										value={ description }
										onChange={ ( description ) => setAttributes( { description } ) }
										placeholder={ __( 'Enter description (optional)...', 'bc-sitka-spruce' ) }
									/>
								</div>
								<div className="col-md-3">
									<Link
										title={ linkTitle }
										onChangeTitle={ ( linkTitle ) => setAttributes( { linkTitle } ) }
										url={ linkUrl }
										onChangeUrl={ ( linkUrl ) => setAttributes( { linkUrl } ) }
										target=""
										isSelected={ isSelected }
										className= "link-accent-lg text-white"
									/>
								</div>
							</div>
							<div className="row">
								<div className="col diffs-editor-grid">
									<InnerBlocks
										template={ BLOCK_TEMPLATE }
										allowedBlocks={ [ 'bc-sitka-spruce/differentiator' ] }
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</>
        );
    },
	save: () => <InnerBlocks.Content />,
} );
