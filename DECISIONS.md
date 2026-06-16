# Decisions

Architecture decision log for oriUI — the "why" behind key choices, so they aren't
relitigated after a context compaction or by a new contributor. Companion to
[ROADMAP.md](ROADMAP.md) (what / when) and [CLAUDE.md](CLAUDE.md) (how). Newest first.

## OriDialog promoted into the `oriui` package: styled = headless + css (depends on @oriui/vue)

The first behavioral styled component now lives in the library (moved out of the docs prototype).
`oriui` gains a runtime **dependency on `@oriui/vue`** — `OriDialog` consumes `useDialog()`, so the
layering is literally "styled = headless + css". Mechanics:

- `@oriui/vue` (+ `@oriui/core`) are **external** in the Vite lib build (not bundled); the import is
  preserved and resolved from the consumer's deps. The root `build` script runs `build:packages`
  first so `vue-tsc` can resolve the package `.d.ts` (fresh-clone / CI safe). Verified: the built
  `ori-dialog.js` keeps `import … from '@oriui/vue'` and the types flow through the barrel.
- The library can't use Nuxt's `<ClientOnly>`, so the Teleport is gated on a `mounted` ref —
  SSR-stable in any Vue/Nuxt host. Styles are tokenized (`--ori-color-surface`, `--ori-shadow-lg`).
- `useDialog` still has **no native default** — the consumer wires a dialog adapter via `OriHeadless`
  (e.g. Zag), per the native-simple / Zag-complex split. The docs `DialogDemo` now imports
  `OriDialog` from `oriui` and the prototype is deleted; build + live behavior both verified.
- `@oriui/vue` is a regular `dependency` (not peer) for DX — the contract core is tiny and the
  behavioral components need it. The 5 presentational components don't import it, so a Button-only
  consumer tree-shakes it out.

## Docs IA: component page is the single source (class table + Vue/HTML tabs); CSS guide = concepts

User likes DaisyUI's model — one component page carrying both the live examples and the CSS-class
usage, so examples aren't duplicated across sections. Adapted to oriUI's two layers:

- The **component page is the single source** for that component's examples. The Example framework
  tabs already make one example serve both audiences — **Vue** (the styled component) and **HTML**
  (the standalone `.ori-*` classes; relabeled from "Svelte" — the static markup is identical and
  "HTML" covers htmx / Astro / Svelte / plain-HTML at once). The HTML tab shows the _complete_ class
  set (the old Svelte snippets were missing the size/radius/font pairs).
- Each component page gets a DaisyUI-style **class-reference table** at the top (block / variant /
  color / size / radius / state) — the canonical `.ori-*` reference, in one place.
- `/guide/css` is **concepts only**: setup, how the compound classes compose, zero-runtime theming,
  and the applicability matrix — no per-component examples (they would duplicate the component pages).

Net: examples live once (component pages), the class reference lives once (per-component table),
concepts live once (the CSS guide). Done for Button as the exemplar; the same table + HTML tab roll
out to the other component pages.

## Default skin = "Ori" (luminous azure/cyan); indigo & graphite become named skins

User feedback: the default's colours should evoke the word "ori" — which reads as the Ori game's
ethereal blue/cyan/white spirit-light ("blue and white, maybe neon"). So the **default (no-attribute
base) skin is now "Ori"**: a luminous azure `#0369a1` (light) / glowing cyan `#38bdf8` (dark) on
ink-navy + cool white, with a deep ori-night `#06131f` page in dark. Strict WCAG AA (≥5.9:1). A faint
spirit-light halo on the docs brand mark sells the "neon" without touching text contrast.

Nothing was lost: the previous indigo default became the **"Indigo"** skin, and the graphite/paper
織り skin was renamed **"Sumi" (墨, ink)** to free the "Ori" name for the signature default. The base
skin id is `ori` (= no `data-ori-skin` attribute); 7 skins total — Ori, Sumi, Indigo, Tech, Health,
Luxury, Cyber. The depth/elevation work from the entry below still stands; only the default accent
hue changed.

## Default skin refresh: depth (elevated surfaces) + indigo accent + 織り weave identity

User feedback: the original neutral default read flat and "uninteresting" — `surface` (`neutral-50`)
sat ~2% off a white `background`, so cards/examples/nav melted into the page, and the slate-blue
accent (`#3b56c8`), used sparingly, left the whole site grayscale. Revised the **default skin** (not
the signature `ori` skin) for depth and character while staying vendor-neutral + strict WCAG AA:

- **Surface now lifts off the page.** Light: soft-grey page `#f5f6f8` + **white** panels; dark: inky
  `#0a0e16` page + an elevated slate `#161b26` panel. Added **`--ori-shadow-{sm,md,lg,ring}`**
  elevation tokens (`themes/_themes-elevation.css`, theme-aware) so panels cast a real, cool-tinted
  shadow instead of relying on a hairline border.
- **Confident indigo primary** `#4f46e5` (light) / `#818cf8` (dark) — modern, AA both ways
  (~6.2:1 / ~6.45:1). Status hues stay reserved; indigo is not a status color.
- **Docs identity (織り "weaving"):** a CSS-only diagonal-crosshatch + indigo-bloom hero backdrop, an
  ink→indigo gradient title, a woven brand-mark tile, a pill kicker, indigo active states, and a
  canvas-style (dotted) Example preview with elevation. Pure tokens/CSS — zero runtime.

Rejected promoting the warm `ori` skin to default: it's the _signature_ skin, deliberately distinct
from the neutral "safe" default, which stays cool-neutral (Linear / Radix / Vercel register).

## No-framework / htmx is a first-class target for `oriui/css`

The `oriui/css` layer (pure `.ori-*` classes + zero-runtime token theming) works with **no JS
framework** — server-rendered **htmx**, Astro, and plain HTML are first-class. The server emits
`<button class="ori-button ori-variant_fill …" hx-get="/x">`, htmx swaps fragments: no build step,
no hydration. Theme/skin are a `.dark` class / `data-ori-skin` attribute on `<html>` that the
server (or a tiny inline script) sets — zero JS theming runtime; CSS transitions compose with
`hx-swap`. (The DaisyUI-with-htmx niche, minus Tailwind.) The styled **Vue** layer is N/A in htmx;
the **headless** layer is Vue-oriented today.

Complex behavior htmx doesn't provide (focus-trap, roving-tabindex) → a **future** `oriui/headless`
vanilla adapter via Zag's `@zag-js/vanilla` behind the existing contract (deferred). Recorded as an
explicit target: "works even without a JS framework" is a strong portfolio signal and shapes the
docs applicability matrix (and an optional HTML/htmx tab in the Example switcher).

## Docs: per-component pages, framework-switchable examples, Vercel SSG

Four docs requirements (user):

- **Hosted on Vercel as a static site.** Deploy via `nuxi generate` (SSG — fast, cheap, ideal for
  docs): install at the repo **root** (npm workspaces), build `npm run docs:build`, output
  `docs/.output/public`. (SSR on Vercel is possible via Nitro's vercel preset, but SSG is simpler
  and enough here.)
- **Every component gets a full page** — intro + explanation + props/slots + a11y notes + live demos.
- **The playground lives ON each component page, not a separate route.** Retire `/playground`; its
  grid distributes into the per-component pages. A shared `Demo`/`Example` wrapper = live preview +
  source, reused everywhere (theme/skin are already global).
- **Framework-switchable examples (Vue ↔ Svelte).** The css layer is framework-agnostic, so each
  example shows code for both. A global toggle (like the skin switch, persisted) selects which code
  is shown. The **live** demo stays Vue (the docs host); Svelte gets a **code** example using the
  standalone `.ori-*` classes (and later `@oriui/svelte`). Mirrors how agnostic libs (Zag) do a
  framework switcher; truly-live Svelte islands are out of scope for now. Build the `Example`
  component with this switch from the start so component pages don't need reworking.

## Native default for simple behavior, Zag for complex; a deep own-engine is a separate project

Portfolio reasoning (user asked what's best for a portfolio): do **not** build a full own headless
inside oriUI — it muddies oriUI's story (design system / CSS / a11y / library engineering + the
mature "integrate, don't reinvent" judgment) and invites an unflattering same-repo comparison to
Zag. Concretely:

- **Simple primitives** (disclosure, toggle) keep a tiny **native zero-dependency default** — they
  work out of the box ("daisyUI-simple"); that is a feature, not reinvention.
- **Complex behavior** (dialog, menu, combobox, listbox, datepicker — focus traps, typeahead, RTL,
  full keyboard) uses the **Zag adapter** (opt-in). Reinventing those is the foolish part; a focus
  trap looks identical in a portfolio whether it's ours or Zag's.
- **A deep from-scratch headless engine belongs in its own focused project** if you want to show
  that skill — and the swappable contract here lets you plug it into oriUI later as another adapter
  (the two portfolio pieces then link). Don't block oriUI on it.

One contract, three sources (native / Zag / your own). `useDisclosure` has a native default;
`useDialog` has **no** native default and requires an adapter (fails loud with guidance) — it is by
definition the hard case we delegate. oriUI's energy goes to its niche.

## Headless = use Zag, don't reinvent it; keep a swappable contract (supersedes the next entry)

After building the native Disclosure (below) to understand the model, the call: **don't compete
with Zag on behavior.** Its edge cases (focus trap/return, typeahead, RTL, WAI-ARIA keyboard,
pointer vs touch) are years of tested work a fresh reimplementation would only do worse — and a
correct focus trap looks identical in a portfolio whether it's ours or Zag's. ori's _original_
contribution is the end Zag has nothing of: the **design-system / token contract + skins, the
standalone CSS layer, and a11y-checked on-color tokens.** So:

- **Behavior = Zag** (recommended default adapter). Components depend on a thin **contract**
  (`DisclosureAdapter` returning normalized prop-getters), not on a concrete engine.
- **Swappable** via provide/inject (`OriHeadless` plugin / `provideHeadless`): an app runs our
  components on Zag, on our **native** `@oriui/core` adapter, or on a user-supplied one — same
  markup. If runtime swap ever proves messy, the fallback is the simpler "enable Zag or use no
  headless" toggle (user-approved).
- **The native `@oriui/core` Disclosure is kept** as the reference/default adapter and the "one
  primitive built to understand the internals" — not expanded into a full catalog. We will not
  hand-roll Toggle/Tabs/etc.; those come from Zag behind the contract.
- Zag adapter is prototyped in the docs app first (consumer side); promote to an `@oriui/zag`
  package when worth publishing (keeps Zag out of native-only consumers' trees).

The mature build-vs-reuse call: understand Zag enough to mirror it, then spend energy where ori
is unique. Reka UI stays a possible _Vue-only_ alternative adapter; Zag generalizes to Svelte/React.

## Headless = framework-agnostic core + thin per-framework adapters (Zag-mirrored)

**Superseded by the entry above** — kept for the rationale, and because the native adapter remains
the reference implementation behind the contract.

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

Default skin is vendor-neutral (cool slate ramp + a confident **indigo** accent over **elevated
surfaces** — see the refresh entry above; status hues red/green/amber are reserved for status, not
brand) and stays strict WCAG AA. Optional skins
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
