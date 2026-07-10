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
the `alpha` dist-tag automatically (changesets uses the `pre.json` tag); pre-1.0, with no stable release, `latest` also tracks the newest alpha (npm always keeps a `latest`) and moves to the stable line when you exit pre mode.

## One-time setup

Authentication is npm **Trusted Publishing (OIDC)** — no token to store or rotate, and provenance is
added automatically. For **each** of the three packages, on npmjs: **package → Settings → Trusted
Publishers → Add → GitHub Actions**, then:

- **Organization or user:** `markgrushevski`
- **Repository:** `oriui`
- **Workflow filename:** `release.yml` _(filename only, not a path)_
- **Environment name:** _leave empty_
- **Allowed actions:** `npm publish`

Needs npm **≥ 11.5.1** + Node **≥ 22.14.0** — the workflow installs a recent npm and requests the OIDC
token via `id-token: write`. No `NPM_TOKEN` secret, nothing to rotate every 90 days.

> **Bootstrap (done — historical):** a trusted publisher can only be added to a package that **already
> exists** — npm has no "pending" publishers. All three packages have been bootstrapped (a first local
> publish — `npm run version` then `npm run release` with `npm login` + OTP) and now have trusted
> publishers configured, so every release runs through this OIDC workflow with **no token anywhere**.
> Kept only for reference if a **new** `@oriui/*` package is ever added: publish its first version
> locally, then add its trusted publisher (and mind npm's **24h name-reuse block**).

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
   (`npm run build && changeset publish`), publishing the bumped packages to npm in dependency order
   via **Trusted Publishing (OIDC)** — no token, provenance attached. In pre mode changesets tags them
   with the pre-release tag automatically (**`alpha`**) and tags the release commit.

Once a release is stable, move it to the default tag: `npm dist-tag add @oriui/vue@<v> latest` (and the
same for `@oriui/headless` + `@oriui/css`), or run `changeset pre exit` and cut a non-prerelease.

### Local equivalents (manual fallback)

```bash
npm run version    # changeset version + lockfile sync  (the "Version Packages" step)
npm run release    # build + changeset publish → alpha dist-tag  (needs npm login / OTP locally)
```

## Verify

```bash
npm view @oriui/vue
npm view @oriui/headless
npm view @oriui/css
#  npm i @oriui/vue@alpha     (fresh-install smoke test)
```

## Notes

- **The rename is breaking, and the old names are already unpublished.** `@oriui/vue` used to be the
  headless package; it now ships the components, with the headless in `@oriui/headless` (`./vue` for
  the composables). `@oriui/ui`, `@oriui/core`, and the old `@oriui/vue` were **unpublished** from npm
  — only `@oriui/css` is still live. ⚠️ npm **blocks reusing an unpublished name for 24h**, so the
  renamed `@oriui/vue` cannot publish until 24h after its unpublish (`@oriui/headless` is a brand-new
  name and `@oriui/css` stayed live, so neither is affected). Check with `npm view @oriui/vue`.
- Published versions are **immutable** (and unpublish is restricted after 72h) — bump, don't republish.
- A scoped first publish needs `--access public`; that lives in each package's `publishConfig`, and
  `.changeset/config.json` sets `access: public`.
- **Troubleshooting** — `402`/`404` on publish = missing `--access public` or no publish rights;
  `EOTP` = an OTP was expected (CI avoids this entirely via OIDC Trusted Publishing); "cannot publish over previously published
  versions" = bump the version.
