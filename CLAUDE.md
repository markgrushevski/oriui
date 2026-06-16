# CLAUDE.md

Guidance for Claude Code / contributors working in this repository.

## What this is

**oriUI** (織り, "weaving") — a layered Vue 3 UI component library. Idea:
_prototype fast, scale without rewriting_. Three independently-consumable layers
woven around shared design tokens:

- `oriui` (styled) — ready components: `<OriButton variant="tonal" />`
- `oriui/headless` (behavior) — composables for focus/keyboard/ARIA _(planned)_
- `oriui/css` (style) — standalone `.ori-*` classes + tokens, works without Vue _(planned)_

Distinctive: zero-runtime theming via CSS custom properties, no Tailwind dependency
(standalone CSS), swappable adapters (behavior: own ↔ Reka UI; style: CSS ↔ optional
Tailwind preset). Full vision and phases in [ROADMAP.md](ROADMAP.md); key decisions and
their rationale in [DECISIONS.md](DECISIONS.md); the per-change review bar in [REVIEW.md](REVIEW.md).

**Status:** foundation refactor in progress. Done — toolchain modernization, rebrand
vueinjar → oriUI. Next — token/skin system, headless layer. Currently only the styled
layer exists (5 components: Button, Card, Avatar, Icon, Spinner).

## Commands

- `npm run dev` — Vite dev server (playground)
- `npm run build` — build to `dist/` (Vite → JS/CSS, then **vue-tsc** → `.d.ts`)
- `npm run types` — type-check without emit (`vue-tsc --noEmit`)
- `npm run test` — Vitest run (`test:watch`, `test:cov` for coverage, `test:types` to type-check the suite)
- `npm run lint:all` — prettier + stylelint + eslint (with `--fix`); `lint:ci` is the check-mode gate
  (no `--fix`) the GitHub Actions CI runs alongside `types` / `test:types` / `test` / `build`
- `npm run docs:dev` / `docs:build` — VitePress docs

Type declarations come from **vue-tsc** (`tsconfig.build.json`), NOT vite-plugin-dts
(v5 dropped `.vue` SFC support). The build fails on type errors.

Tests live in `tests/` (Vitest + happy-dom + `@vue/test-utils` + axe-core), kept out of `src`
so they never touch the lib build or `npm run types`. They assert the **behavior/a11y contracts**
(real `disabled`, `aria-busy`, roles, focus guards), the **headless contract** (OriDialog driven by
a fake `DialogAdapter` — no Zag), and **token contrast** (`tests/tokens.contrast.test.ts` parses the
skin CSS and asserts every role/on-role pair meets WCAG AA). `test:types` uses `tsconfig.vitest.json`.

## Structure

```
src/
  index.ts            entry: imports global css, re-exports types + components
  types.ts            shared token/prop types (ActionSize, ThemeColor, Variant, ...)
  components/<name>/   ori-<name>.vue + index.ts barrel
  styles/             design tokens + base css (sizes, themes, fonts, ...) — being restructured
docs/                 VitePress site (full rewrite planned in Phase 7)
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
