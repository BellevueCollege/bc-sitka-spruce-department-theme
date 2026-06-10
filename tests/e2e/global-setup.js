/**
 * Playwright global setup: seed e2e WordPress state, then authenticate for tests.
 */
import { seedEditorPreferences } from './helpers/wp-cli.js';
import defaultGlobalSetup from '@wordpress/scripts/config/playwright/global-setup.js';

/**
 * @param {import('@playwright/test').FullConfig} config
 * @return {Promise<void>}
 */
export default async function globalSetup( config ) {
	seedEditorPreferences();
	await defaultGlobalSetup( config );
}
