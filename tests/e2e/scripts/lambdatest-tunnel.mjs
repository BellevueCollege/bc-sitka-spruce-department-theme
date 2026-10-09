#!/usr/bin/env node
/**
 * CLI for LambdaTest docker tunnel used by e2e visual tests.
 */
import {
	ensureTunnelRunning,
	isTunnelAutoStartEnabled,
	startLambdaTestTunnelContainer,
	stopLambdaTestTunnelContainer,
	waitForTunnelInfoApi,
} from '../helpers/lambdatest.js';

const USAGE =
	'Usage: node tests/e2e/scripts/lambdatest-tunnel.mjs <ensure|start|stop>';

/**
 * @return {Promise<void>}
 */
async function runEnsure() {
	await ensureTunnelRunning( { autoStart: isTunnelAutoStartEnabled() } );
}

/**
 * @return {Promise<void>}
 */
async function runStart() {
	startLambdaTestTunnelContainer();
	await waitForTunnelInfoApi();
}

/**
 * @return {void}
 */
function runStop() {
	stopLambdaTestTunnelContainer();
}

const subcommand = process.argv[ 2 ];

try {
	switch ( subcommand ) {
		case 'ensure':
			await runEnsure();
			break;
		case 'start':
			await runStart();
			break;
		case 'stop':
			runStop();
			break;
		default:
			console.error( USAGE );
			process.exit( 1 );
	}
} catch ( error ) {
	const message = error instanceof Error ? error.message : String( error );
	console.error( message );
	process.exit( 1 );
}
