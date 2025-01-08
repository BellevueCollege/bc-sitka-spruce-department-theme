import { __ } from '@wordpress/i18n';
import { Disabled, Button, Modal, TextControl, __experimentalHStack as HStack } from '@wordpress/components';
import { useState } from '@wordpress/element';
const Link = ( {
	title,
	onChangeTitle,
	className,
	url,
	onChangeUrl,
	target,
	isSelected,
} ) => {

	const [ isOpen , setIsOpen ] = useState( false );
	return (
		<div className='d-flex align-items-center'>
			{ url !== '' && (
				<Disabled>
					<a
						className={ className }
						href={ url }
						target={ target }
					>
						{ title }
					</a>&nbsp;
				</Disabled>
			)}
			{ isSelected && (
				<Button
					variant='primary'
					icon='admin-links'
					onClick={ () => setIsOpen( true ) }
				>
					{ url === '' ? __( 'Add Link', 'bc-sitka-spruce' ) : __( 'Edit Link', 'bc-sitka-spruce' ) }
				</Button>
			) }
			{ isOpen && (
				<Modal
					title={ __( 'Edit Link', 'bc-sitka-spruce' ) }
					onRequestClose={ () => setIsOpen( false ) }
				>
					<TextControl
						label={ __( 'Link Text', 'bc-sitka-spruce' ) }
						value={ title }
						onChange={ onChangeTitle }
					/>
					<TextControl
						label={ __( 'Link URL', 'bc-sitka-spruce' ) }
						value={ url }
						onChange={ onChangeUrl }
						type='url'
					/>
					<HStack
						alignment='right'
					>
						<Button
							variant='secondary'
							isDestructive={ true }
							icon='trash'
							onClick={ () => {
								onChangeTitle( '' );
								onChangeUrl( '' );
								setIsOpen( false );
							}}
						>
							{ __( 'Remove', 'bc-sitka-spruce' ) }
						</Button>
						<Button
							variant='primary'
							onClick={ () => setIsOpen( false ) }
						>
							{ __( 'Save', 'bc-sitka-spruce' ) }
						</Button>
					</HStack>

				</Modal>
			)}
		</div>
	)
}

export default Link;
