# BC "Sitka Spruce" Department Theme

## Required Plugins
This theme requires the following plugins to be installed and activated:
- [Advanced Custom Fields Pro](https://www.advancedcustomfields.com)
- [Breadcrumb Trail](https://wordpress.org/plugins/breadcrumb-trail/)
- OHO Views (Part of Bellevue 2022 Theme Plugins repo)
- Mayflower Blocks


## System Preparation

To build theme assets locally, you will need the following dependencies
installed on your development environment:

1. [NodeJS](https://nodejs.org) - Version **22+** (matches `@wordpress/scripts` and e2e test utils).
1. [npm](https://npm.community) - Version 10+.
1. [Composer](https://getcomposer.org) - Version 2.6+.
1. [FontAwesome Pro](https://fontawesome.com/) Key. Get the key from your FontAwesome
   account, and add it to your `.bashrc` or `.zshrc` file, in the format `export FONTAWESOME_KEY="MY KEY"`

Once these requirements are installed, you can install project dependencies via `composer install` and `npm install`.

## File Structure

- `assets/` - Built assents and static files
  - `assets/dist/` - Built assets (SCSS and JS). Folder contents not tracked in git, and are wiped on build.
  - `assets/img/` - Image files used in the theme
- `node_modules/` - NPM dependencies. Not tracked in git.
- `src/` - Source SCSS and JS files. Built to `assets/dist/`
  - `src/blocks/` - Block Editor Blocks bundled with the theme. Includes JS and SCSS specific to blocks. 
  - `src/controllers/` - PHP controller classes used to supply data to twig templates used by blocks
  - `src/library/` - PHP classes used for various utility functions
  - `src/scss/` - SCSS files used by the theme
    - `src/scss/blocks/` - SCSS files to style non-bundled blocks (aka Mayflower Blocks etc). Each are compiled to their own files in `assets/dist/scss/blocks/`
    - `src/scss/lib/` - Third-party libraries (gerillass, fontawesome). Bootstrap config lives in the `bc-theme-layer-bs5` npm package.
    - `src/scss/variables/` - SCSS variables used across other files
    - `src/scss/_block_styles.scss` - Does not output any SCSS, but provides basic setup needed to include variables etc in Block specific SCSS files.
- `stories/` - Twig stories, used by Blocks and Storybook
- `templates/` - WordPress HTML Page Templates
- `vendor/` - Composer dependencies. Not tracked in git.

## Build Commands
- `npm run build` - Build SCSS and JS using production settings
- `npm start` - Build SCSS and JS using dev settings, and watch for changes
- `npm run storybook` - Builds specified files in storybook (great for testing!)

## End-to-end tests

Block editor and frontend tests use [wp-env](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-env/) (Docker) and Playwright via `@wordpress/scripts`. E2e uses **multisite** on port **8889**; the Sitka department subsite is **`http://127.0.0.1:8889/e2e-dept/`** (Playwright default `baseURL`). The network main site is `http://127.0.0.1:8889` for Bellevue 2022 CPT data.

Agent-oriented details: [`tests/AGENTS.md`](tests/AGENTS.md).

Run `npm run build` before tests. Docker (or Podman with `docker` on your PATH) must be running.

**Local browser:** functional tests use the Google Chrome already installed on your computer (`channel: 'chrome'`). Azure Devops installs Playwright's Chromium in the pipeline.

**How tests run:** `playwright test` (not `wp-scripts test-playwright`). Config and admin REST auth still come from `@wordpress/scripts`; only the CLI entrypoint differs so `@wordpress/scripts` does not re-run `playwright install` on every invocation. Use **Playwright ≥1.61** with Node 22+.

**Recommended local workflow (two terminals):**

```bash
# Terminal 1 — leave wp-env running
npm run env:e2e:start

# Terminal 2 — does not start a second WordPress
npm run test:e2e:functional:external
```

Use `test:e2e:functional:external` whenever wp-env is already up. Set `E2E_WPENV_EXTERNAL=1` so Playwright skips its `webServer` (same subsite URL as above).

**Single-command runs:** `npm run test:e2e:functional` generates `.wp-env.e2e.json`, starts wp-env, then runs tests. The first boot can take several minutes while images download. Playwright waits for `[e2e] wp-env e2e ready` in the webServer log (not merely an open port), so global setup does not run before `wp-env start` finishes.

**If a run seems stuck:** run `npm run env:e2e:stop`, confirm port 8889 is free, and try one spec: `npm run test:e2e:functional -- --project=desktop tests/e2e/blocks/AnnouncementBanner.spec.js -g "inserts block"`.

### Plugins

E2e plugins are defined in [`tests/e2e/plugins.json`](tests/e2e/plugins.json) (committed). `npm run env:e2e:generate` resolves them into `.wp-env.e2e.json`. Remote zips are cached under `artifacts/e2e-plugins/`; use `GITHUB_PAT` or `GITHUB_TOKEN` for private GitHub assets.

To use local checkouts instead, copy [`tests/e2e/plugins.local.example.json`](tests/e2e/plugins.local.example.json) to `tests/e2e/plugins.local.json` (gitignored) and set `source: "local"` with a `path` relative to the theme root. Only plugins listed in that file use local paths; everything else stays remote.

Env path overrides still work: `MAYFLOWER_BLOCKS_PATH`, `OHO_VIEWS_PATH`, and `ACF_PATH` take precedence over `plugins.local.json`. Add new plugins by extending `plugins.json`; use `plugins.local.json` only when you need a machine-specific local path.

### Browsers

- **Functional and `@aria` tests** use Playwright Chromium on the host (macOS, Windows, or CI VM).
- **`@visual` screenshot tests** always use LambdaTest Linux Chrome. They require `LT_USERNAME` and `LT_ACCESS_KEY`. The tunnel named `e2e-tunnel` **starts automatically** during Playwright global setup unless you set `E2E_LAMBDATEST_TUNNEL_AUTO=0` (Azure sets that when the pipeline starts the tunnel itself).

Manual tunnel commands (debugging or when auto-start is off; export `LT_USERNAME` and `LT_ACCESS_KEY` first; Podman aliased to `docker` is fine):

```bash
npm run tunnel:e2e:start
curl http://127.0.0.1:8000/api/v1.0/info
npm run tunnel:e2e:stop
```

Equivalent `docker run` (built from the same flags as `npm run tunnel:e2e:start` in [`tests/e2e/helpers/lambdatest.js`](tests/e2e/helpers/lambdatest.js)):

```bash
docker run --rm -d --name e2e-tunnel -p 8000:8000 --add-host=host.docker.internal:host-gateway -e LT_USERNAME -e LT_ACCESS_KEY lambdatest/tunnel:latest --tunnelName e2e-tunnel --infoAPIPort 8000
```

**503 / `dial tcp [::1]:8889` on `@visual` tests:** LambdaTest browsers use `http://host.docker.internal:8889/e2e-dept` (not `127.0.0.1`) so the tunnel reaches wp-env on the host. Restart wp-env after mu-plugin changes. Override with `E2E_LAMBDATEST_PLAYGROUND_URL` if needed.

**Slow LambdaTest editor loads:** E2e unregisters `bc-sitka-spruce/*` blocks not listed in `BC_SITKA_E2E_ALLOWED_THEME_BLOCKS` in the e2e mu-plugin (see [`tests/AGENTS.md`](tests/AGENTS.md)). Only tag tests with `@visual` when they call `toHaveScreenshot`. Run `npm run build` so dist assets exist.

**Mayflower Blocks in CI:** [`tests/e2e/plugins.json`](tests/e2e/plugins.json) downloads release **v3.11** from GitHub. Locally you can still use `plugins.local.json` or `MAYFLOWER_BLOCKS_PATH`.

**Visual / snapshot runs stall or fail with `api.lambdatest.com` / `ConnectTimeoutError`:** `@visual` tests need outbound HTTPS to LambdaTest. If the tunnel is not running, start it with the commands above. See [LambdaTest docker tunnel docs](https://www.lambdatest.com/support/docs/docker-tunnel/).

### Commands

```bash
npm run test:e2e
npm run test:e2e -- --project=desktop tests/e2e/blocks/PostsFeature.spec.js
```

`npm run test:e2e` runs functional tests on the host, then `@visual` tests on LambdaTest. **Desktop** runs the full functional suite; **tablet and mobile** run only `@viewport` breakpoint tests plus all `@visual` screenshots (see `tests/AGENTS.md`).

| Command | Purpose |
|---------|---------|
| `npm run test:e2e:functional` | Non-visual tests (includes `@aria`) |
| `npm run test:e2e:functional:external` | Same when wp-env is already running |
| `npm run test:e2e:aria` | `@aria` accessibility-tree snapshots only (host) |
| `npm run test:e2e:visual` | `@visual` screenshot tests (LambdaTest) |
| `npm run test:e2e` | Functional, then visual (full suite) |

**Update snapshot baselines** (uses `--update-snapshots=changed` — only writes files that differ):

| Command | Purpose |
|---------|---------|
| `npm run test:e2e:aria:update` | Refresh `*.yml` ARIA baselines on the host |
| `npm run test:e2e:visual:update` | Refresh `*.png` baselines on LambdaTest |
| `npm run test:e2e:update` | ARIA update, then visual update (needs LambdaTest for the second step) |
| `npm run test:e2e:update:last-failed` | Update only tests that **failed** on the previous run (see workflow below) |
| `npm run test:e2e:aria:update:last-failed` / `test:e2e:visual:update:last-failed` | Same, scoped to `@aria` or `@visual` |

`npm run test:e2e:update-snapshots` is a deprecated alias for `test:e2e:visual:update`.

**Incremental snapshot workflow:** run `test:e2e:functional`, `test:e2e:aria`, or `test:e2e:visual` first; then `npm run test:e2e:update:last-failed` to re-run and accept baselines for failed tests only. To update one spec: `npm run test:e2e:aria:update -- tests/e2e/pages/Foo.spec.js`.

- `npm run test:e2e:ui` / `test:e2e:debug` — functional tests only (interactive)

Optional environment variables: `ACF_DOWNLOAD_URL`, `GITHUB_PAT`, `BUILD_ID` (LambdaTest build label), `E2E_LAMBDATEST_TUNNEL_AUTO` (`0` disables auto-starting the tunnel in global setup).

Commit updated `__snapshots__/*.png` files when visual baselines change. Commit updated `__snapshots__/*.yml` files when ARIA tree baselines change.

### Coverage (legacy Nightwatch → Playwright)

Nightwatch VRT against Kinsta QA has been removed. Equivalent coverage on wp-env:

| Former Nightwatch target | Playwright replacement |
|--------------------------|-------------------------|
| Homepage header/footer/menu | [`tests/e2e/layout/HeaderFooter.spec.js`](tests/e2e/layout/HeaderFooter.spec.js) — `@visual`, `@aria`, axe |
| Homepage sock | Same file — functional + **sock `@visual`** |
| Division homepage sections | [`tests/e2e/pages/DivisionHomepage.spec.js`](tests/e2e/pages/DivisionHomepage.spec.js) — section order, full-page `@visual`, `@aria` |
| Flexible page full page | [`tests/e2e/pages/FlexiblePage.spec.js`](tests/e2e/pages/FlexiblePage.spec.js) — full-page `@visual` |
| Flexible page per-block VRT (~40 tests) | Same file — targeted sectional `@visual` (tabs, narrow content, Mayflower row/panel) + functional assertions; seed markup in [`tests/fixtures/e2e-flexible-page-content.php`](tests/fixtures/e2e-flexible-page-content.php) |
| Announcement banner | [`tests/e2e/blocks/AnnouncementBanner.spec.js`](tests/e2e/blocks/AnnouncementBanner.spec.js) (tier 2; see block tiers in [`tests/AGENTS.md`](tests/AGENTS.md)) |
| Block editor / posts | [`tests/e2e/blocks/PostsFeature.spec.js`](tests/e2e/blocks/PostsFeature.spec.js) |
| Other templates | [`tests/e2e/pages/*.spec.js`](tests/e2e/pages/) |

## Documentation

### Adding styles to a non-bundled block (aka from Core or Mayflower Bocks)
1. Create a new SCSS file in `src/scss/blocks`, using the naming convention `[namespace]-[block-name].scss`. Example: `mayflower-blocks/alert` would be `mayflower-blocks-alert.scss`
  - If you are adding Bootstrap styles to a block, within the block SCSS file first import `block-styles`, then the shared preset for that component. For example:

  ```scss
  @import '/src/scss/block-styles';
  @import 'bc-theme-layer-bs5/scss/presets/_alert';

  // any other styles here!
  ```

  Bootstrap configuration is provided by the shared `bc-theme-layer-bs5` package. Theme `bootstrap.scss` imports `bootstrap/_config` plus `presets/_minimal`; block bundles can import individual presets from `bc-theme-layer-bs5/scss/presets/`.

2. In `webpack.config.js`, add a new entry point, setting the `block` flag to `true`, and passing in the file name without the extension. Example: `...scssEntryPoint( 'mayflower-blocks-alert', true ),`
3. In `functions.php`, enqueue the style by adding the block to the array within the `enqueue_block_styles()` function

### Block stylesheets - where they live, and why

Styles for blocks live in two different places, depending on if they are blocks that are bundled with this theme, or if they are blocks that are part of a plugin like Mayflower Blocks. 

- For bundled blocks, the styles are with the block definition, in `src/blocks/[block-name]/style.scss` and `src/blocks/[block-name]/editor.scss`
- For external blocks and core blocks, theme provided styles are in `src/scss/blocks`, with the naming convention of `namespace-name.scss`
- For block-specific styles that are loaded globally (not sure why this would be needed, but just in case), they are also in `src/scss/blocks`, but the file names are proceeded by a `_`, aka `_namespace-name.scss`, to indicate that they are partial files.

### Registering a Bundled Block

Some Block Editor blocks are bundled as part of the theme. These blocks are located in `src/blocks/[block-name]`

Each block folder should include a `block.json` that defines the block and calls any stylesheets, render files, and scripts. 

Once the block has been created, ensure that it is registered in `functions.php`

### Running visual regression tests

| Stack | Target | Command |
|-------|--------|---------|
| **Playwright (full suite)** | Functional on host + visual on LambdaTest | `npm run test:e2e` |
| **Playwright visual** | Screenshot baselines on LambdaTest | `npm run test:e2e:visual` |
| **Refresh all snapshots** | ARIA on host + PNG on LambdaTest | `npm run test:e2e:update` |
| **CI (Azure)** | Same as full suite with external wp-env | See [`.azuredevops/e2e-test-steps.yml`](.azuredevops/e2e-test-steps.yml) |
