# Releasing oriUI

How to cut and publish an oriUI release to npm. oriUI is a small monorepo — four
publishable packages plus the docs workspace. This is the **manual runbook** for the
alpha line; CI-driven releases (`changesets`) are tracked in [ROADMAP.md](ROADMAP.md)
Phase 8.

> **Status — already live.** The `oriui` npm org and the first alpha are published: all four
> packages at `1.0.0-alpha.0` (both `next` + `latest`), first published 2026-06-18. The
> _One-time setup_ below is already done — for a new release jump to [Cut a release](#cut-a-release)
> and **bump the version first** (published versions are immutable).

## Packages & layout

| Package       | Path            | Public name   | Depends on                 |
| ------------- | --------------- | ------------- | -------------------------- |
| Styled        | `.` (root)      | `@oriui/ui`   | `@oriui/css`, `@oriui/vue` |
| CSS layer     | `packages/css`  | `@oriui/css`  | —                          |
| Vue headless  | `packages/vue`  | `@oriui/vue`  | `@oriui/core`              |
| Core contract | `packages/core` | `@oriui/core` | —                          |

Internal dependencies are **pinned to the exact version** (not `*`): a `*` range does
not match a prerelease, so `@oriui/ui@1.0.0-alpha.0` declaring `"@oriui/vue": "*"` would be
uninstallable. Keep all four versions in lockstep.

## One-time setup

1. **npm organization** — the `@oriui` scope needs an org named `oriui` on npm
   (npmjs.com → _Add Organization_ → **Free**, unlimited public packages). You must be
   a member with publish rights.
2. **Login** — `npm login`. The account has **2FA-for-writes**, so every publish needs
   a one-time password (OTP).

## Cut a release

### 1. Bump versions in lockstep

Use the helper — it rewrites the version **and** the pinned internal `@oriui/*` deps across all four
`package.json` files at once (a `*` range can't match a prerelease, so internal deps stay pinned exact):

```bash
node scripts/bump.mjs 1.0.0-alpha.2   # or: npm run bump 1.0.0-alpha.2
npm install --package-lock-only       # sync the lockfile
git commit -am "chore(release): v1.0.0-alpha.2"
```

It replaces the current version string everywhere it appears: each package's own `version` plus the
pinned internal deps (`@oriui/css`, `@oriui/vue` in the root; `@oriui/core` in `packages/vue`).

### 2. Green check

```bash
npm run lint:ci && npm run types && npm run test && npm run build
```

### 3. Publish in dependency order

**Preferred — CI, no OTP.** Push the bump commit, then run the **Release** workflow (GitHub →
Actions → _Release_ → _Run workflow_ → pick the dist-tag). It runs the quality gate, builds, and
publishes all four packages in order using the `NPM_TOKEN` automation secret. One-time setup: create an
npm **automation** access token (npmjs → _Access Tokens_ → Granular/Automation — it bypasses 2FA) and
add it as the repo secret `NPM_TOKEN`.

**Manual fallback — OTP.** `--access public` now lives in each package's `publishConfig`, so it can be
omitted; each publish still needs a **fresh OTP**:

```bash
npm run build
npm publish -w @oriui/css  --tag next --otp=XXXXXX
npm publish -w @oriui/core --tag next --otp=XXXXXX
npm publish -w @oriui/vue  --tag next --otp=XXXXXX
npm publish                --tag next --otp=XXXXXX
```

Order matters so the whole graph exists in the registry by the time anyone installs:
`@oriui/css` + `@oriui/core` → `@oriui/vue` → `@oriui/ui`.

#### Dist-tag: `next` vs `latest`

- `--tag next` (used for prereleases) — the alpha does **not** become the default
  install. Users opt in with `npm install @oriui/ui@next`. Plain `npm install @oriui/ui` will
  fail until a stable `latest` exists; this is the intended semver hygiene.
- **Drop `--tag next`** to publish as `latest` if you want `npm install @oriui/ui` to work
  immediately — at the cost of shipping an alpha as the default.

### 4. Tag the release

A git tag maps the published version to an exact commit, so every `@oriui/ui@x` is checkout-able. Tag
the release commit (the lockstep version bump) once the publish succeeds, and push the tag:

```bash
git tag -a v1.0.0-alpha.0 -m "v1.0.0-alpha.0"
git push origin v1.0.0-alpha.0
```

## Verify

```bash
npm view @oriui/ui
npm view @oriui/css
npm view @oriui/vue
npm view @oriui/core
# fresh-install smoke test in a scratch dir:
#   npm i @oriui/ui@next
```

## Troubleshooting

- **`402 Payment Required` / `404` on a scoped publish** — missing `--access public`,
  or the `oriui` org/scope doesn't exist or you lack publish rights.
- **`EOTP` / "one-time password is incorrect"** — the OTP expired; rerun with a fresh
  code.
- **A consumer's install can't resolve `@oriui/vue`** — an internal dep is still `*` or
  points at an unpublished version. Pin it and publish a **new** version.
- **"You cannot publish over the previously published versions"** — bump the version;
  published versions are immutable (and unpublish is restricted after 72h).

## Automation status

✅ **CI publish** — the `Release` workflow (`.github/workflows/release.yml`) builds and publishes via
the `NPM_TOKEN` automation secret, no OTP (step 3 above). The lockstep version bump is scripted
(`scripts/bump.mjs`), and `--access public` lives in each package's `publishConfig`.

🔄 **`changesets`** (auto version + changelog + PR-based releases) stays deferred: it can only version
packages that are **workspace members**, but the publishable `@oriui/ui` is the repo **root**. Adopting
it needs the full monorepo split (root → `packages/ui`), which [ROADMAP.md](ROADMAP.md) parks under
_Deferred_. The bump-script + CI-publish flow covers releases until then.
