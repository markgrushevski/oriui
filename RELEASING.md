# Releasing oriUI

How releases work — oriUI is a small monorepo of **three publishable packages** plus the docs
workspace, released with **changesets** in alpha prerelease mode.

| Package           | Path                | What it is                                        |
| ----------------- | ------------------- | ------------------------------------------------- |
| `@oriui/vue`      | `packages/vue`      | Styled Vue components (depends on css + headless) |
| `@oriui/headless` | `packages/headless` | Engine (`.`) + Vue adapter (`./vue`)              |
| `@oriui/css`      | `packages/css`      | Standalone CSS tokens + utilities                 |

The three are a **fixed** lockstep group (`.changeset/config.json`) — they always bump together. The
repo is in **alpha pre mode** (`.changeset/pre.json`), so versions stay `1.0.0-alpha.N`.

> **Which dist-tag they land on: `latest`, not `alpha`.** Pre mode does _not_ imply the `pre.json` tag.
> `changeset publish` resolves the tag per package (`getReleaseTag`): it uses the `pre.json` tag only
> when that package already has a published **non**-prerelease version. When _every_ published version
> is a prerelease — true for all three, the line has never had a stable release — it falls back to
> **`latest`** (the publish log says `… published to latest rather than alpha`). The `alpha` dist-tag
> is a leftover from the bootstrap publishes and is **frozen at `1.0.0-alpha.3`**, fourteen releases
> back:
>
> ```bash
> npm view @oriui/vue dist-tags   # { alpha: '1.0.0-alpha.3', latest: '1.0.0-alpha.17' }
> ```
>
> So `npm i @oriui/vue` gets the current alpha and `npm i @oriui/vue@alpha` gets a stale one — **pin an
> exact version**, never `@alpha`. Repointing that tag is step 5 of the 1.0 cutover below.

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
   via **Trusted Publishing (OIDC)** — no token, provenance attached — and tags the release commit.
   They land on **`latest`** (see the dist-tag note above), not on `alpha`.

### Local equivalents (manual fallback)

```bash
npm run version    # changeset version + lockfile sync  (the "Version Packages" step)
npm run release    # build + changeset publish → latest dist-tag  (needs npm login / OTP locally)
```

## Cut the 1.0 (exiting pre mode)

Leaving alpha is its own release. Run it in this order.

1. **Exit pre mode on its own branch, as its own commit, with nothing else in it.**

    ```bash
    git switch -c release/exit-pre-mode main
    npx changeset pre exit                              # flips .changeset/pre.json to "mode": "exit"
    git commit -am 'build: exit changesets pre mode for 1.0'
    ```

    Nothing else belongs in that commit: `changeset version` behaves differently on either side of it,
    so a mixed commit is hard to read and hard to revert. Merge it to `main` as usual.

2. **The regenerated "Version Packages" PR consumes the whole alpha backlog.** On that push the Release
   workflow reopens the PR — this time applying **every changeset accumulated during pre mode** (41 at
   the time of writing; the list is the `changesets` array in `.changeset/pre.json`) and collapsing them
   into a single `1.0.0`.

3. **Curate the `1.0.0` changelog before merging that PR.** Changesets restates all of those changesets
   under the `1.0.0` heading even though each was already reported in the `1.0.0-alpha.N` entry that
   shipped it — so the section arrives as a ~41-bullet replay of the entire alpha series. Rewrite it in
   the PR into a real 1.0 entry; the alpha entries below it stay as the detailed history.

4. **Merge it.** `pre.json` is gone, so no pre-release tag is in play at all and the three publish to
   `latest` — this time as a genuinely stable `latest`.

5. **Repoint the stale `alpha` dist-tag — do not delete it.**

    ```bash
    npm dist-tag add @oriui/vue@1.0.0 alpha
    npm dist-tag add @oriui/headless@1.0.0 alpha
    npm dist-tag add @oriui/css@1.0.0 alpha
    ```

    Deleting it instead (`npm dist-tag rm`) would make `npm i @oriui/vue@alpha` fail with `ETARGET` for
    everyone who ever pinned that tag — including this repo's own older docs. Repointing keeps those
    installs resolving. A later prerelease line (`changeset pre enter beta`) then tags correctly on its
    own: with a stable `1.0.0` published, `getReleaseTag` stops falling back to `latest` and uses the
    `pre.json` tag.

## Verify

```bash
npm view @oriui/vue
npm view @oriui/headless
npm view @oriui/css
npm view @oriui/vue dist-tags        # the release is on `latest`; `alpha` is stale
#  npm i @oriui/vue@1.0.0-alpha.17   (fresh-install smoke test — pin the exact version, not @alpha)
```

## Notes

- **The rename is breaking, and the old names are already unpublished.** `@oriui/vue` used to be the
  headless package; it now ships the components, with the headless in `@oriui/headless` (`./vue` for
  the composables). `@oriui/ui`, `@oriui/core`, and the old `@oriui/vue` were **unpublished** from npm
  — only `@oriui/css` is still live. ⚠️ npm **blocks reusing an unpublished name for 24h**, so the
  renamed `@oriui/vue` cannot publish until 24h after its unpublish (`@oriui/headless` is a brand-new
  name and `@oriui/css` stayed live, so neither is affected). Check with `npm view @oriui/vue`.
- Published versions are **immutable** (and unpublish is restricted after 72h) — bump, don't republish.
- **What goes in the tarball** is each package's `files` array plus npm's always-included set
  (`package.json`, `README`, `LICENSE`, the `main` entry). `CHANGELOG.md` is _not_ in that set, so it is
  listed in `files`; `LICENSE` is, so each package keeps its own copy of the root one. `@oriui/vue` and
  `@oriui/headless` also ship `src` (their dist source maps point into it — `.changeset/ship-sources.md`);
  `@oriui/css` ships `dist` only, since it emits no maps and every export resolves inside `dist`.
  `tests/packaging.test.ts` guards all of that; `npm pack --dry-run` in a package prints the real list.
- A scoped first publish needs `--access public`; that lives in each package's `publishConfig`, and
  `.changeset/config.json` sets `access: public`.
- **Troubleshooting** — `402`/`404` on publish = missing `--access public` or no publish rights;
  `EOTP` = an OTP was expected (CI avoids this entirely via OIDC Trusted Publishing); "cannot publish over previously published
  versions" = bump the version.
