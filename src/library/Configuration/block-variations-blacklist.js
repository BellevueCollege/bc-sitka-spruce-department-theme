/**
 * @file
 * Block variations blacklist.
 */
wp.domReady(() => {
  wp.blocks.unregisterBlockVariation('core/group', 'group-row');
  wp.blocks.unregisterBlockVariation('core/group', 'group-stack');
  wp.blocks.unregisterBlockVariation('core/group', 'group-grid');
  wp.blocks.unregisterBlockVariation( 'core/heading', 'stretchy-heading' );
  wp.blocks.unregisterBlockVariation( 'core/paragraph', 'stretchy-paragraph' );
});
