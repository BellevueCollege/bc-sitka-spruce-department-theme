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

Playwright drives a disposable WordPress multisite that [wp-env](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-env/) runs in containers.

- **Department site (where tests run):** `http://127.0.0.1:8889/e2e-dept/`
- **Main site** (Bellevue 2022 programs, news, and the other college content): `http://127.0.0.1:8889`
- **Login:** `admin` / `password`

| Kind | Tag | Browser | Saved result |
|------|-----|---------|--------------|
| Functional | (none) | Chrome on your computer | Assertions in the spec |
| Accessibility | `@aria` | Chrome on your computer | `tests/e2e/**/__snapshots__/*.yml` |
| Screenshot | `@visual` | LambdaTest Linux Chrome | `tests/e2e/**/__snapshots__/*.png` |

Screenshot tests run on LambdaTest so your machine and Azure capture the same pixels. Functional and accessibility tests stay on your computer.

Desktop runs every test. Tablet and mobile run breakpoint tests (`@viewport`) and every screenshot test.

Every `npm run test:e2e:*` command below expects WordPress to be running already, unless the command name ends in `:start-env` or the description says the command starts WordPress itself.

### One-time setup

1. **Install a container runtime.** [Rancher Desktop](https://rancherdesktop.io) is the recommended option. Turn on the Docker CLI (`dockerd`) so `docker` is on your PATH. [Podman](https://podman.io) also works when `docker` is aliased to `podman`. Leave the runtime running while you test.
2. **Install Google Chrome.** Local tests use that Chrome.
3. **Install and build the theme:** `npm install`, then `npm run build`. Run `npm run build` again whenever you change theme source. Tests load `assets/dist/`.
4. **Give the suite its plugins.** ACF Pro and several Bellevue plugins are required. Use one of these:
   - **Folders on your machine (usual choice):** copy [`tests/e2e/plugins.local.example.json`](tests/e2e/plugins.local.example.json) to `tests/e2e/plugins.local.json` and set each `path` relative to this theme. That file is gitignored.
   - **Downloads:** set `ACF_DOWNLOAD_URL` (your ACF Pro license link) and `GITHUB_PAT` (a GitHub token that can read the private BellevueCollege plugin repos).
5. **Main-site theme.** The first `npm run env:e2e:start` downloads the Bellevue 2022 release listed in [`tests/e2e/themes.json`](tests/e2e/themes.json), using `GITHUB_PAT`. For a local checkout, copy [`tests/e2e/themes.local.example.json`](tests/e2e/themes.local.example.json) to `themes.local.json`, or set `BELLEVUE_2022_THEME_PATH`. Bellevue runs on the main site. This Sitka theme runs on the department site.
6. **LambdaTest, only if you will run screenshot tests.** Add these to your shell profile:

   ```bash
   export LT_USERNAME="your-username"
   export LT_ACCESS_KEY="your-access-key"
   ```

### Running tests

Leave WordPress up in one terminal and run tests in another.

```bash
# Terminal 1. The first start downloads images and can take several minutes.
npm run env:e2e:start

# Terminal 2
npm run test:e2e:functional
```

`npm run env:e2e:start` resets the database, loads sample content, and checks both sites. Run `npm run env:e2e:verify` when you want that check again without another reset. When you are finished, stop WordPress with `npm run env:e2e:stop`. Wiping the containers is covered under [Troubleshooting](#troubleshooting).

| Command | What you get |
|---------|--------------|
| `npm run test:e2e:functional` | Functional and accessibility tests, in your Chrome |
| `npm run test:e2e:aria` | Accessibility tests only |
| `npm run test:e2e:visual` | Screenshot tests on LambdaTest. Starts the LambdaTest tunnel when it is not already running |
| `npm run test:e2e:visual:local` | The same screenshot tests, in your Chrome. See [Screenshot tests in your own Chrome](#screenshot-tests-in-your-own-chrome) |
| `npm run test:e2e:ui` | Functional tests in Playwright's interactive window |
| `npm run test:e2e:debug` | Functional tests with the Playwright inspector |
| `npm run test:e2e` | Starts WordPress, runs functional tests, reseeds, then runs LambdaTest screenshot tests |

To run one file or one name, put Playwright arguments after `--`:

```bash
npm run test:e2e:functional -- --project=desktop tests/e2e/blocks/PostsFeature.spec.js
npm run test:e2e:functional -- -g "inserts block"
```

**Let Playwright start WordPress.** Use these only when you want a single command to boot WordPress and then test. The two-terminal flow above is the usual way to work.

| Command | What you get |
|---------|--------------|
| `npm run test:e2e:functional:start-env` | Functional and accessibility tests |
| `npm run test:e2e:aria:start-env` | Accessibility tests |
| `npm run test:e2e:visual:start-env` | Screenshot tests on LambdaTest |

**Match the Azure test job on your machine.** Start the tunnel, run the suite, then stop the tunnel and WordPress:

```bash
npm run tunnel:e2e:start
npm run test:e2e:ci
npm run tunnel:e2e:stop
npm run env:e2e:stop
```

`test:e2e:ci` starts WordPress, checks both sites, runs functional tests, starts WordPress again, and runs screenshot tests. It leaves the tunnel to you, because your tunnel name and LambdaTest credentials differ from Azure's. You need `LT_USERNAME`, `LT_ACCESS_KEY`, `GITHUB_PAT`, and `ACF_DOWNLOAD_URL` in that shell. Azure runs `npm run tunnel:e2e:start:detached` before functional tests (the container starts, and the job waits until the tunnel is ready just before screenshots), then runs `npm run env:e2e:reseed` instead of a second full start. Reseed puts chrome and editor preferences back without reinstalling WordPress. Azure still stops the tunnel and WordPress for you.

### Screenshot tests in your own Chrome

`npm run test:e2e:visual:local` runs the screenshot tests in your Chrome. Use it to look at a layout without spending LambdaTest minutes, or when LambdaTest is down. It needs no tunnel and no LambdaTest credentials. WordPress must already be running.

A failure here can be a font or spacing difference between your computer and LambdaTest Linux Chrome. Playwright writes the expected image, the actual image, and a diff under `artifacts/test-results/`.

Leave those PNG files uncommitted. If `--update-snapshots` was passed to this command by mistake, throw the images away:

```bash
git checkout -- 'tests/e2e/**/__snapshots__/*.png'
```

Saved screenshots come from `npm run test:e2e:visual:update`.

### Updating snapshots

When a theme change should alter a page, replace the saved files under `__snapshots__/` and commit them.

Screenshot updates have to happen on LambdaTest, against the same plugin release zips Azure uses. Stop WordPress if it is already running, start it with release zips, then update. The update command reads the site that is already running. It does not install plugins again.

```bash
npm run env:e2e:stop
npm run env:e2e:start:strict
npm run test:e2e:visual:update
```

`E2E_STRICT_PLUGINS=1` is explained under [Changing which plugins are used](#changing-which-plugins-are-used).

| Command | What it rewrites |
|---------|------------------|
| `npm run test:e2e:aria:update` | Accessibility `.yml` files that changed |
| `npm run test:e2e:visual:update` | Screenshot `.png` files that changed, on LambdaTest |
| `npm run test:e2e:update` | Accessibility files, then screenshots |
| `npm run test:e2e:update:last-failed` | Only the snapshot tests that failed on the previous run |

These commands rewrite files that actually changed. To limit an update to one spec, append it: `npm run test:e2e:aria:update -- tests/e2e/pages/Blog.spec.js`.

A normal loop is: run the tests, look at the failures, then run `npm run test:e2e:update:last-failed` to accept those failures.

To compare screenshots with Azure's plugins and Chrome without writing files, start WordPress the same way (`npm run env:e2e:start:strict`) and run `npm run test:e2e:visual:match-ci`.

### Pull request checklist (visual / e2e)

Copy this into the pull request when the change can affect screenshots, sample content, plugins, or Playwright config.

- [ ] The Azure **Test** stage is green, or `npm run test:e2e:ci` is green locally (tunnel started and stopped by you, secrets set). If something failed and is unrelated, the pull request says why. Azure stops WordPress and the tunnel at the end of the job.
- [ ] New or changed `tests/e2e/**/__snapshots__/*.png` files were produced by `npm run test:e2e:visual:update` on LambdaTest Linux Chrome.
- [ ] WordPress was started with `E2E_STRICT_PLUGINS=1` before that update, so the screenshots use the release zips in `plugins.json`.
- [ ] The pull request says why the pixels changed (theme, block, plugin version, sample content, editor settings).
- [ ] A handful of screenshot updates is intentional. When many unrelated screenshots change, use a separate pull request or [`.azuredevops/e2e-visual-baseline-update-steps.yml`](.azuredevops/e2e-visual-baseline-update-steps.yml).
- [ ] `maxDiffPixelRatio` is unchanged. Edits to [`tests/e2e/helpers/screenshot-stability.css`](tests/e2e/helpers/screenshot-stability.css) only hide scrollbars or pin a documented one-pixel case.
- [ ] Accessibility `.yml` files were updated with `npm run test:e2e:aria:update` when the accessibility tree changed.
- [ ] Plugin list, mu-plugin, or sample-content PHP changes tell reviewers to run `npm run env:e2e:start` (it resets and reloads sample content). `npm run env:e2e:destroy` is for a broken container or a broken plugin install. See [Troubleshooting](#troubleshooting).

### Changing which plugins are used

[`tests/e2e/plugins.json`](tests/e2e/plugins.json) lists the plugins and their release zips. `tests/e2e/plugins.local.json` can replace any of those with a folder on your machine. `MAYFLOWER_BLOCKS_PATH`, `OHO_VIEWS_PATH`, and `ACF_PATH` do the same for one plugin, and they win over both JSON files.

`E2E_STRICT_PLUGINS=1` ignores those local folders and uses the release zips. Azure sets it. `npm run test:e2e:visual:update` and `npm run test:e2e:visual:match-ci` set it for the test process only. The running WordPress site keeps whatever plugins it was started with, so set the variable on `npm run env:e2e:start` before you update or compare screenshots. `npm run env:e2e:start:strict` does that on macOS and Windows.

After you edit either JSON file, restart so WordPress remounts the plugins:

```bash
npm run env:e2e:stop
npm run env:e2e:start
```

### Bumping the pinned LambdaTest Chrome version

Screenshot tests request one Chrome version on LambdaTest. Change it when LambdaTest's default Linux Chrome moves, and replace every saved screenshot in the same pull request.

1. **Read the version LambdaTest is serving.** The tunnel and `LT_USERNAME` / `LT_ACCESS_KEY` must be set.

   ```bash
   npm run tunnel:e2e:start
   node tests/e2e/scripts/print-lambdatest-chrome-version.mjs
   ```

   Keep the major.minor segment (for example `154.0.6367.60` becomes `154.0`).

2. **Put that same value in three places:**

   | Location | Field |
   |----------|--------|
   | [`tests/e2e/helpers/lambdatest.js`](tests/e2e/helpers/lambdatest.js) | `DEFAULT_LAMBDATEST_CHROME_VERSION` |
   | [`.azuredevops/e2e-test-steps.yml`](.azuredevops/e2e-test-steps.yml) | `E2E_LAMBDATEST_CHROME_VERSION` on the visual step |
   | [`.azuredevops/e2e-visual-baseline-update-steps.yml`](.azuredevops/e2e-visual-baseline-update-steps.yml) | the same variable |

3. **Replace every screenshot** on LambdaTest, using release zips:

   - **Azure:** run a pipeline that uses `e2e-visual-baseline-update-steps.yml`, download the `e2e-visual-baselines` artifact, and commit `__snapshots__/`.
   - **Your machine:** `npm run env:e2e:stop`, then `npm run env:e2e:start:strict`, with the tunnel up, then `npm run test:e2e:visual:update`. Expect a large diff.

4. **Check that it is stable.** With WordPress and the tunnel still running, run `npm run test:e2e:visual` twice. Both runs should pass, and neither should change a PNG.

5. **Open the pull request** with the checklist above. Name the Chrome bump in the summary. A pin change without the new PNG files should wait.

### Continuous integration

Azure DevOps runs this suite in the **Test** stage, before **Build**. A failing test skips the build and every deployment. Results are on the pipeline run's **Tests** tab. Failure screenshots and traces are the `e2e-artifacts` pipeline artifact.

Set `LT_USERNAME`, `LT_ACCESS_KEY`, `GITHUB_PAT`, and `ACF_DOWNLOAD_URL` as pipeline variables. The steps are in [`.azuredevops/e2e-test-steps.yml`](.azuredevops/e2e-test-steps.yml). The local equivalent is `npm run test:e2e:ci`, described under [Running tests](#running-tests).

To re-run only the tests, queue the pipeline and select the **Test** stage.

### Writing new tests

Specs live in `tests/e2e/` (`pages/`, `blocks/`, `layout/`). Shared helpers are in `tests/e2e/helpers/`. Sample content is in `tests/fixtures/`.

Tag a test `@visual` when it saves a screenshot, and `@aria` when it saves an accessibility snapshot. Tag `@viewport` only when the behavior changes by breakpoint. Block screenshot tests run on desktop. Page screenshot tests run on desktop, tablet, and mobile.

### Environment variables

Set these in the shell that starts WordPress or runs tests. `E2E_STRICT_PLUGINS=1` ignores the local folder variables above it.

| Variable | Set it when |
|----------|-------------|
| `LT_USERNAME`, `LT_ACCESS_KEY` | You run screenshot tests on LambdaTest |
| `GITHUB_PAT` | WordPress must download a private Bellevue plugin or the Bellevue 2022 theme |
| `ACF_DOWNLOAD_URL` | You want the ACF Pro zip instead of a local ACF folder |
| `BELLEVUE_2022_THEME_PATH` | The main site should use a Bellevue 2022 folder on your machine |
| `MAYFLOWER_BLOCKS_PATH`, `OHO_VIEWS_PATH`, `ACF_PATH` | That one plugin should use a folder on your machine |
| `E2E_STRICT_PLUGINS` | `1` on `npm run env:e2e:start` so WordPress uses release zips. Required before `test:e2e:visual:update` and `test:e2e:visual:match-ci` |
| `E2E_WPENV_RUNNING` | You rarely set this. `1` means WordPress is already running, so Playwright must leave it alone. The everyday test commands set it |
| `E2E_ALLOW_VISUAL_BASELINE_UPDATE` | You rarely set this. `1` allows screenshot files to be rewritten on your machine. `test:e2e:visual:update` sets it |
| `E2E_LAMBDATEST_CHROME_VERSION` | You need a Chrome version other than `DEFAULT_LAMBDATEST_CHROME_VERSION` in [`tests/e2e/helpers/lambdatest.js`](tests/e2e/helpers/lambdatest.js) |
| `E2E_LAMBDATEST_TUNNEL_AUTO` | `0` when the tunnel is already running and the visual run should leave it alone. `test:e2e:ci` sets this |
| `E2E_LAMBDATEST_TUNNEL_NAME` | You need a tunnel name other than `e2e-tunnel-dev`. Azure uses `e2e-tunnel-ado-<BuildId>` |
| `E2E_DEBUG` | `1` to log plugin downloads |
| `E2E_DEBUG_SCREENSHOT_GEOMETRY` | `1` to log element boxes before the Announcement Banner and Posts Feature screenshots |

### Troubleshooting

Open `artifacts/test-results/<test-name>/error-context.md` for the error, plus the screenshots and trace in that folder.

**Tests fail instantly (0 ms).** The browser never started. The `error-context.md` for that test usually names a LambdaTest or container problem from the list below.

**Sample content is stale after you edit a fixture.** Run `npm run env:e2e:start` again. Containers stay up, the database is reset, and both sites are loaded again. `npm run test:e2e` does that start once, before functional tests, then `npm run env:e2e:reseed` before screenshot tests. `npm run test:e2e:ci` does a full start again before screenshot tests instead of the lighter reseed.

**A plugin path, `plugins.local.json`, or the e2e mu-plugin changed and the site looks the same.** Stop and start WordPress so the containers pick up the files:

```bash
npm run env:e2e:stop
npm run env:e2e:start
```

**WordPress is broken, sample content fails to load, or PHP says a plugin function is missing** (for example `Call to undefined function update_field()`, which means ACF never loaded). Delete this test environment and start over. The next start downloads images again, recreates the database, and reloads sample content.

```bash
npm run env:e2e:destroy
rm -rf artifacts/e2e-plugins   # optional: download plugin zips again
npm run env:e2e:start
```

`npm run env:e2e:destroy` writes `.wp-env.e2e.json` if it is missing, then runs `wp-env destroy --force`. That removes this environment's containers, database volume, and images. On Windows PowerShell, clear the plugin cache with `Remove-Item -Recurse -Force artifacts/e2e-plugins`.

Use stop plus start when you only need a restart. Use destroy when the install itself is wrong.

**A pathway or program template dies after an infrastructure change** (for example a Twig error on `pathway_names`). The main site has to be running Bellevue 2022, from the release zip or your checkout. After `tests/e2e/themes.json` or a theme path changes, run `npm run env:e2e:start` so Bellevue is activated and sample content is loaded again. Destroy the environment when the theme image or the release zip itself has to be replaced.

**`npm run env:e2e:verify` fails.** The check looks for the Bellevue theme, pathway content, and ACF on the main site, and for Sitka plus a program on `/e2e-dept`. Start already runs this check. Run it again after a fix. Azure runs it before Playwright.

**`mariadb:lts` will not download, or Docker reports `production.cloudfront.docker.com: no such host` after destroy.** Destroy deletes the local WordPress and MariaDB images, so the next start downloads them. That hostname error is DNS or a VPN: Rancher Desktop or Docker cannot resolve CloudFront. Check with `nslookup production.cloudfront.docker.com`. Fix DNS, drop the VPN briefly, or run `docker pull mariadb:lts` on a working network, then `npm run env:e2e:start`.

**Rancher Desktop or Podman is stuck** (start hangs, containers will not stop, port 8889 is in use with nothing listening, or the disk is full). Recreate the container machine. This removes every container and image on that machine, so the next start takes several minutes.

- **Rancher Desktop:** open the app, go to **Troubleshooting** (or Preferences, then Troubleshooting), choose **Factory Reset**, start Rancher Desktop again, and wait until containers are ready.
- **Podman:**

  ```bash
  podman machine stop
  podman machine rm
  podman machine init --cpus 4 --memory 8192
  podman machine start
  ```

Then run the destroy-and-start commands from the broken-WordPress item above.

**LambdaTest returns `422` and `Lifetime Minutes Exhausted for desktop-automation`.** The subscription is **Web Automation on Desktop — Linux**. Screenshot tests must ask for Linux Chrome. Windows, macOS, and Playwright's bundled `pw-chromium` draw from a different pool that has no minutes. Those settings are in [`tests/e2e/helpers/lambdatest.js`](tests/e2e/helpers/lambdatest.js). If they already say Linux Chrome, the Linux minutes are used up. Check the LambdaTest dashboard, and use `npm run test:e2e:visual:local` until they reset.

**Screenshot tests show `503` or `dial tcp [::1]:8889`, or they hang while connecting to LambdaTest.** The tunnel cannot reach WordPress. Visual runs start the tunnel on their own, and an old tunnel container can still be holding the name. Restart it:

```bash
npm run tunnel:e2e:stop
npm run tunnel:e2e:start
curl http://127.0.0.1:8000/api/v1.0/info
```

If that still fails, confirm `LT_USERNAME` and `LT_ACCESS_KEY` are set in that terminal, and that HTTPS to `*.lambdatest.com` is allowed.

**The tunnel name is already in use, or Azure times out on the tunnel.** Your machine uses `e2e-tunnel-dev`. Azure uses `e2e-tunnel-ado-<BuildId>` for that build. If a local session still holds `e2e-tunnel-dev`, run `npm run tunnel:e2e:stop`. To keep a personal name, set `E2E_LAMBDATEST_TUNNEL_NAME` to the same value on `npm run tunnel:e2e:start` and on the visual command. Bash: `e2e-tunnel-$USER`. PowerShell: `e2e-tunnel-$env:USERNAME` (`$env:E2E_LAMBDATEST_TUNNEL_NAME = "e2e-tunnel-$env:USERNAME"`).

**A screenshot fails on width or on pixels.** Tests pin LambdaTest Chrome (`E2E_LAMBDATEST_CHROME_VERSION`) and apply [`tests/e2e/helpers/screenshot-stability.css`](tests/e2e/helpers/screenshot-stability.css) during the capture so a scrollbar cannot change the width (for example `1280` versus `1265`). If the log shows that width changing inside one test, the stylesheet did not apply. If the width is steady and the pixels differ, run the test once more. When the difference stays and the page looks right on LambdaTest, update with `npm run test:e2e:visual:update`. Leave `maxDiffPixelRatio` as it is when a full-page shot is only short or tall by a small amount.

**`page.goto` times out on `host.docker.internal:8889` (often on Windows).** LambdaTest reaches WordPress through the tunnel container. On the host, `curl http://127.0.0.1:8889/e2e-dept/` should answer, and `curl http://127.0.0.1:8000/api/v1.0/info` should answer for the tunnel. If wp-env is on Windows, run the tunnel in Docker Desktop, including when the rest of your tools are in WSL. Navigation retries a short timeout once. Run the spec again if it was a blip.

**`@aria` tests fail on Windows and the YAML diff looks identical (line endings).** Playwright compares `tests/e2e/**/__snapshots__/*.yml` byte-for-byte to the browser tree. Git on Windows can check those files out with CRLF even when the repo stores LF, which fails the match with almost no visible diff. [`.gitattributes`](.gitattributes) forces LF for aria baselines. After you pull that file, re-normalize your worktree, then run `npm run test:e2e:aria` again (with wp-env already up):

```bash
git add --renormalize "tests/e2e/**/__snapshots__/*.yml"
git checkout -- tests/e2e
```

Do not refresh baselines from a CRLF worktree. If the accessibility tree really changed, run `npm run test:e2e:aria:update` only after the snapshots on disk are LF again.

**A private plugin download returns 404.** `GITHUB_PAT` cannot read that repository. Confirm the token's access and that it is authorized for BellevueCollege SSO. `E2E_DEBUG=1` prints which token was used.

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
