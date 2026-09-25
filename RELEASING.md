# Releasing oriUI

oriUI is a small monorepo of **three publishable packages** plus the docs workspace, released with
**changesets** in pre mode (`rc`).

| Package           | Path                | What it is                                             |
| ----------------- | ------------------- | ------------------------------------------------------ |
| `@oriui/vue`      | `packages/vue`      | Styled Vue components (**peers**: css + headless)      |
| `@oriui/headless` | `packages/headless` | Engine (`.`) + `./vue`, `./svelte`, `./react` adapters |
| `@oriui/css`      | `packages/css`      | Standalone CSS tokens + utilities                      |

The three are a **fixed** lockstep group (`.changeset/config.json`) — they always bump together. While
`.changeset/pre.json` is in pre mode, versions are `1.0.0-rc.N`.

**Every version publishes to the `latest` dist-tag.** In pre mode `changeset publish` would use the `pre.json`
tag and leave `latest` on an older line, so a plain `npm install` would get a different API from the one the
docs describe. `scripts/publish.mjs` passes `--tag latest` to prevent that — there is no stable release yet
for `latest` to protect. The `alpha` and `rc` dist-tags are leftovers of earlier routing, frozen at
`1.0.0-alpha.3` and `1.0.0-rc.19`; step 6 of the 1.0 cutover repoints them.

## One-time setup

Authentication is npm **Trusted Publishing (OIDC)** — no token to store or rotate, and provenance is added
automatically. For **each** package, on npmjs: **package → Settings → Trusted Publishers → Add → GitHub
Actions**, then:

- **Organization or user:** `markgrushevski`
- **Repository:** `oriui`
- **Workflow filename:** `release.yml` _(filename only, not a path)_
- **Environment name:** _leave empty_
- **Allowed actions:** `npm publish`

Needs npm **≥ 11.5.1** and Node **≥ 22.14.0**; the workflow installs a pinned npm and requests the OIDC token
via `id-token: write`.

A trusted publisher can only be added to a package that **already exists**. All three are set up; a **new**
`@oriui/*` package needs its first version published locally (`npm run version`, then `npm run release` with
`npm login` + OTP) before its trusted publisher can be added. npm blocks reusing an unpublished name for 24h.

## Cut a release

1. **Add a changeset per change** (on the feature branch, before merging):

    ```bash
    npm run changeset   # pick the bump type, write the changelog entry
    ```

    With the fixed group, naming any one package bumps all three. Commit the generated `.changeset/*.md`.

2. **Merge to `main`.** The **Release** workflow (`changesets/action`) opens or updates a **"Version
   Packages"** PR that aggregates the pending changesets — bumping the versions and the pinned internal peers,
   and updating each `CHANGELOG.md`.

3. **Merge the "Version Packages" PR.** That push runs `npm run release` (`npm run build && node
scripts/publish.mjs`), publishing the bumped packages to `latest` via trusted publishing and tagging the
   release commit.

### Local equivalents (manual fallback)

```bash
npm run version    # changeset version + lockfile sync  (the "Version Packages" step)
npm run release    # build + publish → latest  (needs npm login / OTP locally)
```

Each package also has a `prepack` hook that runs its own build, so `npm publish` and `npm pack` produce a fresh
`dist` whichever command you type — `dist` is gitignored.

> **One package at a time, though.** Packing all three at once races their builds: `@oriui/headless` cleans
> its `dist` while `@oriui/vue`'s declaration emit is reading it. So the release script builds the graph in
> dependency order, then publishes that artifact through `scripts/publish.mjs` with
> `npm_config_ignore_scripts=true`. If you publish by hand, pack the packages one at a time — or build first
> and pass `--ignore-scripts` yourself.

## Cut the 1.0 (exiting pre mode)

Leaving pre mode is its own release. Run it in this order.

1. **Exit pre mode on its own branch, as its own commit, with nothing else in it.**

    ```bash
    git switch -c release/exit-pre-mode main
    npx changeset pre exit                              # flips .changeset/pre.json to "mode": "exit"
    git commit -am 'build: exit changesets pre mode for 1.0'
    ```

    `changeset version` behaves differently on either side of that commit, so a mixed commit is hard to read
    and hard to revert. Merge it to `main` as usual.

2. **The regenerated "Version Packages" PR consumes the whole prerelease backlog** — every changeset in the
   `changesets` array of `.changeset/pre.json` — and collapses it into a single `1.0.0`.

3. **Curate the `1.0.0` changelog before merging that PR.** Changesets restates every one of those changesets
   under the `1.0.0` heading, although each was already reported in the prerelease that shipped it. Rewrite
   the section into a real 1.0 entry; the prerelease entries below it stay as the detailed history.

4. **In the same PR, widen the internal peer ranges, add the changesets flag, and drop `--tag latest`.**
   `@oriui/vue` pins `@oriui/css` and `@oriui/headless` to the exact version only because a `^` range cannot
   match a prerelease. Edit `packages/vue/package.json` so both read `^1.0.0` in **`peerDependencies` and
   `devDependencies`** (changesets keeps whichever range style it finds, so this is one-time), and add to
   `.changeset/config.json`:

    ```json
    "___experimentalUnsafeOptions_WILL_CHANGE_IN_PATCH": { "onlyUpdatePeerDependentsWhenOutOfRange": true }
    ```

    The flag is **not optional**. By default changesets treats "a package bumped, and something peer-depends on
    it" as breaking: measured on a fixture of these three packages, with `^1.0.0` peer ranges and no flag, a
    plain `minor` on `@oriui/headless` escalates `@oriui/vue` to a major and the fixed group drags all three to
    **2.0.0**. With the flag the same changeset produces `1.1.0`. Nothing warns you.

    Remove `'--tag', 'latest'` from `scripts/publish.mjs` too: after 1.0, a later prerelease line
    (`changeset pre enter beta`) must land on its own tag, not on `latest`.

    (None of this sticks before step 1: while pre mode is on, `changeset version` rewrites the ranges on every
    release.)

5. **Merge it.** The three publish as a stable `1.0.0` on `latest`.

6. **Repoint the stale `alpha` and `rc` dist-tags — do not delete them.**

    ```bash
    for p in vue headless css; do
      npm dist-tag add @oriui/$p@1.0.0 alpha
      npm dist-tag add @oriui/$p@1.0.0 rc
    done
    ```

    Deleting them (`npm dist-tag rm`) would make `npm i @oriui/vue@alpha` fail with `ETARGET` for anyone who
    used that tag; repointing keeps those installs resolving.

## Verify

Before the release, locally:

```bash
npm run gate     # the exact gate release.yml runs (lint → types → test → build → size → publint → attw → smoke → docs)
npm run smoke    # just the consumer leg: pack the three packages, install the tarballs into a scratch
                 # dir, import every published entry through its `exports` map. ~15s.
```

`npm run smoke` is the only thing in the repo that resolves the packages the way a consumer does — everything
else (vitest, the docs, the e2e harness) aliases `@oriui/*` to `src/`. It catches a broken `exports` map, a
missing `dist`, a tarball without its LICENSE, or a second nested copy of a sibling. `ORI_SMOKE_KEEP=1` leaves
the scratch install behind to poke at.

After the release, against npm:

```bash
npm view @oriui/vue dist-tags    # `latest` is the new version
npm i @oriui/vue@<version>       # fresh-install smoke test in a scratch dir
```

npm's registry is eventually consistent: a fresh publish can 404 for several minutes, so an immediate failed
read is not evidence that the publish failed.

## Notes

- Published versions are **immutable** (and unpublish is restricted after 72h) — bump, don't republish.
- **What goes in the tarball** is each package's `files` array plus npm's always-included set (`package.json`,
  `README`, `LICENSE`, the `main` entry). `CHANGELOG.md` is not in that set, so it is listed in `files`;
  `LICENSE` is, so each package keeps its own copy of the root one. `@oriui/vue` and `@oriui/headless` also
  ship `src`, because their source maps point into it; `@oriui/css` ships `dist` only.
  `tests/packaging.test.ts` guards all of that; `npm pack --dry-run` in a package prints the real list.
- **`@oriui/vue` declares no runtime `dependencies`** — both siblings are peers. See CONTRIBUTING.md ›
  Versioning for why, and step 4 above for the range widening at 1.0.
- A scoped first publish needs `--access public`; each package's `publishConfig` and
  `.changeset/config.json` set it.
- **Troubleshooting** — `402` / `404` on publish = missing `--access public` or no publish rights; `EOTP` = an
  OTP was expected (CI avoids this via OIDC); "cannot publish over previously published versions" = bump the
  version.
