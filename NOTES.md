# Implementation notes

A running log of **non-obvious implementation nuances and gotchas** — things that cost real time to
work out but don't rise to an architectural decision. Read this first; **append** anything you
discover so the next person (or agent) doesn't re-analyze it.

Companion to [CLAUDE.md](CLAUDE.md) (conventions), [DECISIONS.md](DECISIONS.md) (rationale / ADRs),
and [REVIEW.md](REVIEW.md) (the per-change bar). Architectural decisions go in DECISIONS.md; small
practical gotchas go here.

## Verification / preview MCP

- **`:focus` / `:checked` computed styles don't reflect a programmatic change** right after
  navigation or after dispatching an event. Causes: `document.hasFocus() === false` in the preview
  tab (so `:focus` never matches), and Vue's `v-model` re-asserts `checked` on its next render. To
  verify a `:checked ~ …` or `:focus` style: set the property, force a reflow (`void el.offsetWidth`),
  and re-read on a **settled** page — or just confirm the CSS rule exists + the token (`--ori-color`)
  resolves. Do **not** dispatch a `change` event before reading (Vue resets it).
- **Screenshots are flaky** (paint hang). Prefer `preview_eval` (DOM/`getComputedStyle`) and
  `preview_inspect` for verification; use screenshots only as a last resort.
- Navigate with an **absolute** URL: `window.location.href = 'http://localhost:5173/...'` (a bare
  `/path` once errored on cold boot). Get the `serverId` from `preview_list` (it changes per run).

## Docs (Nuxt Content + MDC)

- A **new component in a new dir** plus a change to the global-registration plugin
  (`docs/app/plugins/oriui.ts`) may need a **dev-server restart** for MDC to resolve the new
  `:ori-*` tag — HMR usually picks it up, but not always.
- MDC inline component **booleans**: write `:prop="true"` (v-bind), never bare `prop` or
  `prop="true"` — the string form triggers Vue prop-type warnings.
- MDC inline **arrays/objects**: `:options='[{"label":"A","value":"a"}]'` (single-quoted JSON)
  parses correctly.
- New oriUI components must be registered in `docs/app/plugins/oriui.ts` (for MDC) **and** added to
  the sidebar in `docs/app/layouts/default.vue`.
- Component doc pages follow the **Button page template** (Examples → Props → Events → Slots → CSS
  classes → Accessibility; interactive components add Anatomy + Headless + keyboard table).

## Lint / formatting

- `.lintstagedrc.json` runs **stylelint → eslint → prettier (last)** so Prettier is authoritative.
  Don't hand-fight CSS property order — `stylelint --fix` applies the SMACSS order, then Prettier
  formats whitespace. Locally, run `stylelint --fix` then `prettier --write` (prettier last).
- `currentcolor` must be **lowercase** (stylelint `value-keyword-case`).
- CI gate is `npm run lint:ci` (check-mode prettier/stylelint/eslint — no `--fix`).
- `.prettierignore` excludes build output (`.output`, `.nuxt`, `coverage`, `dist`).

## Component / CSS patterns

- Component `<style>` is **unlayered** on purpose (it wins over the `@layer` utilities); modifiers use
  the house `.ori-x.ori-x_y` compound pattern (not `:where()`), consistent across the library.
- Form controls: a **real hidden native input** (`opacity:0` over the visual element) drives a11y;
  style the visual via `:checked ~`, `:focus-visible ~`. The accent + ring read `var(--ori-color)`
  set by the `ori-color` class on the wrapper (inherits down).
- `useId()` (Vue 3.5) for SSR-safe ids; pass props referenced in `<script>` through the reactive
  destructure (template-only props can stay undestructured). Gate any Teleport on a `mounted` ref —
  the library can't use Nuxt `<ClientOnly>`.
- Read tokens via resolved aliases (`--ori-size-action`, `--ori-color`), never raw scale tokens.

## Build / tests

- Tests live in `tests/` (out of `src`); `vitest.config.ts` aliases `@oriui/*` to package **source**,
  so the suite needs no `build:packages` first.
- The lib build keeps `@oriui/*` **external**; root `build` runs `build:packages` (tsdown) first so
  `vue-tsc` can resolve the package `.d.ts`.
- Behavioral components (OriDialog) are tested against a **fake adapter** (`tests/helpers/fake-dialog.ts`),
  not Zag — the lib's test graph stays engine-free.

## Git / Windows

- Conventional Commits; **no `Co-Authored-By` trailer**; group into reasonably-sized commits.
- Pre-commit (husky + lint-staged) runs `npm run build` + lint-staged on staged files.
- `LF will be replaced by CRLF` warnings on commit are normal on Windows — harmless.
