/**
 * @file
 * Block variations blacklist.
 */
wp.domReady(() => {
  wp.blocks.unregisterBlockVariation('core/group', 'group-row');
  wp.blocks.unregisterBlockVariation('core/group', 'group-stack');
  wp.blocks.unregisterBlockVariation('core/group', 'group-grid');
});
