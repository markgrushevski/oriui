# Implementation notes

A running log of **non-obvious implementation nuances and gotchas** — things that cost real time to
work out but don't rise to an architectural decision. Read this first; **append** anything you
discover so the next person (or agent) doesn't re-analyze it.

Companion to [CLAUDE.md](CLAUDE.md) (conventions), [DECISIONS.md](DECISIONS.md) (rationale / ADRs),
and [REVIEW.md](REVIEW.md) (the per-change bar). Architectural decisions go in DECISIONS.md; small
practical gotchas go here.

## Class-API: single-class token utilities + block-baked defaults

- **Override wins by LAYER ORDER, not specificity.** A value utility (`.ori-color_danger`) sets one token
  in `@layer ori.utilities` (declared last), so it beats a block's baked default in `ori.components` even
  at equal specificity. A component **size sugar** (`.ori-input.ori-input_lg`) is compound (0,2,0) so it
  also beats the block default (0,1,0) on specificity. Either way the paired base class is gone — the old
  compound `.ori-x.ori-x_y` selector, and the silent no-op of forgetting the base, is retired per axis.
- **Bake a block default only for axes the component actually reads.** Add `--ori-<alias>: …` to the
  `.ori-<name>` rule (custom props first) for each axis whose token the css reads, using the prop default.
  Skip an axis it doesn't read: e.g. **tooltip** is color-only with a _defaultless_ color prop (the bubble
  falls back via `var(--ori-color, …)`), so its css is left untouched — template + test only.
- **Variant cluster: bake only if the css reads `var(--ori-variant-*)`.** Button / Card / Badge / Alert /
  Tag read the cluster → bake the default variant's 4 lines into the block. Input / Select / Textarea do
  variants with component-scoped tokens (`--ori-<name>-border` / `-bg`), so they bake **no** cluster.
- **Wrapper + field components** (input / select / textarea): the size sugar (`ori-input_lg`) sits on the
  **wrapper**, the field inherits `--ori-size-action`. Do NOT also set the size default on the field
  element — an own value beats the inherited override and the sugar would no-op.
- **`action-space` is single-class** (`.ori-size-action-space_*`); a component must **read**
  `--ori-size-action-space` as margin for `spaced` to do anything. **Icon reads it; Avatar does not** —
  Avatar's `spaced` is a pre-existing no-op (flagged separately), faithfully preserved by the migration.
- **Backward compatible:** a component or doc still emitting `ori-color ori-color_primary` (base+value)
  keeps working — the single-class value matches, the base is an inert extra. So the axis-utility files
  could be converted ahead of the per-component template migration without a flag day.
- **gap is now single-class too.** `_sizes-gap.css` was the last axis on the old paired pattern
  (`.ori-size-gap` base + `.ori-size-gap.ori-size-gap_*` compound, and it lacked `_xxl`); it is now
  `.ori-size-gap_*` single-class (zero · xs · sm · md · lg · xl), mirroring `.ori-size-radius_*`. The
  scale tokens stay in `:root` (`ori.tokens`). `OriStack`'s `gap` prop emits one `ori-size-gap_<size>`.

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
- MDC inline component **booleans and numbers**: write `:prop="true"` / `:rows="2"` / `:value="50"`
  (v-bind), never bare `prop` or `prop="50"` — the string form triggers Vue prop-type warnings (a
  numeric prop would receive the string `"50"`).
- MDC inline **arrays/objects**: `:options='[{"label":"A","value":"a"}]'` (single-quoted JSON)
  parses correctly.
- New oriUI components must be re-exported from the **root barrel** `src/components/index.ts` (the
  public `@oriui/ui` surface — tests import from `../src`, and the docs plugin imports from `@oriui/ui`),
  registered in `docs/app/plugins/oriui.ts` (for MDC) **and** added to the sidebar in
  `docs/app/layouts/default.vue`. Forgetting the barrel makes `import { OriX } from '../src'` resolve
  to `undefined` (test-utils then throws "Invalid value used as weak map key"). When fanning components
  out to parallel agents, the **orchestrator** owns these three shared files (agents touch only their
  own component dir) to avoid parallel-edit conflicts.
- Component doc pages follow the **Button page template** (Examples → Props → Events → Slots → CSS
  classes → Accessibility; interactive components add Anatomy + Headless + keyboard table).
- **Bound MDC attributes (`:rows`, `:options`) must not contain quotes or apostrophes inside string
  values** — no `&quot;`, no `\"`, no raw `"`, no `'`. MDC fails to parse such a value and passes the
  raw string instead; a component that assumes an array then 500s the whole page. Keep description
  text quote-free (`type=checkbox`, not `type="checkbox"`). `ClassTable` now also degrades to an
  empty table instead of crashing on a bad value — but fix the content so the table actually renders.
- **Prettier mangles BEM `__` (and `_*` globs) inside a `:class-table` `:rows='…'` JSON string** on
  some pages — it parses the MDC attribute value as markdown and converts a `__x__` run to `**x**`
  (and `_*` to `*\*`), so `ClassTable` (which renders `class` via `{{ }}`, raw text) then literally
  shows `ori-accordion**item`. It's a flaky emphasis-flanking edge case: identical-looking tables
  (e.g. `dialog.md`) survive, others (`accordion.md`) don't, and tweaking tokens won't reliably fix
  it. The robust fix is a **`<!-- prettier-ignore -->` line immediately before the `:class-table`**
  — prettier then leaves the line alone and the `__` names stay intact (verified idempotent +
  lint-clean). Use it whenever a class-table's rendered `<code>` cells show `**`.
- **Layout / new-component / moved-content changes need a dev-server restart.** Editing the layout
  (`default.vue`) or adding a component under `app/components/` is often not hot-reloaded. And moving or
  renaming content files leaves the **old** routes resolving from Nuxt Content's dev cache (they still
  return 200 until the cache rebuilds) — a production `nuxi generate` scans the real files, so the
  stale routes are gone there. Verify routes by HTTP status (`curl -o /dev/null -w "%{http_code}"`),
  not a content grep for "404".
- **Every content page must be in the nav** (`sections` in `default.vue`). A page that exists in
  `content/` but isn't linked is orphaned: the prerender crawler discovers routes by following links,
  so an un-linked page is **never emitted** by `nuxi generate` (it 404s in the static build) and a
  reader browsing the sidebar never finds it. Wire new pages into the right section when you add them.
- **A burst of file edits can corrupt the Nitro dev bundle** → `[nitro] ERROR ENOENT … .nuxt/dev/index.mjs`
  and then **every** route 500s (even untouched ones). It's a stale-build glitch, **not** a content bug —
  don't go hunting the page. Fix = restart the dev server (`preview_stop` + `preview_start`), which
  rebuilds `.nuxt/dev`. Watch for it after writing several content/layout files in quick succession.
- The docs dev server is **`npm run dev`** at the repo root (= `npm run dev --workspace docs`, a **Nuxt**
  app on port 5173) — same as `docs:dev`. (CLAUDE.md still calls root `dev` a "Vite playground" and the
  docs "VitePress" — both stale; the docs are Nuxt + Nuxt Content.) The preview `dev` launch config maps
  to it, so `preview_start dev` restarts the docs server.
- **Live demos for slotted components** (Stack / Cluster / Join / Divider-with-label) use the MDC
  **block** form inside `::example` — `::ori-join{aria-label="…"}` with inline `:ori-button{…}` lines,
  closed with `::` (mirror `stack.md`); this renders the children live. Do **not** wrap inline MDC
  components in **raw `<div>` HTML** — the inline `:ori-*` inside a raw HTML block are not parsed and
  render nothing (a vertical-divider demo wrapped that way produced zero dividers). A vertical
  `:ori-divider{:vertical="true"}` needs a flex-row parent (`::ori-stack{:cluster="true"}`) with height:
  it stretches via `align-self: stretch`, falling back to its 1em `min-height` when the row wraps.

## Lint / formatting

- `.lintstagedrc.json` runs **stylelint → eslint → prettier (last)** so Prettier is authoritative.
  Don't hand-fight CSS property order — `stylelint --fix` applies the SMACSS order, then Prettier
  formats whitespace. Locally, run `stylelint --fix` then `prettier --write` (prettier last).
- `currentcolor` must be **lowercase** (stylelint `value-keyword-case`).
- stylelint `selector-not-notation` enforces the **complex** form: chained `:not(:disabled):not([aria-selected])`
  fails — combine into one `:not(:disabled, [aria-selected])`.
- stylelint's SMACSS property order splits **SVG presentation props** (`stroke` / `fill` / `stroke-width`
  / `stroke-linecap` / `stroke-linejoin`) across its border/background groups, so after `--fix` they may
  read out of visual order (e.g. `stroke-linejoin` after `color`). Valid + lint-clean — don't hand-reorder.
- happy-dom reflects a boolean attribute like `required` as the **empty string `''`**, not `'true'` —
  assert presence with `toBeDefined()` / `.toBe('')`, not `.toBe('true')`.
- CI gate is `npm run lint:ci` (check-mode prettier/stylelint/eslint — no `--fix`).
- `.prettierignore` excludes build output (`.output`, `.nuxt`, `coverage`, `dist`).

## Component / CSS patterns

- **Component block styles live in `@oriui/css` under `@layer ori.components`** — one file per component
  in `packages/css/src/components/<name>.css`, NOT in the SFC (the SFCs have **no `<style>` block**). So
  a styled-component consumer must `import '@oriui/css'` once (it ships tokens + components + utilities),
  and there are no per-component CSS chunks in `@oriui/ui`'s `dist`. The `ori.utilities` layer is declared
  **last**, so utilities (`.ori-color_*`, `.ori-shadow`, …) win over a component's own rules — they set
  tokens the components read, so they don't actually clash. Modifiers use the house `.ori-x.ori-x_y`
  compound pattern (not `:where()`). **Adding a component:** create `packages/css/src/components/<name>.css`
  wrapped in `@layer ori.components { … }` and add its `@import` to `packages/css/src/styles.css`.
- **`OriJoin`'s corner-collapse wins by SPECIFICITY, not layer order — load-bearing.** Unlike the rest
  of the single-class system (utilities win by layer order), `.ori-join` zeroes inner-child corners via
  higher-specificity longhand selectors — `.ori-join:not(.ori-join_vertical) > :not(:first-child)` is
  (0,3,0) in the **same** `ori.components` layer as the children, beating `.ori-button`'s `border-radius`
  (0,1,0) and surviving a child's `.ori-size-radius_*` utility (which only changes the token value, not
  specificity). If you `:where()`-flatten the Join selectors for house-style consistency, the collapse
  silently stops (drops to (0,1,0), ties the child, loses to a `.ori-size-radius_*` child). Keep them
  un-`:where()`-ed. Divider is the mirror case — its subtle default DOES rely on layer order (it sets
  `--ori-color` in `ori.components`; `.ori-color_*` in `ori.utilities` overrides it).
- **Layered components lose to an UNLAYERED element reset.** Because component styles are now in
  `@layer ori.components`, any **unlayered** global rule (an `a {}` / `button {}` / `input {}` reset)
  beats them regardless of specificity — unlayered author styles outrank every layer. This bit the docs
  three times via the global `a {}` reset hitting an `OriButton` rendered as a link (`as=NuxtLink`):
  (1) `color: var(--ori-color-primary)` turned the fill button's white label brand-blue; (2) once the
  reset was scoped to `a:not(.ori-button)`, the button lost the reset's `text-decoration: none` and
  showed the **UA link underline**; (3) the `:not(.ori-button)` scope itself **raised the selector's
  specificity** from a bare `a` (0,0,1) to (0,1,1) — which then beat the docs' own single-class chrome
  links (`.docs-toc__link` / `.docs-sidebar__link` / `.docs-social__link`, each 0,1,0), turning every
  ToC/sidebar/social link brand-blue. Fixes: (a) scope the reset away from components but keep its
  specificity flat — `a:not(:where(.ori-button))` (the `:where()` makes the `:not()` arg contribute
  ZERO, so the whole selector stays a bare `a` (0,0,1), exactly as before scoping); AND (b) `.ori-button`
  now defensively sets `text-decoration: none` (a button is never underlined, even as a link, and a
  layered author rule still beats the UA default). **Takeaway:** when scoping a low-specificity reset
  away from a class, wrap the exclusion in `:where()` so you don't silently outrank other rules that
  relied on the original specificity. A real consumer with a broad unlayered `a`/`button` reset hits
  the same class of issue — they should layer or scope their reset; worth a heads-up in the CSS guide.
- **Don't set `--ori-color` (or another utility-owned alias) in a component's CSS.** The `ori-color_*`
  utility (`@layer ori.utilities`) repoints it and now **wins** over the component layer, so a value the
  component rule sets is overridden anyway (and historically it silently no-op'd OriProgress). The token
  layer defaults `--ori-color: currentColor` at `:root`; read it (`var(--ori-color, currentcolor)`) and
  let the utility set it.
- **Focus-ring color depends on what surface the ring sits on.** Free-standing controls (Button,
  Checkbox, Switch, Radio, the form fields) ring with **`var(--ori-color)`** — it tracks the `color`
  prop and sits on the page, which contrasts. (Don't hardcode `--ori-color-primary`: it ignores the
  prop — was a real OriButton bug.) A close button **on a tinted chip/banner** (Tag/Alert) is the hard
  case: a same-hue `currentcolor` ring can fall below the 3:1 non-text minimum on the pale tonal/outline
  surface (warn ≈ 1.7:1), so ring with the neutral **`--ori-color-on-surface`** (contrasts light + dark),
  and override to `currentcolor` only on the **`fill`** variant (there the on-color contrasts the solid
  fill, and `var(--ori-color)` would BE the fill background → invisible ring). Place the `fill` override
  last so stylelint `no-descending-specificity` stays happy.
- **Focus-ring offset polarity is a convention:** **outset** (`outline-offset: +2px`, or a 3px
  box-shadow ring) for free-standing controls; **inset** (`outline-offset: -2px`) for controls flush to a
  container edge where an outset ring would clip — Tabs tab, Accordion summary (but the Tabs _panel_ is
  free-standing → outset). Keep this split; don't "normalize" the inset rings.
- Form controls: a **real hidden native input** (`opacity:0` over the visual element) drives a11y;
  style the visual via `:checked ~`, `:focus-visible ~`. The accent + ring read `var(--ori-color)`
  set by the `ori-color` class on the wrapper (inherits down).
- `useId()` (Vue 3.5) for SSR-safe ids; pass props referenced in `<script>` through the reactive
  destructure (template-only props can stay undestructured). Gate any Teleport on a `mounted` ref —
  the library can't use Nuxt `<ClientOnly>`.
- **A pure-CSS tooltip can't make `aria-describedby` announce on its own.** `aria-describedby` is read
  when the element _bearing_ it is focused; OriTooltip puts it on the non-focusable `.ori-tooltip__trigger`
  wrapper (which only guarantees the id resolves) and exposes `bubbleId` on the **default slot scope** so
  the consumer binds `:aria-describedby="bubbleId"` on their _own_ focusable control. `:focus-within`
  drives the bubble's CSS visibility, not the ARIA announcement — they're independent. Augmenting
  arbitrary slot content would need JS (out of the CSS-only scope).
- **A native `<summary>`/`<select>`/`<details>` has no real `disabled` state** — `aria-disabled` +
  `tabindex="-1"` are advisory and don't stop Enter/Space/click from activating. OriAccordion blocks a
  disabled item for real by `event.preventDefault()` on the summary's `click` + `keydown.enter`/`.space`
  (pointer-events:none only covers the mouse). Don't present `aria-disabled` alone as "disabled".
- **Dialog runs on the native `<dialog>` element, not a JS engine.** `useDialog` defaults to
  `nativeDialog` (no adapter needed). The adapter owns only `open` + the ARIA prop bags; the **consuming
  component** owns the `<dialog>` ref and drives `showModal()`/`close()` from `open` in a
  `watchPostEffect` (`flush:'post'` also covers `defaultOpen` on mount). Keep both imperatives
  idempotent — `showModal()` throws if already open, `close()` is a no-op when closed (guard with
  `el.open`). `dialogProps.onClose` mirrors a browser-driven close (Esc, backdrop) back into reactive
  `open`; backdrop light-dismiss is `onClick` checking `currentTarget === target` (the `::backdrop`
  click lands on the `<dialog>` itself — no element ref needed). No `<Teleport>`/mounted-gate: a modal
  `<dialog>` is in the top layer and a closed one is hidden, so SSR markup is stable. happy-dom ≥20
  implements `showModal`/`close`/`open`/`close`-event, so this is fully unit-testable.
- Read tokens via resolved aliases (`--ori-size-action`, `--ori-color`), never raw scale tokens.
- **Overriding a token: _where_ it is declared decides where an override works.** Components read the
  resolved alias (`--ori-color`, bound from `--ori-color-primary` by the color class), and the color
  aliases are declared **and resolved at `:root`** (`--ori-color-primary: var(--ori-color-primary-light)`).
  So: a **global** brand override sets the `*-light`/`*-dark` **source** at `:root` (the alias re-resolves
  there and inherits everywhere). A **subtree / one-off** override must repoint the **resolved alias**
  (`--ori-color-primary`, or `--ori-color`/`--ori-color-on`) on the wrapper/element — setting the
  `*-light` source on a non-`:root` element does **nothing**, because the alias was already substituted up
  at `:root` and is merely inherited below. Radius/font-size raw scales (`--ori-size-radius_*`,
  `--ori-font-size_*`) live on the **utility base class** (`.ori-size-radius`, `.ori-font-size`), never at
  `:root`, so they aren't `:root`-overridable at all — repoint them on that base class, or per-instance.
  CSS `@layer` only breaks ties between declarations on the **same** element; it never makes an inherited
  value beat a value a class sets directly on the element.

## Build / tests

- Tests live in `tests/` (out of `src`); `vitest.config.ts` aliases `@oriui/*` to package **source**,
  so the suite needs no `build:packages` first.
- The lib build keeps `@oriui/*` **external**; root `build` runs `build:packages` (tsdown) first so
  `vue-tsc` can resolve the package `.d.ts`.
- OriDialog tests run on the **native `<dialog>` default** (no adapter), plus one test that swaps in a
  **fake adapter** (`tests/helpers/fake-dialog.ts`, fixed id) to prove the `OriHeadless` contract still
  swaps — the lib's test graph stays engine-free (no Zag).
- **axe + container roles:** a `role="group"` / `role="toolbar"` / `role="region"` with no accessible
  name trips axe — mount such components (OriJoin) **with an `aria-label`** (it falls through via
  `inheritAttrs`) in the axe test. **Separators:** `aria-orientation` is **omitted** for the horizontal
  default (the ARIA implicit value) and set only for vertical — assert `toBeUndefined()`, never
  `toBe('horizontal')` (Vue renders an `undefined` binding as no attribute).

## Orchestration / role agents

- Custom agents in `.claude/agents/*.md` load into the Agent/Workflow registry **at session start** —
  ones created mid-session are NOT available until Claude Code reloads (the registry shows only the
  built-ins: general-purpose, Explore, Plan, …). For a workflow in the same session, **omit
  `agentType`** and put the role instructions in the `agent()` prompt, setting the tier via
  `opts.model` (e.g. `model: 'sonnet'`). The committed agent files work in later sessions.
- The orchestrator (main session) integrates: role agents write only their own files; the
  orchestrator runs the gates, verifies live, and records findings here / in DECISIONS.md.

## Git / Windows

- Conventional Commits; **no `Co-Authored-By` trailer**; group into reasonably-sized commits.
- Pre-commit (husky + lint-staged) runs `npm run build` + lint-staged on staged files.
- `LF will be replaced by CRLF` warnings on commit are normal on Windows — harmless.
