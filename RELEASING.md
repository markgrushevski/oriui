# Releasing oriUI

How to cut and publish an oriUI release to npm. oriUI is a small monorepo — three
publishable packages plus the docs workspace. This is the **manual runbook** for the
alpha line; CI-driven releases (`changesets`) are tracked in [ROADMAP.md](ROADMAP.md)
Phase 8.

## Packages & layout

| Package       | Path            | Public name   | Depends on    |
| ------------- | --------------- | ------------- | ------------- |
| Styled + CSS  | `.` (root)      | `@oriui/ui`   | `@oriui/vue`  |
| Vue headless  | `packages/vue`  | `@oriui/vue`  | `@oriui/core` |
| Core contract | `packages/core` | `@oriui/core` | —             |

Internal dependencies are **pinned to the exact version** (not `*`): a `*` range does
not match a prerelease, so `@oriui/ui@1.0.0-alpha.0` declaring `"@oriui/vue": "*"` would be
uninstallable. Keep all three versions in lockstep.

## One-time setup

1. **npm organization** — the `@oriui` scope needs an org named `oriui` on npm
   (npmjs.com → _Add Organization_ → **Free**, unlimited public packages). You must be
   a member with publish rights.
2. **Login** — `npm login`. The account has **2FA-for-writes**, so every publish needs
   a one-time password (OTP).

## Cut a release

### 1. Bump versions in lockstep

Set the same new version across all three packages **and** the pinned internal deps:

- `package.json` — `version` + `dependencies."@oriui/vue"`
- `packages/vue/package.json` — `version` + `dependencies."@oriui/core"`
- `packages/core/package.json` — `version`

Then sync the lockfile and commit:

```bash
npm install --package-lock-only
```

### 2. Green check

```bash
npm run lint:ci && npm run types && npm run test && npm run build
```

### 3. Publish in dependency order

Each publish needs a **fresh OTP** and `--access public` (scoped packages are private
by default, which would otherwise demand a paid plan):

```bash
npm run build
npm publish -w @oriui/core --access public --tag next --otp=XXXXXX
npm publish -w @oriui/vue  --access public --tag next --otp=XXXXXX
npm publish                --access public --tag next --otp=XXXXXX
```

Order matters so the whole graph exists in the registry by the time anyone installs:
`@oriui/core` → `@oriui/vue` → `@oriui/ui`.

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

## Not automated yet

Per [ROADMAP.md](ROADMAP.md) Phase 8: `changesets` for version/changelog management and
a CI publish job (`NPM_TOKEN`, alpha on the `next` tag) are still to do. Until then this
runbook is manual.
