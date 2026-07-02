# AGENTS.md

Tool-agnostic entry point for AI coding agents. **[`CLAUDE.md`](CLAUDE.md) is the source of truth** —
this file is a short map; read it (and the docs it links) before non-trivial work. Claude Code reads
`CLAUDE.md`; other tools read this.

## What this is

**oriUI** (織り, "weaving") — a layered Vue 3 UI library. Three independently-consumable packages woven
around shared design tokens: `@oriui/vue` (styled components), `@oriui/headless` (behavior),
`@oriui/css` (standalone tokens + `.ori-*` classes). Node ≥ 22.18, npm workspaces.

## Setup & commands

```bash
npm install          # wires docs/ + packages/* workspaces
npm run dev          # docs dev server (Nuxt, :5173)
npm run build        # build the three packages to dist/
npm run types        # type-check (vue-tsc --noEmit)
npm run test         # Vitest + happy-dom + axe
npm run lint:all     # prettier + stylelint + eslint (--fix); lint:ci is the check-mode gate
```

CI gate on every push / PR: `lint:ci → types → test:types → test → build`. Keep it green.

## Layout

```
packages/vue/        @oriui/vue — styled SFCs (src/components/<name>/ori-<name>.vue + index.ts)
packages/headless/   @oriui/headless — engine (src/core/) + Vue adapter (src/vue/)
packages/css/        @oriui/css — design tokens + .ori-* utilities
docs/                Nuxt Content docs site
tests/               Vitest suite (kept out of src/)
```

## Conventions agents get wrong (full set in CLAUDE.md)

- **Props:** reactive-props destructure with defaults — `const { size = 'md' } = defineProps<…>()`,
  **not** `withDefaults`. Props optional + alphabetical. Feed composables a getter to stay reactive:
  `useFocus(() => disabled)`, not `useFocus(disabled)`.
- **State via attributes, not classes:** real `disabled` / `aria-busy` / `aria-pressed` styled with
  attribute selectors — the a11y-correct source of truth (matches the headless layer).
- **Imports:** types from `../../types`, then sibling components (`from '../icon'`). **Never** the root
  barrel `../../` — it creates an import cycle.
- **Style:** `<style>` is deliberately **not** scoped — global `.ori-*`, cascade-safe via `@layer` + the
  prefix. Two-tier tokens (raw scale + resolved alias); flat specificity with `:where()`.
- **Format/lint:** prettier — 4-space, single quotes, semicolons, width 120, no trailing comma. BEM
  selectors + SMACSS property order (stylelint).
- **Commits:** Conventional Commits, author **Leonid**, **no `Co-Authored-By` trailer**. Group into
  reasonably-sized commits (avoid many tiny ones).

## Docs map

| File                                                | What                                                   |
| --------------------------------------------------- | ------------------------------------------------------ |
| [`CLAUDE.md`](CLAUDE.md)                            | **Source of truth** — conventions, commands, structure |
| [`CONTRIBUTING.md`](CONTRIBUTING.md)                | branch / commit / versioning / release workflow        |
| [`DECISIONS.md`](DECISIONS.md)                      | key decisions + their rationale                        |
| [`REVIEW.md`](REVIEW.md)                            | the per-change review bar                              |
| [`NOTES.md`](NOTES.md)                              | non-obvious implementation gotchas                     |
| [`ROADMAP.md`](ROADMAP.md) / [`IDEAS.md`](IDEAS.md) | the plan + component / class backlog                   |
| [`RELEASING.md`](RELEASING.md)                      | npm publish runbook (changesets + OIDC)                |

Every change should pass the CI gate and the [`REVIEW.md`](REVIEW.md) bar. Nested `AGENTS.md` files per
package are supported by the convention but unnecessary here — the layout above covers it.
