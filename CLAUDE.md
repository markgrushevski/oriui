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
Tailwind preset). Full vision and phases in [ROADMAP.md](ROADMAP.md).

**Status:** foundation refactor in progress. Done — toolchain modernization, rebrand
vueinjar → oriUI. Next — token/skin system, headless layer. Currently only the styled
layer exists (5 components: Button, Card, Avatar, Icon, Spinner).

## Commands

- `npm run dev` — Vite dev server (playground)
- `npm run build` — build to `dist/` (Vite → JS/CSS, then **vue-tsc** → `.d.ts`)
- `npm run types` — type-check without emit (`vue-tsc --noEmit`)
- `npm run lint:all` — prettier + stylelint + eslint (with `--fix`)
- `npm run docs:dev` / `docs:build` — VitePress docs

Type declarations come from **vue-tsc** (`tsconfig.build.json`), NOT vite-plugin-dts
(v5 dropped `.vue` SFC support). The build fails on type errors.

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

## Conventions

- Components `Ori*` (PascalCase); files `ori-<name>.vue`; tag `<ori-name>`.
- CSS: BEM classes `.ori-*`, custom properties `--ori-*`. Standalone CSS, no Tailwind.
- `<script lang="ts" setup>`; typed props via `withDefaults(defineProps<...>())`.
- Strict TypeScript; eslint (flat config) + stylelint + prettier (4-space indent, single quotes).
- Commits: Conventional Commits (`feat`/`fix`/`refactor`/`build`…; `!` for breaking).
  **Do NOT add a `Co-Authored-By` trailer.** Group changes into reasonably-sized commits
  (avoid many tiny ones).
- Pre-commit (husky + lint-staged) runs build + lint on staged files.

## Node

Requires Node >= 20.19 (Vite 8 / ESLint 10).
