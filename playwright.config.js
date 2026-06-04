// playwright.config.js
import { defineConfig } from '@playwright/test';
import baseConfig from '@wordpress/scripts/config/playwright.config.js';

export default defineConfig({
    ...baseConfig,
    testDir: './tests/e2e',
    projects: [
        {
        name: 'desktop',
        use: { viewport: { width: 1280, height: 800 } },
        },
        {
        name: 'tablet',
        use: { viewport: { width: 768, height: 1024 } },
        },
        {
        name: 'mobile',
        use: { viewport: { width: 375, height: 812 } },
        },
    ],
});
