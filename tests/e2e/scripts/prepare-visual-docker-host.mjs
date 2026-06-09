/**
 * Host-only preparation before Playwright-in-Docker visual runs.
 *
 * wp-env and WP-CLI cannot run inside the Playwright container, so seeds and
 * admin auth are prepared on the host. The container reaches wp-env via
 * --network host and reads cached seeds from artifacts/e2e-seeds/.
 */
import { writeVisualDockerSeedCaches, clearAdminStorageState } from '../helpers/wp-cli.js';

clearAdminStorageState();
writeVisualDockerSeedCaches();

console.log( 'Visual Docker host prep complete (admin auth cleared, seed caches written).' );
