import { isCiEnvironment } from '../helpers/e2e-env.js';

/**
 * Block accidental local PNG baseline updates on LambdaTest unless explicitly allowed.
 *
 * Committed baselines must match CI (Linux Chrome + catalog plugin zips). Local
 * `--update-snapshots` with E2E_LAMBDATEST=1 can bake in host-only plugin mounts.
 */
export function assertVisualBaselineUpdateAllowed() {
	const isUpdatingSnapshots = process.argv.some( ( argument ) =>
		argument.startsWith( '--update-snapshots' )
	);

	if ( ! isUpdatingSnapshots || process.env.E2E_LAMBDATEST !== '1' ) {
		return;
	}

	if (
		isCiEnvironment() ||
		process.env.E2E_ALLOW_VISUAL_BASELINE_UPDATE === '1'
	) {
		return;
	}

	console.error(
		'[e2e] Refusing to update @visual PNG baselines on LambdaTest outside CI.\n' +
			'Start wp-env with npm run env:e2e:start:strict, then run ' +
			'npm run test:e2e:visual:update.'
	);
	process.exit( 1 );
}
