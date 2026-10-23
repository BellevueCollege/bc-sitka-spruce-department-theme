/**
 * Prints the Chrome version from the current LambdaTest Linux session.
 * Use when pinning E2E_LAMBDATEST_CHROME_VERSION / DEFAULT_LAMBDATEST_CHROME_VERSION.
 */
import { chromium } from '@playwright/test';
import {
	ensureTunnelRunning,
	getLambdaTestWsEndpoint,
} from '../helpers/lambdatest.js';

await ensureTunnelRunning();
const browser = await chromium.connect( getLambdaTestWsEndpoint() );
const version = await browser.version();
await browser.close();
process.stdout.write( `${ version }\n` );
