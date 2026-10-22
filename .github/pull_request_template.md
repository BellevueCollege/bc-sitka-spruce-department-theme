## Summary

<!-- What changed and why? -->

## Test plan

- [ ] `npm run test:e2e:functional` (or Azure Test stage) — when behavior or seeds changed
- [ ] `@visual` / snapshot changes — checklist below when applicable

### E2e / visual (when applicable)

See also [readme — Pull request checklist (visual / e2e)](../readme.md#pull-request-checklist-visual--e2e).

- [ ] **Azure Test stage** (or `npm run test:e2e:ci`) green, or failure explained
- [ ] PNG baselines from LambdaTest (`npm run test:e2e:visual:update`), not `test:e2e:visual:local`
- [ ] Strict plugin resolution for baseline commits (`E2E_STRICT_PLUGINS=1`)
- [ ] PR explains why pixels or `@aria` snapshots changed
- [ ] No `maxDiffPixelRatio` looseness; `screenshot-stability.css` only for scrollbars / documented subpixel pins
