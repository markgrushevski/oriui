# Contributing

How work flows through oriUI — branches, commits, versioning, and releases. The _why_ behind
these choices lives in [DECISIONS.md](DECISIONS.md); the coding conventions and commands in
[CLAUDE.md](CLAUDE.md); the npm publish mechanics in [RELEASING.md](RELEASING.md).

Prerequisites: **Node ≥ 20.19** (the Vite 8 floor) and npm. The repo uses **npm workspaces** —
a single root `npm install` wires the `docs/` and `packages/*` workspaces.

## Branching

`main` is an **always-green trunk** — every commit on it is releasable, and the docs site
deploys from it. So `main` advances whenever a coherent unit of work is done, **not only at
releases** (a release is a separate, tagged event — see below).

- Branch off `main` per unit of work, with a type-prefixed name that matches the commit it will
  carry: `feat/…`, `fix/…`, `docs/…`, `refactor/…`, `build/…`, `chore/…`.
- Keep branches **short-lived** and focused. (`refactor/oriui-foundation` was a one-off
  foundation epic; day-to-day work should be much smaller.)
- Integrate with a **`--no-ff` merge** so `main`'s first-parent history records each branch as a
  single merge commit — then delete the branch. Prefer a merge commit over a fast-forward.
- **The deciding factor is commit count, not size.** Anything that lands as **one commit** — even a
  big self-contained feature (a new package, a broad rename) — goes **straight to `main`**: commit there
  once the gates are green (no branch, no merge bubble). Create a branch + `--no-ff` merge **only when
  the work is several commits** to group under one merge, or it genuinely needs PR review / CI isolation
  before landing.

```bash
git switch -c feat/my-thing main
# … commits …
git switch main && git merge --no-ff feat/my-thing
git push origin main && git branch -d feat/my-thing
```

## Commits

[Conventional Commits](https://www.conventionalcommits.org). See **CLAUDE.md › Commits** for the
full rules: types (`feat` / `fix` / `refactor` / `build` / `docs` / `chore` …), `!` for breaking,
author **Leonid**, **no `Co-Authored-By` trailer**, and grouping into reasonably-sized commits.

A husky **pre-commit** hook runs `npm run build` + `lint-staged` on every commit, so a commit
fails fast if the build or formatting breaks. CI (GitHub Actions) re-runs the gate on every push
to `main` and every PR: `lint:ci → types → test → build` across Node 20.19 and 22.

## Versioning

oriUI follows **SemVer**. The line is currently **`1.0.0-alpha.0`** — alpha, so the public API
may shift before `1.0`.

The four published packages move in **lockstep**: `@oriui/vue`, `@oriui/css`, `@oriui/headless`, and
`@oriui/headless` always share one version, and their internal dependencies are pinned to that exact
version (a
`*` range cannot match a prerelease — see [RELEASING.md](RELEASING.md)). Prereleases publish
under the **`next`** npm dist-tag, so a plain `npm install @oriui/vue` does not pick up an alpha.

## Releases & tags

A **release is a deliberate event, separate from merging to `main`.** Merging puts code on the
trunk; a release maps a chosen `main` commit to a published npm version and a git tag:

1. **Bump** all four package versions (and the pinned internal deps) in lockstep, sync the
   lockfile (`npm install --package-lock-only`), and commit on `main`.
2. **Green check** — `npm run lint:ci && npm run types && npm run test && npm run build`.
3. **Publish** to npm — the dependency-ordered runbook in [RELEASING.md](RELEASING.md).
4. **Tag** the release commit and push the tag:

    ```bash
    git tag -a v1.0.0-alpha.0 -m "v1.0.0-alpha.0"
    git push origin v1.0.0-alpha.0
    ```

The tag is what ties a published version to an exact commit, so every `@oriui/vue@x` is checkout-able.
Automating this — `changesets` + a CI publish job (`NPM_TOKEN`) — is a Phase 8 to-do; see
[ROADMAP.md](ROADMAP.md).
