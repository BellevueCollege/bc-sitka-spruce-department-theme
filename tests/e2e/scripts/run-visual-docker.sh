#!/usr/bin/env bash
#
# Run @visual Playwright tests inside the official Playwright Docker image.
#
# wp-env stays on the host; the container uses --network host to reach
# http://localhost:8889 without host.docker.internal or URL rewriting.
#
# Host prep (wp-env start, asset build, WP-CLI seeds) runs before Docker.
# Baselines (*-container-{desktop,tablet,mobile}.png) must always be generated and compared
# in this same pinned image — never mix OS-native and container screenshots.
#
# Usage:
#   npm run test:e2e:visual
#   npm run test:e2e:visual:update
#   npm run test:e2e:visual -- tests/e2e/layout/HeaderFooter.spec.js
#
set -euo pipefail

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../../.." && pwd )"
cd "$ROOT_DIR"

PLAYWRIGHT_IMAGE="${PLAYWRIGHT_DOCKER_IMAGE:-mcr.microsoft.com/playwright:v1.60.0-noble}"
WP_TESTS_PORT="${WP_TESTS_PORT:-8889}"
UPDATE_SNAPSHOTS=false
EXTRA_PLAYWRIGHT_ARGS=()

for arg in "$@"; do
	case "$arg" in
		--update-snapshots | --update-snapshots=* )
			UPDATE_SNAPSHOTS=true
			EXTRA_PLAYWRIGHT_ARGS+=( "$arg" )
			;;
		* )
			EXTRA_PLAYWRIGHT_ARGS+=( "$arg" )
			;;
	esac
done

if [[ "${SKIP_E2E_HOST_PREP:-}" != "1" ]]; then
	echo "Starting wp-env (tests site on port ${WP_TESTS_PORT})..."
	npm run env:start
fi

echo "Preparing host-side seeds and admin auth cache..."
node tests/e2e/scripts/prepare-visual-docker-host.mjs

PLAYWRIGHT_CMD=( npm run test:e2e:visual:playwright -- )
if [[ ${#EXTRA_PLAYWRIGHT_ARGS[@]} -gt 0 ]]; then
	PLAYWRIGHT_CMD+=( "${EXTRA_PLAYWRIGHT_ARGS[@]}" )
fi

echo "Running visual tests in ${PLAYWRIGHT_IMAGE} (--network host)..."
docker run --rm \
	--network host \
	-v "${ROOT_DIR}:/workspace" \
	-w /workspace \
	-e E2E_VISUAL_DOCKER=1 \
	-e WP_BASE_URL="http://localhost:${WP_TESTS_PORT}" \
	-e PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
	"${PLAYWRIGHT_IMAGE}" \
	"${PLAYWRIGHT_CMD[@]}"
