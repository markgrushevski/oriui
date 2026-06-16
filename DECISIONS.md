# Decisions

Architecture decision log for oriUI — the "why" behind key choices, so they aren't
relitigated after a context compaction or by a new contributor. Companion to
[ROADMAP.md](ROADMAP.md) (what / when) and [CLAUDE.md](CLAUDE.md) (how). Newest first.

## Headless = framework-agnostic core + thin per-framework adapters (Zag-mirrored)

Chosen over Vue-only composables — the user wants genuine multi-framework (Vue now, Svelte
next, maybe React). The architecture mirrors Zag.js / Ark UI (verified against their source):

- **`core/` (vanilla TS, zero framework deps):** per-primitive `machine` (a tiny typed reducer
  and a `scope` for deterministic, SSR-safe ids) plus `connect(service, normalizeProps)`
  returning **prop-getters per anatomy "part"** (`getRootProps`, `getTriggerProps`,
  `getContentProps`). Getters carry ARIA, ids, `data-state`, real attributes (`hidden`,
  `aria-expanded`) and event handlers that `send()` — our "state via attributes" contract.
- **Per-framework adapter = only three small things:** (1) a `bindable` reactive cell (Vue
  `shallowRef`, Svelte 5 `$state`, identical interface); (2) `normalizeProps` (Vue
  `onInput`/object-style ↔ Svelte `oninput`/string-style); (3) a ~20-line `useMachine` owning
  lifecycle. Re-render is the normal path: wrap `connect` in `computed` / `$derived`.
- **Public API = composables returning prop-getters**, not renderless components:
  `useDisclosure(opts) → { rootProps, triggerProps, contentProps, state }`. Smallest stable
  contract; maps 1:1 to the Svelte twin. Reactive options as getters; SSR ids via `useId()` /
  `$props.id()`.
- **Hand-roll the core; no state-machine dependency.** For Disclosure/Toggle/Tabs the machine
  is a ~10-line reducer (Zag's own core is "a minimal xstate fsm"). Copy Zag's
  `create-anatomy.ts` (~40 LOC) and `merge-props.ts` (~60 LOC) verbatim (MIT, with attribution).
  Real difficulty is focus / roving-tabindex / keyboard (Tabs) — budget a `dom-query`-like helper.
- **Swappable-adapter framing corrected: own ↔ Zag, not own ↔ Reka.** Reka UI (ex-Radix-Vue) is
  **Vue-only** (Radix context-components, no Zag — verified, no `@zag-js` dep). Mirroring Zag's
  `useMachine → connect(service, normalize) → spread getters` seam lets us drop real
  `@zag-js/<component>` machines behind our `connect` for hard widgets (combobox/date) later.

First primitives, driven by docs needs: **Disclosure** (sidebar groups, mobile nav) →
**Toggle** (OriButton toggle state) → **Tabs** (example demo/source switch).

## Packaging = scoped monorepo packages, not subpath exports

Multi-framework needs **separate npm packages**: `dependencies`/`peerDependencies` are declared
once per package, so a single `oriui` with `./headless/vue` + `./headless/svelte` subpaths would
force a Svelte consumer to carry `vue` as a peer (and vice-versa). Ark UI proves the split —
`@ark-ui/vue` (peer vue) and `@ark-ui/svelte` (peer svelte) are separate; a Svelte app installs
zero Vue. So: `@oriui/core` (vanilla TS) ← `@oriui/vue` (peer vue), later `@oriui/svelte` (peer
svelte); styled stays `oriui`; `@oriui/css` split deferred.

- **Build:** per-package — `tsup` (core, ESM), Vite-lib + `vue-tsc` (vue, reuse current),
  `svelte-package` (svelte, later); validate exports with `publint` + `@arethetypeswrong/cli`.
- **Tooling:** keep **npm workspaces** for now (pnpm's phantom-dep strictness pays off at Svelte
  time — switch then); `changesets` at first publish; skip Turborepo/Nx (overkill solo).
- **Testing (Phase 6):** vitest + @testing-library/{dom,user-event,jest-dom,vue,svelte} +
  axe-core + vitest-axe (matches Ark's own stack).

## Docs tooling: add nuxt-llms; mcp-toolkit optional; spyglass no

`nuxt-llms` (NuxtLabs) auto-generates `llms.txt` / `llms-full.txt` with built-in `@nuxt/content`
integration — a cheap, modern "AI-readable docs" signal. `@nuxtjs/mcp-toolkit` (dev-time MCP
server to introspect the app) is a nice DX extra — optional, deferred. `nuxt-spyglass`
(experimental unified logs) is a debug tool, not docs infra — skip. For the docs UI later:
`@nuxt/icon` (Iconify) + `@nuxt/fonts`.

## Docs = a dogfooded Nuxt app built with oriUI (replaces VitePress)

The docs site is the project's portfolio centerpiece, so it is built **with oriUI itself** —
the way Nuxt UI / PrimeVue / Vuetify dogfood their own libraries — rather than on VitePress's
own design-system theme (which you fight to override). Decision: a **Nuxt 4 + Nuxt Content 3**
app provides the undifferentiated plumbing (routing, markdown→Vue via MDC, SSG, search) while
the entire visible surface (shell, nav, demos, toggles) is oriUI. The docs' needs become the
**forcing function** for the component catalog + headless layer — every shell piece that isn't
yet an ori component is the next thing to build.

- **Layout:** docs is a private **npm workspace** (`docs/`, `workspaces: ["docs"]`); a single
  root `npm install` installs it. It imports components as `from 'oriui'`, aliased in
  `nuxt.config` to `../src` for live HMR (dogfoods source; a true package dep arrives with the
  `@oriui/*` monorepo split). Publishing is unaffected — `files: ["dist"]`, docs is `private`.
- **Theming:** the whole shell uses `--ori-color-*` tokens, so the nav theme (light/dark via
  `html.dark`) + skin (`data-ori-skin`) toggles reskin the entire site, not just the demos. An
  inline head script applies the saved theme/skin before paint (no flash).
- **Trade-off accepted (user chose "commit to Nuxt now"):** more non-ori scaffolding up front
  (shell starts as plain markup, replaced by ori components as they land) in exchange for the
  "this is a real app built on my library" signal sooner. Rejected: staged VitePress-theme
  dogfooding (cheaper, but VitePress's shell never becomes truly ours).

## Living preview = the VitePress docs, not a standalone playground

The dev playground (`index.html` + `playground/`) duplicated what the docs already do — the
docs render live components through the `@lib` → `src/` alias. Consolidated onto one preview
surface: `npm run dev` now runs VitePress, the playground grid moved to `docs/playground.md`,
and component pages grow alongside each feature (so Phase 7 becomes polish + comparison prose +
theme gallery, not a from-scratch docs build). Light/dark rides VitePress's built-in appearance
toggle — our dark selector is `:root.dark`, which VitePress sets on `<html>` — so only a nav
**skin** toggle is custom (switches `data-ori-skin`, neutral ↔ ori, persisted to localStorage).
The full foundation (`styles.css`, not just `reset.css`) is imported in the docs theme and the
5 components are globally registered, so tokens and components are available site-wide.

## Reorder: a11y-polish the 5 components before the headless adapter (Phase 4 ↔ 5)

The current components are presentational; a full headless contract + Reka adapter pays off
for interactive widgets (Modal / Menu / Combobox) that don't exist yet, so building it now
risks a wrong abstraction. Bring the 5 components to production a11y first (dynamic state via
attributes, `:focus-visible`, roles/labels), then ground the headless contract + swappable
adapter on the first genuinely interactive component. Approved by the user (fewer reworks).

## Working mode: Opus implements, decisions written here, user compacts

Opus does implementation directly (best judgment + continuity); every key decision lands in
this file / CLAUDE.md / ROADMAP.md so it survives a `/compact`, and the harness task list
holds in-flight progress. A `sonnet` subagent is used only for clearly-mechanical, high-volume
work (one transform across many files, scaffolding from a template). Rejected: full Sonnet
delegation — cheaper per token, but it executes spec literally without questioning intent
(it left a token ramp defined-but-unwired and contorted token names around a lint rule
instead of relaxing the rule). Judgment-heavy work needs Opus review.

## CSS tokens: `@layer` + two-tier aliases + numeric neutral ramp as single source

- `@layer ori.reset, ori.tokens, ori.base, ori.components, ori.utilities` → predictable,
  consumer-overridable cascade with flat specificity (`:where()`), instead of scoped styles.
- Two-tier: raw scale token (`--ori-size-action_md`) + a resolved alias (`--ori-size-action`)
  repointed by a utility class; components read only the alias.
- Numeric neutral ramp `--ori-neutral-50..950` is the single source of truth; semantic role
  tokens (`--ori-color-surface`, …) reference it instead of duplicating hex.
- Every color ships a contrast-checked `--ori-color-on-*` (WCAG AA); the `fill` variant text
  uses the on-color (fixes contrast on filled surfaces).

## Design system = token contract + skins (not "be Material 3")

Default skin is vendor-neutral (slate ramp + a calm slate-blue accent; status hues
red/green/amber are reserved for status, not brand) and stays strict WCAG AA. Optional skins
override the role source tokens; Material 3 / iOS would just be more skins. Rejected:
anchoring on Material 3 — too vendor-specific for a layered, skinnable system.

**Skin mechanism:** a skin is applied via `data-ori-skin="<name>"` on `<html>` and overrides
the `--ori-color-<role>-<light|dark>` source tokens; the existing light/dark machinery then
resolves on top. This is **page-level** (the active alias resolves at `:root`, so a skin on a
descendant wouldn't propagate). Per-subtree skins (e.g. a theme gallery showing several at
once) would need a `light-dark()` restructure — deferred, noted as a future option.

**Signature "ori" skin (織り):** graphite ink + paper — primary `#2b2d42` (paper text),
secondary wood `#ddb892`, surface milky `#f4f1de`, background ivory `#fffdf6`; status colors
stay default. Coral `#e63946` is reserved as a future sparing accent. The user first picked a
bold coral primary, then reverted: coral sits at nearly the same hue as the red danger status
(confusing) and only met AA-large. Graphite primary is fully WCAG AA and clearly distinct from
the danger status.

## Styling: standalone CSS, no Tailwind in core

Standalone CSS custom properties → zero consumer build setup, works with any framework or
plain HTML, and is the differentiator ("Tailwind-free DaisyUI"). Rejected: Tailwind in core
(build coupling for a distributed library; cedes the niche to shadcn/DaisyUI). An optional
Tailwind v4 preset may come later as a style adapter.

## Props: reactive props destructure (Vue 3.5), not `withDefaults`

Defaults co-locate with the declaration, no duplicated `@default` JSDoc to drift; pass a
getter when a prop feeds a composable (lint guard: `vue/no-setup-props-reactivity-loss`).

## State via attributes (aria/data), not classes — planned (Phase 5)

Dynamic state (disabled / loading / active) becomes real `disabled` / `aria-*` / `data-*` —
the a11y-correct source of truth, matching the headless layer. The legacy `ori-disabled`
class (CSS-only, no real `disabled`) is a known bug to fix in the rebuild.

## Type declarations via vue-tsc, not vite-plugin-dts

vite-plugin-dts 5 (now on unplugin-dts) stopped emitting `.vue` SFC declarations → broken
consumer types. Generate `.d.ts` with native `vue-tsc` (`tsconfig.build.json`); the build
fails on type errors instead of emitting them as warnings.

## Headless: own composables behind a swappable adapter — planned (Phase 4)

Components depend on a behavior contract; the default implementation is our own composables,
with an optional Reka UI adapter, selected via `app.use(OriUI, { adapter })`. Lets the
behavior layer be swapped without touching component markup.

## Platform: web-first + mobile-first styling; hybrid planned; Ionic not a target

Touch minimum 44px in the action scale; safe-area insets + `@media (hover:hover)`. Capacitor
is supported via a planned `hybrid` platform mode (token + behavior tweaks). Ionic is a
competing adaptive component library, not a backend — deliberately out of scope.
