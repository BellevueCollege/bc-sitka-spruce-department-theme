// tests/e2e/blocks/announcement-banner.spec.js
import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import AxeBuilder from '@axe-core/playwright';
import { execSync } from 'child_process';

// ─── Constants ────────────────────────────────────────────────────────────────

const BLOCK_NAME = 'bc-sitka-spruce/announcement-banner';

const ACF_FIELDS = {
  TITLE:       'field_66e4c35bcf5ea',
  DESCRIPTION: 'field_66e4c38bcf5eb',
  IMAGE:       'field_66e4c50d2ef34',
  BUTTON:      'field_66e4c39ecf5ec',
  LINKS:       'field_66e4c40bcf5ed',
};

// ─── Block Fixtures ───────────────────────────────────────────────────────────

const FIXTURE = {
  withButton: (imageId) => ({
    [ACF_FIELDS.TITLE]:       'Test Announcement',
    [ACF_FIELDS.DESCRIPTION]: 'This is a test announcement description for visual regression.',
    [ACF_FIELDS.IMAGE]:       imageId,
    [ACF_FIELDS.BUTTON]:      { title: 'Learn More', url: 'https://example.com', target: '_blank' },
    [ACF_FIELDS.LINKS]:       '',
  }),
  withLinks: (imageId) => ({
    [ACF_FIELDS.TITLE]:       'Test Announcement',
    [ACF_FIELDS.DESCRIPTION]: 'This is a test announcement description for visual regression.',
    [ACF_FIELDS.IMAGE]:       imageId,
    [ACF_FIELDS.BUTTON]:      { title: '', url: '', target: '' },
    [ACF_FIELDS.LINKS]:       [
      { field_66e4c419cf5ee: { title: 'Link One',   url: 'https://example.com/one',   target: '' } },
      { field_66e4c419cf5ee: { title: 'Link Two',   url: 'https://example.com/two',   target: '' } },
      { field_66e4c419cf5ee: { title: 'Link Three', url: 'https://example.com/three', target: '_blank' } },
    ],
  }),
  noImage: () => ({
    [ACF_FIELDS.TITLE]:       'Test Announcement No Image',
    [ACF_FIELDS.DESCRIPTION]: 'This announcement has no image set.',
    [ACF_FIELDS.IMAGE]:       '',
    [ACF_FIELDS.BUTTON]:      { title: 'Learn More', url: 'https://example.com', target: '_blank' },
    [ACF_FIELDS.LINKS]:       '',
  }),
};

// ─── Suite ────────────────────────────────────────────────────────────────────

test.describe('Announcement Banner Block', () => {

  test.beforeEach(async ({ admin, editor, page }) => {
    await admin.createNewPost({ postType: 'page' });
    await dismissPatternDialog(page);
    await exitCodeEditor(page);
    await editor.canvas.locator('body').waitFor({ state: 'visible' });
  });

  // ─── Editor ───────────────────────────────────────────────────────────────

  test.describe('Editor', () => {

    test('inserts block into editor', async ({ editor }) => {
      await editor.insertBlock({ name: BLOCK_NAME });

      await expect(
        editor.canvas.locator(`[data-type="${BLOCK_NAME}"]`)
      ).toBeVisible();
    });

    test('editor snapshot — with button and image @visual', async ({ editor }) => {
      const imageId = await uploadTestImage();
      await editor.insertBlock({
        name: BLOCK_NAME,
        attributes: { data: FIXTURE.withButton(imageId) },
      });

      const block = editor.canvas.locator(`[data-type="${BLOCK_NAME}"]`);
      await waitForBlockToRender(editor, BLOCK_NAME);
      await expect(block).toBeVisible();
      await expect(block).toHaveScreenshot('editor-with-button.png', {
        maxDiffPixelRatio: 0.02,
      });
    });

    test('editor snapshot — with links and image @visual', async ({ editor }) => {
      const imageId = await uploadTestImage();
      await editor.insertBlock({
        name: BLOCK_NAME,
        attributes: { data: FIXTURE.withLinks(imageId) },
      });

      const block = editor.canvas.locator(`[data-type="${BLOCK_NAME}"]`);
      await waitForBlockToRender(editor, BLOCK_NAME);
      await expect(block).toBeVisible();
      await expect(block).toHaveScreenshot('editor-with-links.png', {
        maxDiffPixelRatio: 0.02,
      });
    });

    test('editor snapshot — no image @visual', async ({ editor }) => {
      await editor.insertBlock({
        name: BLOCK_NAME,
        attributes: { data: FIXTURE.noImage() },
      });

      const block = editor.canvas.locator(`[data-type="${BLOCK_NAME}"]`);
      await waitForBlockToRender(editor, BLOCK_NAME);
      await expect(block).toBeVisible();
      await expect(block).toHaveScreenshot('editor-no-image.png', {
        maxDiffPixelRatio: 0.02,
      });
    });

  });

  // ─── Frontend ─────────────────────────────────────────────────────────────

  test.describe('Frontend', () => {

    test('frontend snapshot — with button and image @visual', async ({ editor, page }) => {
      const imageId = await uploadTestImage();
      await editor.insertBlock({
        name: BLOCK_NAME,
        attributes: { data: FIXTURE.withButton(imageId) },
      });

      const url = await publishAndGetUrl(editor, page);
      await page.goto(url);

      const banner = getBannerLocator(page, 'Test Announcement');
      await expect(banner).toBeVisible();
      await expect(banner).toHaveScreenshot('frontend-with-button.png', {
        maxDiffPixelRatio: 0.02,
      });
    });

    test('frontend snapshot — with links and image @visual', async ({ editor, page }) => {
      const imageId = await uploadTestImage();
      await editor.insertBlock({
        name: BLOCK_NAME,
        attributes: { data: FIXTURE.withLinks(imageId) },
      });

      const url = await publishAndGetUrl(editor, page);
      await page.goto(url);

      const banner = getBannerLocator(page, 'Test Announcement');
      await expect(banner).toBeVisible();
      await expect(banner).toHaveScreenshot('frontend-with-links.png', {
        maxDiffPixelRatio: 0.02,
      });
    });

    test('frontend snapshot — no image @visual', async ({ editor, page }) => {
      await editor.insertBlock({
        name: BLOCK_NAME,
        attributes: { data: FIXTURE.noImage() },
      });

      const url = await publishAndGetUrl(editor, page);
      await page.goto(url);

      const banner = getBannerLocator(page, 'Test Announcement No Image');
      await expect(banner).toBeVisible();
      await expect(banner).toHaveScreenshot('frontend-no-image.png', {
        maxDiffPixelRatio: 0.02,
      });
    });

    test('renders button with correct href and target @visual', async ({ editor, page }) => {
      const imageId = await uploadTestImage();
      await editor.insertBlock({
        name: BLOCK_NAME,
        attributes: { data: FIXTURE.withButton(imageId) },
      });

      const url = await publishAndGetUrl(editor, page);
      await page.goto(url);

      const button = getBannerLocator(page, 'Test Announcement')
        .getByRole('link', { name: 'Learn More' });

      await expect(button).toBeVisible();
      await expect(button).toHaveAttribute('href', 'https://example.com');
      await expect(button).toHaveAttribute('target', '_blank');
    });

    test('renders all links in repeater @visual', async ({ editor, page }) => {
      const imageId = await uploadTestImage();
      await editor.insertBlock({
        name: BLOCK_NAME,
        attributes: { data: FIXTURE.withLinks(imageId) },
      });

      const url = await publishAndGetUrl(editor, page);
      await page.goto(url);

      const banner = getBannerLocator(page, 'Test Announcement');
      await expect(banner.getByRole('link', { name: 'Link One' })).toBeVisible();
      await expect(banner.getByRole('link', { name: 'Link Two' })).toBeVisible();
      await expect(banner.getByRole('link', { name: 'Link Three' })).toBeVisible();
      await expect(
        banner.getByRole('link', { name: 'Link Three' })
      ).toHaveAttribute('target', '_blank');
    });

    test('renders image when provided @visual', async ({ editor, page }) => {
      const imageId = await uploadTestImage();
      await editor.insertBlock({
        name: BLOCK_NAME,
        attributes: { data: FIXTURE.withButton(imageId) },
      });

      const url = await publishAndGetUrl(editor, page);
      await page.goto(url);

      const banner = getBannerLocator(page, 'Test Announcement');
      await expect(banner.locator('img')).toBeVisible();
    });

    test('renders without image when not provided @visual', async ({ editor, page }) => {
      await editor.insertBlock({
        name: BLOCK_NAME,
        attributes: { data: FIXTURE.noImage() },
      });

      const url = await publishAndGetUrl(editor, page);
      await page.goto(url);

      const banner = getBannerLocator(page, 'Test Announcement No Image');
      await expect(banner).toBeVisible();
      await expect(banner.locator('img')).toHaveCount(0);
    });

  });

  // ─── Accessibility ────────────────────────────────────────────────────────

  test.describe('Accessibility', () => {

    test('passes axe audit — with button and image @visual', async ({ editor, page }) => {
      const imageId = await uploadTestImage();
      await editor.insertBlock({
        name: BLOCK_NAME,
        attributes: { data: FIXTURE.withButton(imageId) },
      });

      const url = await publishAndGetUrl(editor, page);
      await page.goto(url);

      await expect(getBannerLocator(page, 'Test Announcement')).toBeVisible();

      const results = await new AxeBuilder({ page })
        .include('article')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(results.violations).toEqual([]);
    });

    test('passes axe audit — with links and image @visual', async ({ editor, page }) => {
      const imageId = await uploadTestImage();
      await editor.insertBlock({
        name: BLOCK_NAME,
        attributes: { data: FIXTURE.withLinks(imageId) },
      });

      const url = await publishAndGetUrl(editor, page);
      await page.goto(url);

      await expect(getBannerLocator(page, 'Test Announcement')).toBeVisible();

      const results = await new AxeBuilder({ page })
        .include('article')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(results.violations).toEqual([]);
    });

    test('passes axe audit — no image @visual', async ({ editor, page }) => {
      await editor.insertBlock({
        name: BLOCK_NAME,
        attributes: { data: FIXTURE.noImage() },
      });

      const url = await publishAndGetUrl(editor, page);
      await page.goto(url);

      await expect(getBannerLocator(page, 'Test Announcement No Image')).toBeVisible();

      const results = await new AxeBuilder({ page })
        .include('article')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(results.violations).toEqual([]);
    });

  });

});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Dismiss the pattern chooser dialog if it appears on new post creation.
 */
async function dismissPatternDialog(page) {
  const closeButton = page.getByRole('button', { name: 'Close' });
  if (await closeButton.isVisible()) {
    await closeButton.click();
  }
}

/**
 * Exit the code editor and return to the visual block editor if active.
 */
async function exitCodeEditor(page) {
  const exitButton = page.getByRole('button', { name: 'Exit code editor' });
  if (await exitButton.isVisible()) {
    await exitButton.click();
  }
}

/**
 * Wait for the ACF block REST render to complete after insertion.
 * ACF blocks re-render via REST after insertion — waits for content to appear
 * rather than relying on spinner absence, which is more semantically correct.
 */
async function waitForBlockToRender(editor, blockName) {
  await editor.canvas
    .locator(`[data-type="${blockName}"] h2`)
    .waitFor({ state: 'visible', timeout: 10000 });
}

/**
 * Publish the current post and return the frontend URL.
 */
async function publishAndGetUrl(editor, page) {
  await editor.publishPost();
  await page.waitForSelector('.editor-post-publish-panel');
  return page
    .locator('.editor-post-publish-panel a:has-text("View Page")')
    .getAttribute('href');
}

/**
 * Return a locator scoped to the announcement banner article by heading text.
 * The render_callback outputs a plain <article> without a wp-block-* class.
 */
function getBannerLocator(page, title) {
  return page.locator('article').filter({
    has: page.locator('h2', { hasText: title }),
  });
}

/**
 * Upload the standard test image fixture via WP-CLI and return its attachment ID.
 * wp-env exposes the test environment via the `tests-cli` service.
 */
async function uploadTestImage() {
  const result = execSync(
    `wp-env run tests-cli wp media import /var/www/html/wp-content/themes/bc-sitka-spruce-department-theme/tests/fixtures/test-image-260x174.png --porcelain`
  ).toString().trim();
  return parseInt(result, 10);
}

/**
 * Set ACF fields on a post via WP-CLI.
 * Reserved for scenarios requiring saved post meta (e.g. frontend query tests).
 * For standard block render tests, pass data directly via insertBlock attributes.
 */
async function setAcfFields(postId, fields) {
  const phpFile = `/tmp/acf-set-${postId}.php`;
  const php = `<?php
$fields = json_decode( '${JSON.stringify(fields).replace(/'/g, "\\'")}', true );
foreach ( $fields as $key => $value ) {
    update_field( $key, $value, ${postId} );
}`;
  execSync(`wp-env run tests-cli bash -c "echo '${php.replace(/'/g, "\\'")}' > ${phpFile}"`);
  execSync(`wp-env run tests-cli wp eval-file ${phpFile}`);
}