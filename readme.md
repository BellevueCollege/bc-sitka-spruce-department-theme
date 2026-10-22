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

1. [NodeJS](https://nodejs.org) - Version **26.x** (see `.nvmrc`; CI uses **26.x**; `package.json` `engines` also allow 22.22+ / 24.15+).
1. [npm](https://npm.community) - Version **12+** (`npm install -g npm@12`). Project `.npmrc` sets `allow-git=root` (required on npm 12). GitHub-hosted dependencies (`bc-lightbox-modal`, `bc-theme-layer-bs5`) also need `GITHUB_PAT` with `repo` read access when you run `npm install` (Azure DevOps sets this on the Test job).
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

The e2e suite runs [Playwright](https://playwright.dev) against a disposable WordPress multisite started by [wp-env](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-env/) in containers.

- **Department subsite (tests run here):** `http://127.0.0.1:8889/e2e-dept/`
- **Network main site** (holds Bellevue 2022 programs, news, etc.): `http://127.0.0.1:8889`
- **Login:** `admin` / `password`

There are three kinds of tests:

| Kind | Tag | Runs in | Compares against |
|------|-----|---------|------------------|
| Functional | (none) | Google Chrome on your computer | Assertions in the spec |
| Accessibility tree | `@aria` | Google Chrome on your computer | `__snapshots__/*.yml` |
| Visual | `@visual` | LambdaTest Linux Chrome (remote) | `__snapshots__/*.png` |

Visual tests run remotely so every developer and CI produce identical screenshots regardless of operating system or installed fonts.

Desktop runs every test. Tablet and mobile run only tests tagged `@viewport` plus all `@visual` screenshots.

### One-time setup

1. **Install a container runtime:** [Rancher Desktop](https://rancherdesktop.io) is the recommended option (enable the Docker CLI / `dockerd` engine so `docker` is on your PATH). [Podman](https://podman.io) with `docker` aliased to `podman` also works. The runtime must be running whenever you test.
2. **Install Google Chrome.** Local tests use your installed Chrome, not a Playwright-downloaded browser.
3. **Install and build the theme:** `npm install` then `npm run build`. Re-run `npm run build` whenever you change theme source; tests use `assets/dist/`.
4. **Point the suite at the plugins.** ACF Pro and several Bellevue plugins are required. Pick one:
   - **Local checkouts (recommended):** copy [`tests/e2e/plugins.local.example.json`](tests/e2e/plugins.local.example.json) to `tests/e2e/plugins.local.json` and adjust each `path` (relative to this theme folder). This file is gitignored.
   - **Downloads:** set `ACF_DOWNLOAD_URL` (your ACF Pro license download link) and `GITHUB_PAT` (a GitHub token that can read the private BellevueCollege plugin repos).
5. **Main-site Bellevue 2022 theme:** On first `env:e2e:start`, the suite downloads the theme release zip from [`tests/e2e/themes.json`](tests/e2e/themes.json) using `GITHUB_PAT` (same as Bellevue plugins). For a local checkout instead, copy [`tests/e2e/themes.local.example.json`](tests/e2e/themes.local.example.json) to `themes.local.json`, or set `BELLEVUE_2022_THEME_PATH`. E2e activates Bellevue on the **main** multisite site; the department subsite uses this Sitka theme.
6. **For visual tests only:** add your LambdaTest credentials to your shell profile:

   ```bash
   export LT_USERNAME="your-username"
   export LT_ACCESS_KEY="your-access-key"
   ```

### Running tests

Keep WordPress running in one terminal and run tests in another. This avoids restarting WordPress for every run.

```bash
# Terminal 1: start WordPress (first start downloads images and can take several minutes)
npm run env:e2e:start

# Terminal 2: run tests against the running WordPress
npm run test:e2e:functional:external
```

When you're finished, stop WordPress with `npm run env:e2e:stop`. To delete the containers, database, and environment images, run `npm run env:e2e:destroy`, then `npm run env:e2e:start`.

| Command | What it runs |
|---------|--------------|
| `npm run test:e2e:functional:external` | Functional and `@aria` tests (WordPress already running) |
| `npm run test:e2e:functional` | Same, but starts WordPress first if needed |
| `npm run test:e2e:aria` | Only `@aria` tests |
| `npm run test:e2e:visual` | Only `@visual` tests on LambdaTest (expects wp-env already running; same as CI) |
| `npm run test:e2e:visual:local` | Only `@visual` tests, on your local Chrome (see below) |
| `npm run test:e2e:visual:with-webserver` | `@visual` on LambdaTest while Playwright starts wp-env (legacy; prefer external wp-env + `test:e2e:visual`) |
| `npm run test:e2e` | Functional, then visual — the full suite |
| `npm run test:e2e:ui` | Functional tests in Playwright's interactive UI |
| `npm run test:e2e:debug` | Functional tests with the Playwright inspector |
| `npm run env:e2e:destroy` | Delete the e2e containers, database, and environment images (`wp-env destroy --force`) |

Narrow a run by appending Playwright arguments after `--`:

```bash
# One spec file, desktop only
npm run test:e2e:functional:external -- --project=desktop tests/e2e/blocks/PostsFeature.spec.js

# Tests whose name matches some text
npm run test:e2e:functional:external -- -g "inserts block"
```

### Running visual tests on local Chrome

`npm run test:e2e:visual:local` runs the `@visual` tests in your own Chrome instead of on LambdaTest. Use it to debug a layout without spending LambdaTest minutes, or when LambdaTest is unavailable. It needs no tunnel or LambdaTest credentials.

Some screenshots may **fail** this way even when nothing is wrong. The committed baselines come from LambdaTest Linux Chrome, and your computer can render fonts and spacing slightly differently. When a test fails, Playwright writes the expected, actual, and diff images to `artifacts/test-results/`.

**Never commit baselines produced locally.** Don't pass `--update-snapshots` to this command. If you do by accident, discard the changes:

```bash
git checkout -- 'tests/e2e/**/__snapshots__/*.png'
```

### Updating snapshots

When a change to the theme intentionally alters a page, update the baselines and commit the changed files in `__snapshots__/`.

| Command | What it updates |
|---------|-----------------|
| `npm run test:e2e:aria:update` | `@aria` `*.yml` baselines |
| `npm run test:e2e:visual:ci-match` | Run `@visual` against LambdaTest with `E2E_STRICT_PLUGINS=1` + pinned Chrome (no snapshot write; use after a fresh strict `env:e2e:start`) |
| `npm run test:e2e:visual:update` | `@visual` `*.png` baselines on LambdaTest (allowed in CI; blocked locally unless you opt in) |
| `npm run test:e2e:visual:update:ci-match` | Local baseline refresh with `E2E_STRICT_PLUGINS=1` + explicit allow flag (tunnel + credentials required) |
| `npm run test:e2e:update` | Both of the above |
| `npm run test:e2e:update:last-failed` | Only tests that failed on your previous run |

Update commands only rewrite files that actually changed. To update a single spec, append it: `npm run test:e2e:aria:update -- tests/e2e/pages/Blog.spec.js`.

A typical loop is to run the tests, review the failures, then run `npm run test:e2e:update:last-failed` to accept only those.

### Pull request checklist (visual / e2e)

Copy into the PR description when the change can affect screenshots, seeds, plugins, or Playwright config.

- [ ] **Azure Test stage** (or local `npm run test:e2e:ci` with tunnel + secrets) is green, or the failure is explained and unrelated.
- [ ] Any new or changed `tests/e2e/**/__snapshots__/*.png` were produced on **LambdaTest Linux Chrome** (`test:e2e:visual:update` in CI, or `test:e2e:visual:update:ci-match` locally)—not `test:e2e:visual:local`.
- [ ] Baseline updates used **catalog plugin zips** (`E2E_STRICT_PLUGINS=1` in CI; same for `test:e2e:visual:update:ci-match`). No accidental commits from `plugins.local.json` or `MAYFLOWER_BLOCKS_PATH`-style mounts.
- [ ] PR describes **why** pixels changed (theme, block, plugin version in `plugins.json`, seed content, editor prefs, etc.).
- [ ] Partial PNG updates are intentional; if many unrelated snapshots changed, prefer a dedicated baseline-refresh PR or the pipeline template in [`.azuredevops/e2e-visual-baseline-update-steps.yml`](.azuredevops/e2e-visual-baseline-update-steps.yml).
- [ ] Did **not** loosen `maxDiffPixelRatio`. [`tests/e2e/helpers/screenshot-stability.css`](tests/e2e/helpers/screenshot-stability.css) changes are limited to scrollbar hiding or documented subpixel allowlist pins (not generic layout masks).
- [ ] `@aria` `*.yml` snapshots updated when accessibility tree output changed (`npm run test:e2e:aria:update`).
- [ ] Plugin catalog / mu-plugin / seed PHP changes: reviewers know to run `env:e2e:start`, which resets the database and reseeds. Use `npm run env:e2e:destroy` only when the image or plugin install is broken (see Troubleshooting).

### Bumping the pinned LambdaTest Chrome version

Bump the pin only when LambdaTest’s default Linux Chrome moves and you are ready to **refresh all PNG baselines** in the same PR (or immediately after).

1. **Discover the session version** (tunnel + `LT_*` credentials):

   ```bash
   npm run tunnel:e2e:start
   node tests/e2e/scripts/print-lambdatest-chrome-version.mjs
   ```

   Use the major.minor segment LambdaTest reports (for example `154.0.6367.60` → pin `154.0`).

2. **Update the pin in three places** (keep them identical):

   | Location | Field |
   |----------|--------|
   | [`tests/e2e/helpers/lambdatest.js`](tests/e2e/helpers/lambdatest.js) | `DEFAULT_LAMBDATEST_CHROME_VERSION` |
   | [`.azuredevops/e2e-test-steps.yml`](.azuredevops/e2e-test-steps.yml) | `E2E_LAMBDATEST_CHROME_VERSION` on the visual step |
   | [`.azuredevops/e2e-visual-baseline-update-steps.yml`](.azuredevops/e2e-visual-baseline-update-steps.yml) | same |

3. **Regenerate every `@visual` PNG** on LambdaTest with strict plugins:

   - **CI:** run a pipeline using `e2e-visual-baseline-update-steps.yml`, download artifact `e2e-visual-baselines`, commit `__snapshots__`.
   - **Local:** `npm run env:e2e:start` with `E2E_STRICT_PLUGINS=1`, tunnel up, then `npm run test:e2e:visual:update:ci-match` (full suite; expect a large diff).

4. **Verify stability:** run `npm run test:e2e:visual` twice back-to-back (wp-env already running + tunnel); both runs should pass with no snapshot writes.

5. **PR:** use the checklist above; call out Chrome bump + baseline refresh in the summary. Do not merge a pin change without the matching PNG commit.

### Changing which plugins are used

Plugins are listed in [`tests/e2e/plugins.json`](tests/e2e/plugins.json). Your `tests/e2e/plugins.local.json` overrides any plugin with a local folder. You can also point a single plugin at a folder with `MAYFLOWER_BLOCKS_PATH`, `OHO_VIEWS_PATH`, or `ACF_PATH`, which win over both files. CI and `npm run test:e2e:visual:update:ci-match` set `E2E_STRICT_PLUGINS=1` so only catalog release zips are used (local overrides are ignored).

WordPress only picks up plugin changes on a fresh start. After editing either file:

```bash
npm run env:e2e:stop
npm run env:e2e:start
```

### Troubleshooting

When a test fails, open `artifacts/test-results/<test-name>/error-context.md` for the full error, plus screenshots and traces in the same folder.

**Tests fail instantly (0 ms) without running.** The browser never started. Read the `error-context.md` for that test. It usually points to one of the LambdaTest or container-runtime problems below.

**Seed content looks stale after a fixture edit.** Run `npm run env:e2e:start` again. It keeps the containers, runs `wp-env reset`, and reseeds both sites. `npm run test:e2e` also starts the environment again before the visual suite.

**Changes to plugins, `plugins.local.json`, or the e2e mu-plugin have no effect.** `env:e2e:start` reuses running containers. Stop and start it again (see above) so wp-env rebuilds mounted plugins.

**WordPress is broken, seeding fails, or errors mention a missing plugin function** (for example `Call to undefined function update_field()`, meaning ACF didn't load). Rebuild WordPress from scratch. This deletes the test database and containers. Everything is re-created and re-seeded on start.

**Pathway or program template fatals after infra changes** (for example Twig errors on `pathway_names`). The main site must run the Bellevue 2022 theme (release zip or local checkout). After changing `tests/e2e/themes.json` or theme overrides, run `npm run env:e2e:start` so reset and after-start activate Bellevue on the main site and reseed core content. Destroy wp-env only when the theme image or catalog zip itself must be replaced.

**Sanity-check main + subsite after start:** `npm run env:e2e:verify` (Bellevue theme on main, pathway CPT/ACF, Sitka on `/e2e-dept`, program fixture). This runs automatically at the end of `env:e2e:start` and in Azure DevOps before Playwright.

```bash
npm run env:e2e:destroy
rm -rf artifacts/e2e-plugins   # optional: force plugin zips to download again
npm run env:e2e:start
```

`env:e2e:destroy` writes `.wp-env.e2e.json` if needed, then runs `wp-env destroy --force`. It removes containers, the database volume, and this environment's images. The next start has to download those images again.

On Windows PowerShell, remove the plugin cache with `Remove-Item -Recurse -Force artifacts/e2e-plugins` (not `rm -rf`).

**`mariadb:lts` pull fails / `production.cloudfront.docker.com: no such host` after destroy.** `wp-env destroy` deletes local WordPress and MariaDB images; the next start must download them from Docker Hub. That error is almost always **DNS or VPN** (Docker or Rancher Desktop cannot resolve CloudFront). Confirm the host resolves names (`nslookup production.cloudfront.docker.com`). Fix network DNS, disconnect VPN briefly, or pull on a working connection: `docker pull mariadb:lts`, then `npm run env:e2e:start`. Prefer `env:e2e:stop` + `env:e2e:start` over destroy when you only need a restart.

**Rancher Desktop or Podman itself is stuck** (wp-env hangs on start, containers won't stop, "port 8889 already in use" with nothing running, disk full). Recreate the container VM. This removes **all** containers and images on your machine, so the next start takes several minutes.

- **Rancher Desktop:** open the app → **Troubleshooting** (or Preferences → Troubleshooting) → **Factory Reset**, then start Rancher Desktop again and wait until Kubernetes/containers are ready.
- **Podman:**

  ```bash
  podman machine stop
  podman machine rm
  podman machine init --cpus 4 --memory 8192
  podman machine start
  ```

Then rebuild WordPress with the commands in the previous item.

**Visual tests fail with `422 ... Lifetime Minutes Exhausted for desktop-automation`.** LambdaTest refused the session. Our subscription is **Web Automation on Desktop — Linux**, so tests must request Linux Chrome. Requesting Windows, macOS, or Playwright's bundled `pw-chromium` uses a different pool with no minutes. The settings live in [`tests/e2e/helpers/lambdatest.js`](tests/e2e/helpers/lambdatest.js). If those are still Linux Chrome, the Linux minutes are used up. Check usage in the LambdaTest dashboard, and use `npm run test:e2e:visual:local` to keep working in the meantime.

**Visual tests show `503` or `dial tcp [::1]:8889`, or hang connecting to LambdaTest.** The LambdaTest tunnel can't reach WordPress. Visual tests start the tunnel automatically, but a stale tunnel container can linger. Restart it and check it responds:

```bash
npm run tunnel:e2e:stop
npm run tunnel:e2e:start
curl http://127.0.0.1:8000/api/v1.0/info
```

If it still fails, confirm `LT_USERNAME` and `LT_ACCESS_KEY` are set in that terminal, and that your network allows HTTPS to `*.lambdatest.com`.

**Tunnel name conflicts (CI timeout or “tunnel already in use”).** Locally the default name is `e2e-tunnel-dev`. Azure uses a unique `E2E_LAMBDATEST_TUNNEL_NAME` per build (`e2e-tunnel-ado-<BuildId>`). If another local session holds `e2e-tunnel-dev`, run `npm run tunnel:e2e:stop`, or set a personal name for both start and the visual run, for example `E2E_LAMBDATEST_TUNNEL_NAME=e2e-tunnel-$USER`.

**A screenshot fails on size or pixels.** Visual tests use LambdaTest Linux Chrome with a pinned version (`E2E_LAMBDATEST_CHROME_VERSION`) and a screenshot-only stylesheet that hides scrollbars so width does not flip mid-capture (for example `1280` vs `1265`). If the log shows that width flip within one test, the stability stylesheet is not applied. If width is stable but pixels differ, re-run once; when the failure is consistent and the page looks correct on LambdaTest, update baselines with `npm run test:e2e:visual:update` (not `test:e2e:visual:local`). Do not loosen `maxDiffPixelRatio` for height-only mismatches on full pages.

**Visual test fails with `page.goto: Timeout … host.docker.internal:8889` (often on Windows).** LambdaTest reaches WordPress through the tunnel Docker container and `host.docker.internal`. Confirm wp-env responds on the host (`curl http://127.0.0.1:8889/e2e-dept/`) and the tunnel info API works (`curl http://127.0.0.1:8000/api/v1.0/info`). Use **Docker Desktop** (not only WSL) for the tunnel if wp-env runs on Windows. `visitIntegrationPage` retries transient navigation timeouts automatically; re-run the failing spec if needed.

**A private plugin download fails with 404.** Your `GITHUB_PAT` can't read that repository. Check that the token has access, and that it's authorized for the BellevueCollege organization's SSO. Set `E2E_DEBUG=1` to print details about the token used.

### Environment variables

| Variable | Purpose |
|----------|---------|
| `LT_USERNAME`, `LT_ACCESS_KEY` | LambdaTest credentials (required for LambdaTest visual runs) |
| `ACF_DOWNLOAD_URL` | ACF Pro license download link, when not using a local ACF folder |
| `GITHUB_PAT` | GitHub token for private plugin downloads |
| `BELLEVUE_2022_THEME_PATH` | Local Bellevue 2022 theme folder (ignored when `E2E_STRICT_PLUGINS=1`; otherwise release zip from `themes.json`) |
| `MAYFLOWER_BLOCKS_PATH`, `OHO_VIEWS_PATH`, `ACF_PATH` | Use a local folder for that plugin (ignored when `E2E_STRICT_PLUGINS=1`) |
| `E2E_STRICT_PLUGINS` | Set to `1` to match CI plugin zips (no local path overrides) |
| `E2E_WPENV_EXTERNAL` | Set to `1` when wp-env is already running (`test:e2e:visual` sets this) |
| `E2E_ALLOW_VISUAL_BASELINE_UPDATE` | Set to `1` to allow local LambdaTest `--update-snapshots` (see `test:e2e:visual:update:ci-match`) |
| `E2E_LAMBDATEST_CHROME_VERSION` | Override the pinned LambdaTest Chrome version (repo default in `tests/e2e/helpers/lambdatest.js`) |
| `E2E_LAMBDATEST_TUNNEL_AUTO` | Set to `0` to stop visual tests from starting the tunnel themselves |
| `E2E_LAMBDATEST_TUNNEL_NAME` | Docker + LambdaTest tunnel name (default `e2e-tunnel-dev`; CI uses `e2e-tunnel-ado-<BuildId>`) |
| `E2E_DEBUG` | Set to `1` for verbose plugin-download logging |
| `E2E_DEBUG_SCREENSHOT_GEOMETRY` | Set to `1` to log element/image boxes before certain `@visual` captures (Announcement Banner / Posts Feature) |

### Continuous integration

Azure DevOps runs the full suite in the **Test** stage of the theme pipeline, before **Build**. If any test fails, the build and every deployment are skipped. Results appear on the pipeline run's **Tests** tab. Screenshots and traces for failures are attached as the `e2e-artifacts` pipeline artifact.

The pipeline needs these variables set in Azure DevOps: `LT_USERNAME`, `LT_ACCESS_KEY`, `GITHUB_PAT`, and `ACF_DOWNLOAD_URL`. The steps live in [`.azuredevops/e2e-test-steps.yml`](.azuredevops/e2e-test-steps.yml).

To re-run only the tests, queue the pipeline manually and select the **Test** stage.

### Writing new tests

Specs live under `tests/e2e/` (pages, blocks, layout). Reuse helpers in `tests/e2e/helpers/`. Tag screenshot tests with `@visual` (LambdaTest PNG baselines) or `@aria` (accessibility snapshots on host Chromium). Use `@viewport` only when behavior differs by breakpoint. Block-level `@visual` runs on desktop only; page-level visual tests run desktop, tablet, and mobile. Seed data and WP-CLI fixtures are under `tests/fixtures/`.

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
