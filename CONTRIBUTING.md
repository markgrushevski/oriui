# Contributing

How work flows through oriUI — branches, commits, versioning and releases. Coding conventions and commands are
in [CLAUDE.md](CLAUDE.md), the reasons behind them in [DECISIONS.md](DECISIONS.md), the publish mechanics in
[RELEASING.md](RELEASING.md).

Prerequisites: **Node ≥ 22.18** and npm. The repo uses **npm workspaces** — one root `npm install` wires
`docs/` and `packages/*`.

That floor is the **build** requirement and lives only in the root (private) `package.json`. What the
published packages ask of a consumer is a separate, looser claim: `@oriui/vue` and `@oriui/headless` declare
`"node": ">=22"`, and `@oriui/css` declares none, because a stylesheet has no runtime.
`tests/packaging.test.ts` holds that distinction.

## Branching

`main` is an **always-green trunk**: every commit on it is releasable, and the docs site deploys from it. It
advances whenever a coherent unit of work is done, not only at releases.

- Branch off `main` per unit of work, named after the commit type it will carry: `feat/…`, `fix/…`, `docs/…`,
  `refactor/…`, `build/…`, `chore/…`. Keep branches short-lived and focused.
- Merge with **`--no-ff`**, so `main`'s first-parent history records each branch as one merge commit, then
  delete the branch.

```bash
git switch -c feat/my-thing main
# … commits …
git switch main && git merge --no-ff feat/my-thing
git push origin main && git branch -d feat/my-thing
```

## Commits

[Conventional Commits](https://www.conventionalcommits.org): `feat` / `fix` / `refactor` / `build` / `docs` /
`chore` …, with `!` for a breaking change. Group work into reasonably sized commits.

A husky **pre-commit** hook runs `npm run build` + `lint-staged`, so a commit fails fast if the build or
formatting breaks. CI re-runs the gate on every push to `main` and every PR: `lint:ci → types → test:types →
test → build` on Node 22 and 24, then `size → publint → attw → smoke → docs:build` once, plus the Playwright
e2e in real Chromium. The whole list is one script, **`npm run gate`**, which the release workflow runs too;
`tests/packaging.test.ts` fails if a check reachable from `ci.yml` is not reachable from `release.yml`.

## Versioning

oriUI follows **SemVer**. The line is **`1.0.0-rc.*`**: the API is meant to be final, and a breaking change
before `1.0.0` needs a strong reason and a migration note.

The three packages move in **lockstep** and always share one version. `@oriui/vue` declares the other two as
**`peerDependencies`**, not `dependencies`: npm 7+ still installs them, but a version mismatch fails loudly
with `ERESOLVE` instead of silently nesting a second copy. That matters twice over — `@oriui/headless` holds
process-wide singletons that a duplicate breaks outright, and `@oriui/css` is a stylesheet the app imports,
so a `dependencies` entry could never enforce the match anyway. While the line is a prerelease those peer
ranges pin the exact version (a `^1.0.0` range cannot match `1.0.0-rc.N`); widening them is part of the 1.0
cutover in [RELEASING.md](RELEASING.md).

Every version publishes to the **`latest`** dist-tag, so `npm install @oriui/vue` always gets the current line.

## Releases

A release is a deliberate event, separate from merging to `main`, automated with
**[changesets](https://github.com/changesets/changesets)** in pre mode (`rc`):

1. **Add a changeset** with your change: `npm run changeset`, pick the bump, write the entry. It becomes the
   public CHANGELOG, so write it for consumers — what changed, what breaks, how to migrate. The three packages
   are one **fixed** group, so naming any one bumps all three.
2. **Merge to `main`.** The Release workflow opens or updates a **"Version Packages"** PR that applies the
   pending changesets — the lockstep version, the pinned internal peers and each `CHANGELOG.md`.
3. **Merge the "Version Packages" PR.** CI publishes over OIDC trusted publishing (no token, provenance
   attached) and tags the release commit (`@oriui/vue@x.y.z`).

The full runbook — the manual fallback, the dist-tag rules and the **1.0 cutover** (`changeset pre exit`) —
is in [RELEASING.md](RELEASING.md).
