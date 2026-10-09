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
5. **For visual tests only:** add your LambdaTest credentials to your shell profile:

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

When you're finished, stop WordPress with `npm run env:e2e:stop`.

| Command | What it runs |
|---------|--------------|
| `npm run test:e2e:functional:external` | Functional and `@aria` tests (WordPress already running) |
| `npm run test:e2e:functional` | Same, but starts WordPress first if needed |
| `npm run test:e2e:aria` | Only `@aria` tests |
| `npm run test:e2e:visual` | Only `@visual` tests, on LambdaTest |
| `npm run test:e2e:visual:local` | Only `@visual` tests, on your local Chrome (see below) |
| `npm run test:e2e` | Functional, then visual — the full suite |
| `npm run test:e2e:ui` | Functional tests in Playwright's interactive UI |
| `npm run test:e2e:debug` | Functional tests with the Playwright inspector |

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
| `npm run test:e2e:visual:update` | `@visual` `*.png` baselines, on LambdaTest |
| `npm run test:e2e:update` | Both of the above |
| `npm run test:e2e:update:last-failed` | Only tests that failed on your previous run |

Update commands only rewrite files that actually changed. To update a single spec, append it: `npm run test:e2e:aria:update -- tests/e2e/pages/Blog.spec.js`.

A typical loop is to run the tests, review the failures, then run `npm run test:e2e:update:last-failed` to accept only those.

### Changing which plugins are used

Plugins are listed in [`tests/e2e/plugins.json`](tests/e2e/plugins.json). Your `tests/e2e/plugins.local.json` overrides any plugin with a local folder. You can also point a single plugin at a folder with `MAYFLOWER_BLOCKS_PATH`, `OHO_VIEWS_PATH`, or `ACF_PATH`, which win over both files.

WordPress only picks up plugin changes on a fresh start. After editing either file:

```bash
npm run env:e2e:stop
npm run env:e2e:start
```

### Troubleshooting

When a test fails, open `artifacts/test-results/<test-name>/error-context.md` for the full error, plus screenshots and traces in the same folder.

**Tests fail instantly (0 ms) without running.** The browser never started. Read the `error-context.md` for that test. It usually points to one of the LambdaTest or container-runtime problems below.

**Changes to plugins, `plugins.local.json`, or the e2e mu-plugin have no effect.** `env:e2e:start` reuses a running WordPress. Stop and start it again (see above).

**WordPress is broken, seeding fails, or errors mention a missing plugin function** (for example `Call to undefined function update_field()`, meaning ACF didn't load). Rebuild WordPress from scratch. This deletes the test database and containers. Everything is re-created and re-seeded on start.

```bash
npm run env:e2e:stop
npx wp-env destroy --config=.wp-env.e2e.json --force
rm -rf artifacts/e2e-plugins   # optional: force plugin zips to download again
npm run env:e2e:start
```

If the destroy command complains that `.wp-env.e2e.json` is missing, run `npm run env:e2e:generate` first.

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

**A screenshot fails by a pixel or two in height** (for example `Expected 1265×643, received 1265×644`). Re-run the test once; small layout timing differences happen. If it fails consistently, the page really changed. Update the baseline with `npm run test:e2e:visual:update`.

**A private plugin download fails with 404.** Your `GITHUB_PAT` can't read that repository. Check that the token has access, and that it's authorized for the BellevueCollege organization's SSO. Set `E2E_DEBUG=1` to print details about the token used.

### Environment variables

| Variable | Purpose |
|----------|---------|
| `LT_USERNAME`, `LT_ACCESS_KEY` | LambdaTest credentials (required for LambdaTest visual runs) |
| `ACF_DOWNLOAD_URL` | ACF Pro license download link, when not using a local ACF folder |
| `GITHUB_PAT` | GitHub token for private plugin downloads |
| `MAYFLOWER_BLOCKS_PATH`, `OHO_VIEWS_PATH`, `ACF_PATH` | Use a local folder for that plugin |
| `E2E_LAMBDATEST_CHROME_VERSION` | Pin the LambdaTest Chrome version (default: latest) |
| `E2E_LAMBDATEST_TUNNEL_AUTO` | Set to `0` to stop visual tests from starting the tunnel themselves |
| `E2E_DEBUG` | Set to `1` for verbose plugin-download logging |

### Continuous integration

Azure DevOps runs the full suite in the **Test** stage of the theme pipeline, before **Build**. If any test fails, the build and every deployment are skipped. Results appear on the pipeline run's **Tests** tab. Screenshots and traces for failures are attached as the `e2e-artifacts` pipeline artifact.

The pipeline needs these variables set in Azure DevOps: `LT_USERNAME`, `LT_ACCESS_KEY`, `GITHUB_PAT`, and `ACF_DOWNLOAD_URL`. The steps live in [`.azuredevops/e2e-test-steps.yml`](.azuredevops/e2e-test-steps.yml).

To re-run only the tests, queue the pipeline manually and select the **Test** stage.

### Writing new tests

Conventions for specs, seed data, tags, and viewports are in [`tests/AGENTS.md`](tests/AGENTS.md).

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
