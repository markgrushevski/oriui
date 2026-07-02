# CLAUDE.md

Guidance for Claude Code / contributors working in this repository.

## What this is

**oriUI** (織り, "weaving") — a layered Vue 3 UI component library. Idea:
_prototype fast, scale without rewriting_. Three independently-consumable layers
woven around shared design tokens:

- `@oriui/vue` (styled) — ready components: `<OriButton variant="tonal" />`
- `@oriui/headless` (behavior) — composables for focus/keyboard/ARIA
- `@oriui/css` (style) — standalone `.ori-*` classes + tokens, works without Vue

Distinctive: zero-runtime theming via CSS custom properties, no Tailwind dependency
(standalone CSS), swappable adapters (behavior: own ↔ Reka UI; style: CSS ↔ optional
Tailwind preset). Full vision and phases in [ROADMAP.md](ROADMAP.md); the candidate-component /
class backlog in [IDEAS.md](IDEAS.md); key decisions and
their rationale in [DECISIONS.md](DECISIONS.md); the per-change review bar in [REVIEW.md](REVIEW.md);
non-obvious implementation gotchas in [NOTES.md](NOTES.md); the npm publish runbook in
[RELEASING.md](RELEASING.md); the branch / commit / release workflow in [CONTRIBUTING.md](CONTRIBUTING.md).

**Status:** foundation refactor well underway. Done — toolchain modernization, rebrand
vueinjar → oriUI, the token/skin system, the headless layer (`useDialog` / `useDisclosure` behind a
swappable adapter), the Vitest + axe suite, GitHub Actions CI, and **31 styled components** (Button,
Card, Avatar, Icon, Spinner, Dialog, Input, Field, Combobox, Checkbox, Switch, RadioGroup). Next — more form/overlay
components, the docs-template rollout, npm publish.

## Working modes (solo / orchestrated)

Two ways to run, same foundation — the main session is always the orchestrator (plans, integrates,
talks to you); modes differ in **who executes**.

- **Solo (default):** one model does everything end-to-end. Best for sequential/focused work, small
  changes, and conversation.
- **Orchestrated (opt-in):** work fans out to role-configured subagents running in parallel via the
  Workflow tool — faster wall-clock on _parallelizable_ work (several components/pages, an audit, a
  multi-dimension review), at higher token cost. It does **not** speed up a single sequential task.

**Protocol:** default to solo. Before a substantial _parallelizable_ task, **ask** which mode (with a
rough estimate: roles, agent count, tokens). Trivial/conversational turns stay solo silently. A
standing override ("always orchestrate" / "always solo" / "ask each time") holds until changed; the
default is "ask each time".

**Roles** (`.claude/agents/`): `oriui-builder` (Opus), `oriui-test-author` (Sonnet),
`oriui-docs-author` (Sonnet); review lenses `oriui-architect` (Opus, architecture — reviews + proposes), `oriui-reviewer` (Opus, code/contract),
`oriui-design-reviewer` (Opus, visual/UX), `oriui-a11y-auditor` (Opus, deep a11y),
`oriui-perf-reviewer` (Sonnet, size/zero-runtime), and `oriui-docs-reviewer` (Sonnet, docs
accuracy/staleness). They share the bar by reading
CLAUDE.md / DECISIONS.md / REVIEW.md / NOTES.md; agents **report** new gotchas and the orchestrator
records them in NOTES.md (so nothing is analyzed twice). Agents touch only their own files; the
orchestrator wires shared files (barrels, the docs plugin/sidebar) to avoid parallel-edit conflicts.

## Commands

- `npm run dev` — docs dev server (Nuxt, port 5173); alias of `docs:dev` (root `dev` runs the docs workspace)
- `npm run build` — build the library to `dist/` (Vite → JS/CSS, then **vue-tsc** → `.d.ts`); `build:watch` watches
- `npm run types` — type-check without emit (`vue-tsc --noEmit`)
- `npm run test` — Vitest run (`test:watch`, `test:cov` for coverage, `test:types` to type-check the suite; `test:e2e` runs the Playwright e2e in real Chromium)
- `npm run lint:all` — prettier + stylelint + eslint (with `--fix`); `lint:ci` is the check-mode gate
  (no `--fix`) the GitHub Actions CI runs alongside `types` / `test:types` / `test` / `build`
- `npm run docs:dev` / `docs:build` / `docs:preview` — Nuxt (Nuxt Content) docs: dev server, static
  generate (`nuxi generate`), and preview of the generated output

Type declarations come from **vue-tsc** (`tsconfig.build.json`), NOT vite-plugin-dts
(v5 dropped `.vue` SFC support). The build fails on type errors.

Tests live in `tests/` (Vitest + happy-dom + `@vue/test-utils` + axe-core), kept out of `src`
so they never touch the lib build or `npm run types`. They assert the **behavior/a11y contracts**
(real `disabled`, `aria-busy`, roles, focus guards), the **headless contract** (OriDialog driven by
a fake `DialogAdapter` — no Zag), and **token contrast** (`tests/tokens.contrast.test.ts` parses the
skin CSS and asserts every role/on-role pair meets WCAG AA). `test:types` uses `tsconfig.vitest.json`.

## Structure

```
packages/
  vue/                  @oriui/vue — styled components (the main publishable package)
    src/index.ts        entry: re-exports types + components
    src/types.ts        shared token/prop types (ActionSize, ThemeColor, Variant, ...)
    src/components/<name>/   ori-<name>.vue + index.ts barrel
  headless/             @oriui/headless — framework-agnostic engine (`.`) + Vue adapter (`./vue`)
    src/core/           the engine: state machines, prop-getters, the OriHeadless contract
    src/vue/            the Vue composables (useDialog / useDisclosure)
  css/                  @oriui/css — standalone design tokens + .ori-* utilities (the CSS layer)
docs/                   Nuxt (Nuxt Content) site — app/ (layout, components, composables), content/ (md pages)
```

Components import types from `../../types` and sibling components directly (e.g.
`../icon`) — never from the root barrel `../../`, to avoid an import cycle.

## Code conventions

Tooling enforces formatting (prettier: 4-space, single quotes, semicolons, width 120,
no trailing comma) and lint rules (eslint flat config; stylelint with a BEM selector
pattern + SMACSS property order). The conventions below carry the intent tooling can't —
each is a deliberate engineering choice, not legacy to copy blindly.

### Components (SFC)

- Block order `<script lang="ts" setup>` → `<template>` → `<style>`. `<style>` is **not
  scoped** on purpose — classes are real global `.ori-*` so the css layer ships standalone.
  Cascade safety comes from `@layer` + the `ori-` prefix, not from scoping.
- Declare props with **reactive props destructure** (Vue 3.5+), not `withDefaults` —
  defaults co-locate with the declaration and there is no `@default` JSDoc to drift:
    ```ts
    const { color = 'primary', size = 'md' } = defineProps<{ color?: ThemeColor; size?: ActionSize }>();
    ```
    When a prop feeds a composable/`watch`, pass a getter to keep it reactive:
    `useFocus(() => disabled)`, not `useFocus(disabled)` (lint: `vue/no-setup-props-reactivity-loss`).
- Props are optional + **alphabetically ordered**; make one required only when the component
  is incorrect without it (e.g. an accessible label for an icon-only control).
- Imports: types from `../../types` first, then sibling components (`from '../icon'`);
  never the root barrel `../../` (import cycle).

### Templates & styling API

- Structure via BEM classes: block `ori-button`, element `ori-button__icon`.
- Variant / size / color via classes (the css layer needs class ergonomics), driven by the
  **two-tier token pattern**: raw scale tokens in `:root` (`--ori-size-action_md: 40px`) + a
  resolved alias (`--ori-size-action`) that a class repoints; components read only the alias.
  Keep specificity flat with `:where()` and put rules in `@layer` so consumer overrides
  always win — avoid the specificity-stacking of `.a.a_b` selectors.
- Dynamic **state via attributes, not classes**: real `disabled` / `aria-disabled`,
  `aria-busy` (loading), `aria-pressed` / `data-active` (toggles), styled with attribute
  selectors. This is the a11y-correct source of truth and matches the headless layer.
- Derive state colors with `color-mix(in srgb, var(--ori-color), …)`; wrap hover in
  `@media (hover: hover)` (no sticky hover on touch).

### Performance

- Theming is zero-runtime: switching skin/size/variant is a class or attribute toggle, no JS;
  `var()` indirection is cheap. The cost to watch is CSS **size** (one selector per scale
  value) — prefer shared utilities under `@layer` over per-component duplication.
- Keep render light: don't compute in JS what a CSS variable can resolve.

### Commits

- Conventional Commits (`feat`/`fix`/`refactor`/`build`/`docs`…; `!` for breaking).
  **No `Co-Authored-By` trailer.** Group changes into reasonably-sized commits (avoid many
  tiny ones). Pre-commit (husky + lint-staged) runs build + lint on staged files.

## Node

Requires Node >= 20.19 (Vite 8 / ESLint 10).
