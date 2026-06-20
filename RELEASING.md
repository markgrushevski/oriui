# Releasing oriUI

How releases work — oriUI is a small monorepo of **three publishable packages** plus the docs
workspace, released with **changesets** in alpha prerelease mode.

| Package           | Path                | What it is                                        |
| ----------------- | ------------------- | ------------------------------------------------- |
| `@oriui/vue`      | `packages/vue`      | Styled Vue components (depends on css + headless) |
| `@oriui/headless` | `packages/headless` | Engine (`.`) + Vue adapter (`./vue`)              |
| `@oriui/css`      | `packages/css`      | Standalone CSS tokens + utilities                 |

The three are a **fixed** lockstep group (`.changeset/config.json`) — they always bump together. The
repo is in **alpha pre mode** (`.changeset/pre.json`), so versions stay `1.0.0-alpha.N` and publish to
the `next` dist-tag.

## One-time setup

1. **npm org** `oriui` with publish rights (exists).
2. **`NPM_TOKEN` secret** — an npm **automation** access token (npmjs → _Access Tokens_ →
   Granular/Automation; bypasses 2FA), added to the GitHub repo secrets so CI publishes without an OTP.

## Cut a release

1. **Add a changeset per change** (on the feature branch, before merging):

    ```bash
    npx changeset      # or: npm run changeset — pick the bump type, write the changelog line
    ```

    With the fixed group, naming any one package bumps all three. Commit the generated `.changeset/*.md`
    with your PR.

2. **Merge to `main`.** On push, the **Release** workflow (`changesets/action`) opens or updates a
   **"Version Packages"** PR that aggregates the pending changesets — bumping the versions + the pinned
   internal deps and updating `CHANGELOG.md`.

3. **Merge the "Version Packages" PR.** That push runs `npm run release`
   (`npm run build && changeset publish --tag next`), publishing the bumped packages to npm in
   dependency order via `NPM_TOKEN`, and tagging the release. No OTP.

Once a release is stable, move it to the default tag: `npm dist-tag add @oriui/vue@<v> latest` (and the
same for `@oriui/headless` + `@oriui/css`), or run `changeset pre exit` and cut a non-prerelease.

### Local equivalents (manual fallback)

```bash
npm run version    # changeset version + lockfile sync  (the "Version Packages" step)
npm run release    # build + changeset publish --tag next  (needs npm login / OTP locally)
```

## Verify

```bash
npm view @oriui/vue
npm view @oriui/headless
npm view @oriui/css
#  npm i @oriui/vue@next     (fresh-install smoke test)
```

## Notes

- **The rename is breaking.** `@oriui/vue` used to be the headless package; it now ships the
  components, and the headless lives in `@oriui/headless` (`./vue` for the composables). The old
  `@oriui/ui`, `@oriui/core`, and old `@oriui/vue` names are retired — `npm deprecate` them with a
  pointer to the new names when the first renamed alpha publishes.
- Published versions are **immutable** (and unpublish is restricted after 72h) — bump, don't republish.
- A scoped first publish needs `--access public`; that lives in each package's `publishConfig`, and
  `.changeset/config.json` sets `access: public`.
- **Troubleshooting** — `402`/`404` on publish = missing `--access public` or no publish rights;
  `EOTP` = the OTP expired (CI avoids this via `NPM_TOKEN`); "cannot publish over previously published
  versions" = bump the version.
