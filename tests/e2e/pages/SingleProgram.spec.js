import { test } from '../fixtures/test.js';

/**
 * `single-program.php` loads related programs via `Program::get_single_from_core_by_title()`
 * and expects a multisite core site. wp-env is single-site, so frontend integration is deferred
 * until the e2e environment can run multisite (same constraint as populated core-site blocks).
 */
test.describe.skip( 'Single program integration', () => {
	test( 'pending multisite e2e environment', () => {} );
} );
