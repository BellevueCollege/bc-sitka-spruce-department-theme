#!/usr/bin/env bash
#
# Run Playwright header/footer visual tests on LambdaTest against local wp-env.
#
# Flow:
#   1. Start wp-env and build theme assets
#   2. Seed menus, ACF Site Options, and the E2E Site Chrome test page
#   3. Open a LambdaTest tunnel so cloud browsers can reach localhost:8889
#   4. Run HeaderFooter.spec.js on the lambdatest-desktop Playwright project
#
# Prerequisites:
#   - LT_USERNAME and LT_ACCESS_KEY exported
#   - LambdaTest tunnel binary (set LT_BINARY or place LT in project root)
#   - Sibling plugin directories required by .wp-env.json
#
# Usage:
#   ./tests/e2e/scripts/run-lambdatest-visual.sh
#   ./tests/e2e/scripts/run-lambdatest-visual.sh --update-snapshots
#
# Visual snapshot scope (see readme): E2E_VISUAL_SCOPE=desktop|full (default desktop)
#
set -euo pipefail

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../../.." && pwd )"
cd "$ROOT_DIR"

THEME_SLUG="bc-sitka-spruce-department-theme"
SEED_FILE="/var/www/html/wp-content/themes/${THEME_SLUG}/tests/fixtures/seed-site-chrome.php"
TEST_SPEC="tests/e2e/layout/HeaderFooter.spec.js"
TUNNEL_NAME="${LT_TUNNEL_NAME:-sitka-e2e}"
TUNNEL_PID=""

# Stop the tunnel when the script exits, even on failure.
cleanup() {
	if [[ -n "$TUNNEL_PID" ]] && kill -0 "$TUNNEL_PID" 2>/dev/null; then
		echo "Stopping LambdaTest tunnel (pid ${TUNNEL_PID})..."
		kill "$TUNNEL_PID" 2>/dev/null || true
		wait "$TUNNEL_PID" 2>/dev/null || true
	fi
}

trap cleanup EXIT INT TERM

if [[ -z "${LT_USERNAME:-}" || -z "${LT_ACCESS_KEY:-}" ]]; then
	echo "Error: LT_USERNAME and LT_ACCESS_KEY must be set." >&2
	exit 1
fi

# Prefer LT_BINARY, then ./LT in the project root, then PATH.
resolve_lt_binary() {
	if [[ -n "${LT_BINARY:-}" && -x "$LT_BINARY" ]]; then
		echo "$LT_BINARY"
		return
	fi

	if [[ -x "${ROOT_DIR}/LT" ]]; then
		echo "${ROOT_DIR}/LT"
		return
	fi

	if command -v LT >/dev/null 2>&1; then
		command -v LT
		return
	fi

	echo "Error: LambdaTest tunnel binary not found. Download LT from the LambdaTest dashboard and set LT_BINARY." >&2
	exit 1
}

LT_BIN="$( resolve_lt_binary )"
UPDATE_SNAPSHOTS=false

for arg in "$@"; do
	case "$arg" in
		--update-snapshots )
			UPDATE_SNAPSHOTS=true
			;;
	esac
done

echo "Starting wp-env..."
npm run env:start

echo "Building theme assets..."
npm run build

echo "Seeding menus, ACF options, and test page..."
./node_modules/.bin/wp-env run tests-cli wp eval-file "$SEED_FILE"

echo "Starting LambdaTest tunnel (${TUNNEL_NAME})..."
"$LT_BIN" --user "$LT_USERNAME" --key "$LT_ACCESS_KEY" --tunnelName "$TUNNEL_NAME" &
TUNNEL_PID=$!

# Give the tunnel time to register before cloud browsers connect.
echo "Waiting for tunnel to connect..."
sleep 10

if [[ "$UPDATE_SNAPSHOTS" == true ]]; then
	echo "Running LambdaTest visual tests (update snapshots)..."
	npm run test:e2e:lambdatest:update -- --project=lambdatest-desktop "$TEST_SPEC"
else
	echo "Running LambdaTest visual tests..."
	npm run test:e2e:lambdatest -- --project=lambdatest-desktop "$TEST_SPEC"
fi
