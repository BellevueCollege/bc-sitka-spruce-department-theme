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

1. **WordPress** runs in **wp-env** (generated `.wp-env.e2e.json`) as a **subdirectory multisite** on port **8889**.
2. **Functional** and **`@aria`** tests use **host** Chrome locally (`channel: 'chrome'`) or Chromium in CI.
3. **`@visual`** tests use **LambdaTest** Linux Chrome (`E2E_LAMBDATEST=1`) for PNG baselines.
4. **Admin auth** for wp-scripts setup uses **127.0.0.1**; LambdaTest runs get a **second** storage state logged in via **host.docker.internal**.
5. **Front-end admin bar** is hidden via `show_admin_bar` in the e2e mu-plugin so public screenshots and `@aria` body snapshots match a visitor; the block editor still shows the toolbar in wp-admin. The same mu-plugin dequeues `bc-sitka-spruce-a11y-warnings` on the public site so editor-only dashed alt borders do not appear in `@visual` runs that reuse admin cookies.

---

## Directory layout (`tests/e2e`)

| Path | Role |
|------|------|
| `blocks/*.spec.js` | Optional **tier 1–2** block specs (see [Block testing tiers](#block-testing-tiers)); not every theme block gets a file |
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

## Block testing tiers

Most blocks are covered by **seeded page templates** (`pages/*.spec.js`) and the mu-plugin allowlist—not by a dedicated `blocks/*.spec.js`. Use three tiers so the suite does not grow into a per-block Nightwatch-style matrix.

```mermaid
flowchart TD
  decision{Block needs dedicated spec?}
  decision -->|No| pagesOnly["pages/*.spec.js + seeds only"]
  decision -->|Core-site CPT blocks| tier1["Tier 1: CoreSiteBlocks insert smoke"]
  decision -->|Complex ACF / variants / publish flow| tier2["Tier 2: blocks/*.spec.js full functional"]
  tier2 --> snapshots["Snapshots: 1 editor + 1 frontend @visual; 1 editor + 1 frontend @aria"]
  pagesOnly --> pageSignals["Homepage seeds assert blocks in template context"]
```

| Tier | Spec | Snapshots | Functional |
|------|------|-----------|------------|
| **0 — Composition** | None; block appears in seeded [`pages/*.spec.js`](e2e/pages/) | Page-level `@aria` / sectional `@visual` only | Template smoke in page specs |
| **1 — Editor smoke** | [`CoreSiteBlocks.spec.js`](e2e/blocks/CoreSiteBlocks.spec.js) | None | Insert + visible in canvas |
| **2 — Block contract** | e.g. [`PostsFeature.spec.js`](e2e/blocks/PostsFeature.spec.js), [`AnnouncementBanner.spec.js`](e2e/blocks/AnnouncementBanner.spec.js) | 2× `@visual`, 2× `@aria` (desktop via `skipDuplicateBlockViewport`) | Insert, publish→frontend, variant DOM/behavior, axe where variants differ |

### When to add `blocks/<Block>.spec.js`

Add or extend a block spec only when **at least two** are true:

1. ACF or repeater fields with **meaningful variants** (button vs links, optional media, etc.).
2. **Publish → frontend** behavior is not fully exercised by any seeded page template.
3. **Data dependencies** (uploads, CPT queries, main-site switch) need isolated setup.
4. Regressions are **high impact** or historically flaky in editor save/render.

Otherwise rely on **tier 0** (page integration + seeds) and/or **tier 1** (`CoreSiteBlocks`).

**Non-goals:** Do not add block specs for every Mayflower block; do not duplicate page-level layout confidence in block PNGs.

### Standard block spec shape (tier 2)

- `prepareEditorPage` + `skipDuplicateBlockViewport` in `beforeEach`.
- Functional tests per variant that matter—**no snapshot required per variant**.
- **At most** one canonical variant for `@visual` and `@aria` (editor + frontend each).
- Committed PNG baselines **only** via LambdaTest (`npm run test:e2e:visual:update`).

### Relationship to page tests

Block specs own **field variants and publish contract** (href/target, repeaters, optional media). Page specs own **template composition** (section order, chrome, multisite context). Example: Announcement Banner appears in division/department/support homepage `@aria` YAML; [`AnnouncementBanner.spec.js`](e2e/blocks/AnnouncementBanner.spec.js) covers ACF variants and axe without mirroring every homepage layout.

---

## Design decisions (preserve unless intentionally changing product/infra)

### Playwright CLI vs `wp-scripts test-playwright`

- **Use:** `playwright test` via `npm run test:e2e:*`.
- **Why:** `@wordpress/scripts` re-triggers `playwright install` on every invocation.

### wp-env port **8889** and subsite **`/e2e-dept/`**

- Chain: `tests/e2e/helpers/e2e-env.js` → `playwright.config.js` (default `WP_BASE_URL`) → `BC_SITKA_E2E_WP_PORT` in the mu-plugin.
- **Playwright `WP_BASE_URL` defaults to** `http://127.0.0.1:8889/e2e-dept` (Sitka department subsite). WP-CLI seeds use `--url` on the subsite unless seeding the main-site core CPTs.
- **Changing the port or subsite slug requires updating all of the above.**

### Multisite topology (e2e)

| Site | URL | Role |
|------|-----|------|
| Main (blog 1) | `http://127.0.0.1:8889` | Bellevue 2022 CPT plugins + [`seed-e2e-core-site.php`](../fixtures/seed-e2e-core-site.php) (organization, news, programs, etc.). Default theme only — **no** Bellevue 2022 theme. |
| Department subsite | `http://127.0.0.1:8889/e2e-dept` | Sitka theme + full e2e plugin stack + [`seed-e2e-integration.php`](../fixtures/seed-e2e-integration.php). |

CPT plugins from `bellevue-2022-theme-plugins` are **activated on both sites** (not network-activated), matching production.

After switching from single-site e2e to multisite, run `npm run env:e2e:stop` then `wp-env destroy --config=.wp-env.e2e.json` before the next `env:e2e:start`.

### webServer readiness

Playwright runs `start-wp-env-e2e.mjs` and waits for the log line `WP_ENV_E2E_READY_LOG` in [`e2e-env.js`](e2e/helpers/e2e-env.js) (`webServer.wait.stdout`). The start script also skips `wp-env start` when WordPress is already up. `reuseExistingServer: !CI` and `E2E_WPENV_EXTERNAL=1` attach to an already-running wp-env (Azure starts wp-env once per job).

### Host URL: **127.0.0.1**, not `localhost`

Avoids macOS IPv6/`::1` mismatches between Playwright and wp-env.

### LambdaTest base URL: **host.docker.internal**

- Remote browsers use `http://host.docker.internal:8889/e2e-dept` (`getLambdaTestPlaygroundBaseUrl()`).
- Host-side WP-CLI and wp-scripts login stay on **127.0.0.1**.
- Mu-plugin rewrites asset URLs when `HTTP_HOST` is `host.docker.internal`.

### Block registration allowlist

The mu-plugin unregisters every `bc-sitka-spruce/*` block **not** listed in `BC_SITKA_E2E_ALLOWED_THEME_BLOCKS` ([`e2e-seed-endpoint.php`](e2e/mu-plugins/e2e-seed-endpoint.php)). The list covers blocks used by integration seeds and editor specs (homepages, flexible page, tabs, cards, etc.), not only block-focused specs. Loading every block’s `editorScript` through the tunnel slows LambdaTest editor screenshots. **Add the block name when seeds or a new spec need that block on the frontend or in the editor.**

### Bellevue 2022 / core-site blocks

These blocks read main-site CPTs via `switch_to_blog()` / `network_site_url()` REST. **Tier 0** frontend coverage lives in `pages/*.spec.js` after [`seed-e2e-core-site.php`](../fixtures/seed-e2e-core-site.php) + [`e2e-core-content-helpers.php`](../fixtures/e2e-core-content-helpers.php). **Tier 1** editor insert/load is in [`CoreSiteBlocks.spec.js`](e2e/blocks/CoreSiteBlocks.spec.js)—no dedicated tier-2 block spec unless the checklist above applies.

### Page integration seeds

- [`tests/fixtures/seed-e2e-core-site.php`](../fixtures/seed-e2e-core-site.php) — main-site CPTs (`seedCoreSiteData()` / wp-env `afterStart`).
- [`tests/fixtures/seed-e2e-integration.php`](../fixtures/seed-e2e-integration.php) — subsite pages/CPTs for `pages/*.spec.js` (via `seedIntegrationData()` in `wp-cli.js`, which ensures core seed first).
- [`tests/fixtures/e2e-homepage-variant.php`](../fixtures/e2e-homepage-variant.php) — sets `site_type` and static front page per homepage spec.
- [`tests/fixtures/seed-chrome-variants.php`](../fixtures/seed-chrome-variants.php) — ACF chrome states for extended header/footer tests.
- [`seed-site-chrome.php`](../fixtures/seed-site-chrome.php) also seeds **`degree_sock`** site options so `single-program.php` renders the degree sock instead of the unconfigured error state.

### Seeding: WP-CLI via wp-env

- `tests/e2e/helpers/wp-cli.js` runs `wp-env run --config=.wp-env.e2e.json cli wp eval-file …`.
- Seed helpers cache results per process; do not seed in `beforeEach`.

### Plugin resolution

- **Catalog:** `tests/e2e/plugins.json` — remote URLs, `envPathVar`, `plugins.local.json` overlay.
- **Generated config:** `npm run env:e2e:generate` writes `.wp-env.e2e.json` (gitignored).

### Workers = **1**

One WordPress database; parallel workers race on posts and editor state.

### Viewport projects and `@visual` budget

- `desktop` runs the full functional suite; **tablet** and **mobile** projects use Playwright `grep: /@viewport|@visual/` so narrow viewports only run breakpoint-specific functional tests plus all `@visual` screenshots.
- Tag breakpoint-only functional tests with **`@viewport`** (tabcordion accordion, application-guide accordion step, header offcanvas/submenu/CTA). Do not tag desktop-only tab tests, axe, `@aria`, or generic layout assertions.
- `skipDuplicateBlockViewport` limits block-editor `@visual` to **desktop** (tablet/mobile still schedule those tests and skip in the hook). `@aria` stays desktop-only via the narrow project grep.
- **`@visual` is only for tests that call `toHaveScreenshot`.** Attribute or DOM assertions belong in functional tests (host), not LambdaTest.

### wp-env runtime (speed)

- Generated `.wp-env.e2e.json` sets `SCRIPT_DEBUG: false` and `DISABLE_WP_CRON: true` (debug logging stays on). After changing these constants, restart wp-env; refresh committed PNG baselines on LambdaTest if frontend assets shift (`npm run test:e2e:visual:update`).
- First `wp-env start` after plugin/config changes can take several minutes while `afterStart` seeds multisite data; the CLI spinner may sit on “Starting WordPress” or “Executing afterStart Script” during that work.

### Block frontend fixtures (no editor boot)

- Tier-2 block specs publish frontend pages once via [`seedBlockFrontendPages()`](e2e/helpers/wp-cli.js) and [`seed-e2e-block-frontend-pages.php`](../fixtures/seed-e2e-block-frontend-pages.php) (request payload in gitignored `tests/fixtures/.e2e-block-seed-request.json`). Frontend, `@aria`, axe, and frontend `@visual` tests `goto` those URLs; editor describes still use `prepareEditorPage()`.

### Test tags

| Tag | Runner | Snapshots |
|-----|--------|-----------|
| (none) | Functional on host (desktop: all; tablet/mobile: none unless combined with `@viewport`) | — |
| `@viewport` | Functional on tablet/mobile (and desktop) | — |
| `@aria` | Host (desktop project) | `*.yml` (`toMatchAriaSnapshot`) |
| `@visual` | LambdaTest | `*.png` (`toHaveScreenshot`) |

### LambdaTest tunnel

- Container **e2e-tunnel**; auto-start in `global-setup.js` unless `E2E_LAMBDATEST_TUNNEL_AUTO=0`.
- CI starts the tunnel with `npm run tunnel:e2e:start` and sets `E2E_LAMBDATEST_TUNNEL_AUTO=0` for the visual run.

### Visual testing pipeline (LambdaTest)

| Layer | File | Role |
|--------|------|------|
| Docker tunnel `e2e-tunnel` | [`lambdatest.js`](e2e/helpers/lambdatest.js), [`lambdatest-tunnel.mjs`](e2e/scripts/lambdatest-tunnel.mjs) | Remote browsers reach host wp-env via `host.docker.internal:8889` |
| Playwright `connect` | `playwright.config.js` when `E2E_LAMBDATEST=1` | Linux Chrome on LambdaTest |
| Request proxy | [`lambdatest-tunnel-proxy.js`](e2e/helpers/lambdatest-tunnel-proxy.js) | Routes remote requests to loopback wp-env when the tunnel path is flaky |
| URL rewrite + allowlist | [`e2e-seed-endpoint.php`](e2e/mu-plugins/e2e-seed-endpoint.php) | `X-E2E-Public-Origin`, asset URLs, block allowlist, front-end admin bar off, a11y-warnings script dequeued on frontend |
| Admin cookies | [`global-setup.js`](e2e/global-setup.js) | Host login, then remap storage state for tunnel host |
| Navigation | [`e2e-navigation.js`](e2e/helpers/e2e-navigation.js) | Rewrite seed permalinks for visual runs |

Committed **PNG** baselines must be produced on LambdaTest (`npm run test:e2e:visual:update`). Refresh all snapshot types with `npm run test:e2e:update`; after a failing run, `npm run test:e2e:update:last-failed` re-runs only failed snapshot tests.

### Editor preferences seed

`seed-editor-preferences.php` runs in wp-env `afterStart` only (not in Playwright global setup).

---

## Environment variables (quick reference)

| Variable | Typical value | Meaning |
|----------|----------------|---------|
| `WP_BASE_URL` | `http://127.0.0.1:8889/e2e-dept/` | Override Playwright default (department subsite) |
| `E2E_WPENV_EXTERNAL` | `1` | Skip Playwright `webServer`; use existing wp-env |
| `E2E_LAMBDATEST` | `1` | LambdaTest browser + tunnel base URL |
| `E2E_LAMBDATEST_TUNNEL_AUTO` | `0` / unset | `0` = do not auto-start tunnel |
| `E2E_LAMBDATEST_PLAYGROUND_URL` | optional | Default `http://host.docker.internal:8889/e2e-dept` |
| `LT_USERNAME`, `LT_ACCESS_KEY` | secrets | Required for `@visual` |
| `GITHUB_PAT`, `ACF_DOWNLOAD_URL` | CI / local | Private GitHub zips; ACF Pro zip download URL |

---

## CI (Azure DevOps — `azure-pipelines.yml` Test stage)

E2e runs in the shared **theme-ci** **Test** stage (`runTests: true`), which runs **before** **Build**. A failed Test stage skips Build and all **DeployTest_*** Kinsta stages.

**One-time ADO setup:** On the theme CI pipeline in ADO, configure **pipeline variables** `LT_USERNAME`, `LT_ACCESS_KEY`, `GITHUB_PAT` (private GitHub release zips), and `ACF_DOWNLOAD_URL` (ACF Pro license download URL; resolved to a mounted plugin directory). Do not add a root-level `variables:` block in `azure-pipelines.yml` when using `extends`.

**Test job flow** (see [`.azuredevops/e2e-test-steps.yml`](../.azuredevops/e2e-test-steps.yml)):

1. `build-base` + `npm run build` + `replacetokens` on `style.css` (Test job rebuilds the theme because wp-env needs a full checkout and `node_modules`, not the pruned Build artifact zip).
2. Playwright Chromium, `env:e2e:start` once.
3. `test:e2e:functional:external`.
4. `tunnel:e2e:start` + `test:e2e:visual` with `E2E_WPENV_EXTERNAL=1` and `E2E_LAMBDATEST_TUNNEL_AUTO=0`.
5. Stop tunnel and `env:e2e:stop` (always); publish JUnit from `artifacts/test-results/*.xml` (`functional-junit.xml`, `visual-junit.xml`). Playwright writes these only when `CI` or Azure `TF_BUILD` is set.

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
| npm scripts | `package.json` — run: `test:e2e`, `test:e2e:functional`, `test:e2e:aria`, `test:e2e:visual`; update: `test:e2e:update`, `test:e2e:aria:update`, `test:e2e:visual:update`, `test:e2e:update:last-failed`; `env:e2e:*`, `tunnel:e2e:*` |
| ADO e2e steps | `.azuredevops/e2e-test-steps.yml`, root `azure-pipelines.yml` |
