# CLAUDE.md

Guidance for anyone — human or agent — changing this repository.

## What this is

**oriUI** (織り, "weaving") — a layered UI library: _prototype fast, scale without rewriting_. Three packages,
each usable alone, woven around one set of design tokens:

- `@oriui/css` — tokens, `.ori-*` classes and one stylesheet per component; no JavaScript.
- `@oriui/headless` — a framework-agnostic behaviour core (focus, keyboard, ARIA) with Vue, Svelte and React
  adapters behind a swappable `OriHeadless` contract.
- `@oriui/vue` — styled Vue components: the two above, wired together.

Theming is zero-runtime (CSS custom properties), with no Tailwind dependency.

## Where things are written

| File                               | Holds                                                    |
| ---------------------------------- | -------------------------------------------------------- |
| [README.md](README.md)             | install and first use, for consumers                     |
| [CONTRIBUTING.md](CONTRIBUTING.md) | branches, commits, versioning                            |
| [RELEASING.md](RELEASING.md)       | the npm publish runbook                                  |
| [REVIEW.md](REVIEW.md)             | the bar every change clears                              |
| [DECISIONS.md](DECISIONS.md)       | why things are the way they are                          |
| [NOTES.md](NOTES.md)               | non-obvious traps already paid for                       |
| [IDEAS.md](IDEAS.md)               | what might be built next                                 |
| [ISSUES-INNER.md](ISSUES-INNER.md) | open problems we fix here                                |
| [ISSUES-OUTER.md](ISSUES-OUTER.md) | open problems owned by a browser, dependency or registry |

One fact, one home: write in the file whose question it answers, and link instead of repeating.

## Writing rules

- **Registers hold only live problems, newest on top.** Delete an entry in the change that fixes it; a lesson
  worth keeping becomes one line in NOTES.md, a "won't fix" an entry in DECISIONS.md. Read ISSUES-INNER before
  reviewing — a listed problem is not a new finding. A consumer's own `ISSUES-OUTER.md` (justpaint's
  `docs/ISSUES-OUTER.md`) is our inbound queue: accept a report by opening an `ORI-I-*` entry naming its id.
- **Comments say why, briefly** — the constraint and the non-obvious reason, not the story of how it was found.
  No register ids or consumer names in code: they rot when the entry closes.
- **Changesets are public** — they become the npm CHANGELOG. What changed, what breaks, how to migrate; no
  internal ids, repo-doc references or process narrative.
- **Docs speak as the project** ("we"), for other developers.

## Working modes

- **Solo (default):** one model does the work end to end.
- **Orchestrated (opt-in):** role agents from `.claude/agents/` run in parallel — builders and authors for
  components, tests and docs pages; review lenses for architecture, code, design, a11y, performance and docs.
  Worth it only for parallelizable work (several components, an audit, a multi-lens review). Ask first, with a
  rough estimate of roles, agent count and tokens. Agents report; the orchestrating session records findings
  and wires shared files (barrels, the docs sidebar), so nothing is edited in parallel.

## Commands

- `npm run dev` — the docs site (Nuxt, port 5173); `docs:build` generates it statically, `docs:preview` serves
  the output
- `npm run build` — build the three packages (`size:build` builds, then checks the gzip budgets in
  `.size-limit.json`; `size` checks an existing build)
- `npm run types` — type-check every package; `test:types` type-checks the test suite
- `npm run test` — Vitest (`test:watch`, `test:cov`); `test:e2e` — Playwright in real Chromium
- `npm run lint:all` — prettier + stylelint + eslint with `--fix`; `lint:ci` is the check-only gate
- `npm run gate` — everything CI runs, in one script (the release workflow runs it too)

Tests in `tests/` (Vitest + happy-dom + `@vue/test-utils` + axe) cover behaviour, a11y, the headless contract
and token contrast. Anything about layout, pixels or composited colour goes to `e2e/`: happy-dom has no layout
engine and cannot evaluate `color-mix`. Type declarations come from `vue-tsc`, and the build fails on a type
error.

## Structure

```
packages/
  css/        @oriui/css — tokens, utilities, src/components/<name>.css (one per component)
  headless/   @oriui/headless — src/core (engine) + src/vue, src/svelte, src/react (adapters)
  vue/        @oriui/vue — src/components/<name>/ori-<name>.vue + index.ts; src/types.ts
docs/         Nuxt Content site — app/ (shell), content/ (pages; inline demos are live components)
tests/  e2e/  unit + a11y suite; real-browser suite
```

## Code conventions

Prettier and the linters enforce formatting (4 spaces, single quotes, no semicolons, width 120), BEM selectors
and SMACSS property order. The rules below are the intent tooling cannot check.

### Components

- An SFC is `<script lang="ts" setup>` + `<template>` — **no `<style>` block**. Its CSS lives in
  `packages/css/src/components/<name>.css` under `@layer ori.components`, imported by `styles.css`, so the CSS
  layer stands alone.
- Props use **reactive props destructure**, not `withDefaults`:
    ```ts
    const { color = 'primary', size = 'md' } = defineProps<{ color?: ThemeColor; size?: ActionSize }>()
    ```
    A prop feeding a composable or `watch` goes in as a getter: `useFocus(() => disabled)`.
- Props are optional and **alphabetical**; one is required only when the component is wrong without it (an
  accessible label on an icon-only control).
- Import types from `../../types`, then siblings (`from '../icon'`) — never the root barrel `../../` (an import
  cycle).

### Styling

- BEM: block `ori-button`, element `ori-button__icon`.
- Variant, size and color are classes over **two-tier tokens**: a raw scale in `:root`
  (`--ori-size-action_md`) and an alias (`--ori-size-action`) a single class repoints; components read only the
  alias. A prop value becomes a class name, so renaming a value renames a public class.
- Specificity stays flat (`:where()`, `@layer`), so consumer overrides always win.
- **State is an attribute, not a class**: real `disabled`, `aria-busy`, `aria-pressed`, `data-*`.
- Derive state colours with `color-mix(in srgb, var(--ori-color), …)`; put hover inside `@media (hover: hover)`.
- Zero runtime: nothing JS computes what a CSS variable can resolve. The cost to watch is CSS size.

### Commits

Conventional Commits (`feat` / `fix` / `refactor` / `docs` / `build` …, `!` for breaking), reasonably sized.
**No `Co-Authored-By` trailer.** Work on a branch and merge to `main` with `--no-ff` (CONTRIBUTING.md). The
pre-commit hook runs the build and lint-staged.

Node ≥ 22.18.
