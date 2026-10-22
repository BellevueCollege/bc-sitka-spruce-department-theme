import { generateWpEnvE2eConfig } from './generate-wp-env-e2e.mjs';
import { isWslStagingRequested } from './stage-wsl-mounts.mjs';

if ( ! isWslStagingRequested() ) {
	process.env.E2E_STAGE_WSL_MOUNTS = '1';
}

await generateWpEnvE2eConfig();
console.log(
	'[e2e] WSL mount copies refreshed. The running wp-env container sees updates when it was started with env:e2e:start:wsl.'
);
