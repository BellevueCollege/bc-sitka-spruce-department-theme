# Agent guide: `tests/` (Playwright e2e)

**Audience:** Cursor and other coding agents maintaining or extending this theme’s automated tests.

**Human-oriented runbook:** [`readme.md`](../readme.md) (install, npm scripts, LambdaTest tunnel). This file captures **why** the stack is shaped the way it is and **how to change it safely**.

---

All automated tests live under **`tests/e2e/**`**: Playwright + wp-env Docker WordPress + `@wordpress/scripts` / `@wordpress/e2e-test-utils-playwright`. PHP seed **fixtures** live under `tests/fixtures/` and run via `wp-env run cli wp eval-file`.

---

## High-level architecture

```mermaid
flowchart LR
  subgraph host [Host machine or Azure agent]
    PW[Playwright runner]
    WP[wp-env WordPress :8889]
    GS[global-setup.js]
    CLI[wp-cli.js seeds]
    WP --> CLI
    GS --> CLI
    PW -->|functional and aria| WP
    TUN[e2e-tunnel container]
    TUN -->|host.docker.internal:8889| WP
    PW -->|visual E2E_LAMBDATEST=1| LTB
  end
  subgraph lt [LambdaTest Linux Chrome]
    LTB[Remote browser]
    LTB --> TUN
  end
```

1. **WordPress** runs in **wp-env** (generated `.wp-env.e2e.json`) on port **8889**.
2. **Functional** and **`@aria`** tests use **host** Chrome locally (`channel: 'chrome'`) or Chromium in CI.
3. **`@visual`** tests use **LambdaTest** Linux Chrome (`E2E_LAMBDATEST=1`) for PNG baselines.
4. **Admin auth** for wp-scripts setup uses **127.0.0.1**; LambdaTest runs get a **second** storage state logged in via **host.docker.internal**.

---

## Directory layout (`tests/e2e`)

| Path | Role |
|------|------|
| `blocks/*.spec.js` | Block-focused specs (editor + frontend + snapshots) |
| `pages/*.spec.js` | Page integration specs (composed templates, section order, interactions) |
| `layout/*.spec.js` | Theme chrome (header/footer) |
| `fixtures/test.js` | Extends `@wordpress/e2e-test-utils-playwright` `test` / `expect` — **import from here** |
| `helpers/` | Shared flows (`editor.js`, `header.js`, `e2e-env.js`, `lambdatest.js`, `wp-cli.js`, `viewports.js`) |
| `scripts/` | wp-env boot (`start-wp-env-e2e.mjs`, `generate-wp-env-e2e.mjs`), plugin resolve (`resolve-plugin.mjs`), tunnel (`lambdatest-tunnel.mjs`) |
| `mu-plugins/e2e-seed-endpoint.php` | LambdaTest URL rewriting + block allowlist |
| `plugins.json` | Committed plugin catalog |
| `**/__snapshots__/` | PNG and YAML baselines next to specs |

Config: repo root [`playwright.config.js`](../playwright.config.js).

---

## Design decisions (preserve unless intentionally changing product/infra)

### Playwright CLI vs `wp-scripts test-playwright`

- **Use:** `playwright test` via `npm run test:e2e:*`.
- **Why:** `@wordpress/scripts` re-triggers `playwright install` on every invocation.

### wp-env port **8889**

- Chain: `tests/e2e/helpers/e2e-env.js` → `playwright.config.js` → `package.json` `WP_BASE_URL` → `BC_SITKA_E2E_WP_PORT` in the mu-plugin.
- **Changing the port requires updating all of the above.**

### webServer readiness

Playwright probes `http://127.0.0.1:8889/wp-login.php`. `reuseExistingServer: !CI` and `E2E_WPENV_EXTERNAL=1` attach to an already-running wp-env (Azure starts wp-env once per job).

### Host URL: **127.0.0.1**, not `localhost`

Avoids macOS IPv6/`::1` mismatches between Playwright and wp-env.

### LambdaTest base URL: **host.docker.internal**

- Remote browsers use `http://host.docker.internal:8889` (`getLambdaTestPlaygroundBaseUrl()`).
- Host-side WP-CLI and wp-scripts login stay on **127.0.0.1**.
- Mu-plugin rewrites asset URLs when `HTTP_HOST` is `host.docker.internal`.

### Block registration allowlist

Only blocks listed in `BC_SITKA_E2E_ALLOWED_THEME_BLOCKS` in the mu-plugin stay registered. Loading every block’s `editorScript` through the tunnel slows LambdaTest editor screenshots. **Add the block name when adding a new block spec.**

### Bellevue 2022 / core-site blocks (deferred on frontend)

These blocks need multisite main-site CPT data. Page integration seeds omit them on homepages; [`tests/e2e/blocks/CoreSiteBlocks.spec.js`](e2e/blocks/CoreSiteBlocks.spec.js) only checks editor insert/load:

- `bc-sitka-spruce/department-feature`
- `bc-sitka-spruce/news-feature-core`
- `bc-sitka-spruce/support-feature`
- `bc-sitka-spruce/differentiator` / `differentiator-section`
- `bc-sitka-spruce/degrees-certificates-section`
- `bc-sitka-spruce/template-program-info`

### Templates deferred until multisite e2e

- **`single-program.php`** — related programs and catalog sidebar use core-site data via `switch_to_blog()`. [`tests/e2e/pages/SingleProgram.spec.js`](e2e/pages/SingleProgram.spec.js) is skipped; do not seed `program` CPTs in integration fixtures until wp-env supports multisite.

### Page integration seeds

- [`tests/fixtures/seed-e2e-integration.php`](../fixtures/seed-e2e-integration.php) — published pages/CPTs for `pages/*.spec.js` (via `seedIntegrationData()` in `wp-cli.js`).
- [`tests/fixtures/e2e-homepage-variant.php`](../fixtures/e2e-homepage-variant.php) — sets `site_type` and static front page per homepage spec.
- [`tests/fixtures/seed-chrome-variants.php`](../fixtures/seed-chrome-variants.php) — ACF chrome states for extended header/footer tests.

### Seeding: WP-CLI via wp-env

- `tests/e2e/helpers/wp-cli.js` runs `wp-env run --config=.wp-env.e2e.json cli wp eval-file …`.
- Seed helpers cache results per process; do not seed in `beforeEach`.

### Plugin resolution

- **Catalog:** `tests/e2e/plugins.json` — remote URLs, `envPathVar`, `plugins.local.json` overlay.
- **Generated config:** `npm run env:e2e:generate` writes `.wp-env.e2e.json` (gitignored).

### Workers = **1**

One WordPress database; parallel workers race on posts and editor state.

### Viewport projects and `@visual` budget

- `desktop` / `tablet` / `mobile` projects for all runs.
- `skipDuplicateBlockViewport` limits block-editor and `@aria` to **desktop**; screenshots, frontend layout, axe, and header/footer still run all viewports.
- **`@visual` is only for tests that call `toHaveScreenshot`.** Attribute or DOM assertions belong in functional tests (host), not LambdaTest.

### Test tags

| Tag | Runner | Snapshots |
|-----|--------|-----------|
| (none) | Functional on host | — |
| `@aria` | Host | `*.yml` (`toMatchAriaSnapshot`) |
| `@visual` | LambdaTest | `*.png` (`toHaveScreenshot`) |

### LambdaTest tunnel

- Container **e2e-tunnel**; auto-start in `global-setup.js` unless `E2E_LAMBDATEST_TUNNEL_AUTO=0`.

---

## Environment variables (quick reference)

| Variable | Typical value | Meaning |
|----------|----------------|---------|
| `WP_BASE_URL` | `http://127.0.0.1:8889` | Host WordPress URL |
| `E2E_WPENV_EXTERNAL` | `1` | Skip Playwright `webServer`; use existing wp-env |
| `E2E_LAMBDATEST` | `1` | LambdaTest browser + tunnel base URL |
| `E2E_LAMBDATEST_TUNNEL_AUTO` | `0` / unset | `0` = do not auto-start tunnel |
| `E2E_LAMBDATEST_PLAYGROUND_URL` | optional | Default `http://host.docker.internal:8889` |
| `LT_USERNAME`, `LT_ACCESS_KEY` | secrets | Required for `@visual` |
| `GITHUB_PAT`, `ACF_DOWNLOAD_URL` | CI / local | Plugin downloads |

---

## CI (Azure DevOps — `azure-pipelines.yml` Test stage)

E2e runs in the shared **theme-ci** **Test** stage (`runTests: true`). **DeployTest_*** Kinsta stages wait for Test to pass.

**One-time ADO setup:** Create Library variable group **`sitka-e2e`** with `LT_USERNAME`, `LT_ACCESS_KEY`, `GITHUB_PAT`, `ACF_DOWNLOAD_URL`, and authorize it for the `bc-sitka-spruce-department-theme` CI pipeline.

**Test job flow** (see [`.azuredevops/e2e-test-steps.yml`](../.azuredevops/e2e-test-steps.yml)):

1. `build-base` + `npm run build` + `replacetokens` on `style.css` (Test job does not reuse the Build artifact zip).
2. Playwright Chromium, `env:e2e:start` once.
3. `test:e2e:functional` with `E2E_WPENV_EXTERNAL=1`.
4. LambdaTest tunnel + `test:e2e:visual` with `E2E_WPENV_EXTERNAL=1` and `E2E_LAMBDATEST_TUNNEL_AUTO=0`.
5. Stop tunnel and `env:e2e:stop` (always); publish JUnit from `artifacts/test-results/*.xml`.

**Re-run e2e only:** Queue the CI pipeline manually and run the **Test** stage only.

**Job timeout:** Hosted agents default to 60 minutes for the Test job; watch duration on first full PR run.

---

## Code standards for this repo

Follow workspace **human-readable code** rules. Match neighboring files before adding abstractions.

---

## Agent hygiene

- **Do not** widen block allowlist beyond blocks under active test.
- **Do not** commit `plugins.local.json`, `.wp-env.e2e.json`, or secrets.
- **Do not** tag non-screenshot tests with `@visual`.
- Prefer **one fix in a shared helper** over duplicating URL/tunnel logic in each spec.

---

## File index (frequently touched)

| Concern | File |
|---------|------|
| Playwright projects, webServer, LambdaTest `use` | `playwright.config.js` |
| Tunnel + WS endpoint | `tests/e2e/helpers/lambdatest.js` |
| Port / host URL | `tests/e2e/helpers/e2e-env.js` |
| Publish / editor flows | `tests/e2e/helpers/editor.js` |
| Seed WP-CLI | `tests/e2e/helpers/wp-cli.js` |
| wp-env generate + start | `tests/e2e/scripts/generate-wp-env-e2e.mjs`, `start-wp-env-e2e.mjs` |
| Plugin sources | `tests/e2e/scripts/resolve-plugin.mjs`, `plugins.json` |
| URL filters + blocks | `tests/e2e/mu-plugins/e2e-seed-endpoint.php` |
| npm scripts | `package.json` (`test:e2e:*`, `env:e2e:*`, `tunnel:e2e:*`) |
| ADO e2e steps | `.azuredevops/e2e-test-steps.yml`, root `azure-pipelines.yml` |
