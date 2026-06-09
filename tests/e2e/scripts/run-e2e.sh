#!/usr/bin/env bash
#
# Run the full E2E suite: functional tests on the host, visual tests in Docker.
#
# Usage:
#   npm run test:e2e
#   npm run test:e2e -- tests/e2e/blocks/PostsFeature.spec.js
#   npm run test:e2e -- --project=desktop tests/e2e/layout/HeaderFooter.spec.js
#
set -euo pipefail

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../../.." && pwd )"
cd "$ROOT_DIR"

EXTRA_PLAYWRIGHT_ARGS=()
if [[ $# -gt 0 ]]; then
	EXTRA_PLAYWRIGHT_ARGS=( "$@" )
fi

echo "Starting wp-env..."
npm run env:start

echo "Running functional tests on host..."
if [[ ${#EXTRA_PLAYWRIGHT_ARGS[@]} -gt 0 ]]; then
	wp-scripts test-playwright --grep-invert @visual "${EXTRA_PLAYWRIGHT_ARGS[@]}"
else
	wp-scripts test-playwright --grep-invert @visual
fi

echo "Running visual tests in Docker..."
SKIP_E2E_HOST_PREP=1 ./tests/e2e/scripts/run-visual-docker.sh "${EXTRA_PLAYWRIGHT_ARGS[@]}"
