# Implementation notes

Non-obvious traps that cost real time to work out but are not decisions. Read this before working in an
area; when something costs you an hour, add it under the matching heading so nobody pays twice. Decisions
go to [DECISIONS.md](DECISIONS.md), conventions to [CLAUDE.md](CLAUDE.md).

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
  `.ori-size-gap_*` single-class (none · xs · sm · md · lg · xl), mirroring `.ori-size-radius_*`. The
  scale tokens stay in `:root` (`ori.tokens`). `OriStack`'s `gap` prop emits one `ori-size-gap_<size>`.

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
  public `@oriui/vue` surface — tests import from `../src`, and the docs plugin imports from `@oriui/vue`),
  registered in `docs/app/plugins/oriui.ts` (for MDC) **and** added to the sidebar in
  `docs/app/layouts/default.vue`. Forgetting the barrel makes `import { OriX } from '../src'` resolve
  to `undefined` (test-utils then throws "Invalid value used as weak map key").
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
  don't go hunting the page. Fix = restart the dev server, which
  rebuilds `.nuxt/dev`. Watch for it after writing several content/layout files in quick succession.
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
- The stylelint gate now covers the CSS layer. `lint:ci`, `lint:stylelint`, and `.lintstagedrc.json`
  all lint `packages/css/src/**/*.css` (the published `@oriui/css` product) alongside `src/**`, so a
  component block style that breaks SMACSS order (or any stylelint rule) fails CI like any `src/` file.
  (Was `src/**`-only until widened — `toast.css` shipped with 6 unflagged order errors before the fix.)
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

- **A non-standard mode (icon square) must be an EXPLICIT opt-in, never the absence of another prop.**
  `ori-button_icon` is `Boolean(icon) && !text` (icon set, no label), NOT `!text` — the old `!text`
  silently turned `<OriButton>Label</OriButton>` (slot-only) into a fixed-size icon square that clipped
  its label. Same for `ori-card_icon` (`Boolean(prependIcon || appendIcon) && !text`). When a modifier
  changes layout, gate it on the prop that _means_ the mode, not on the mere lack of the default one.
- **Component block styles live in `@oriui/css` under `@layer ori.components`** — one file per component
  in `packages/css/src/components/<name>.css`, NOT in the SFC (the SFCs have **no `<style>` block**). So
  a styled-component consumer must `import '@oriui/css'` once (it ships tokens + components + utilities),
  and there are no per-component CSS chunks in `@oriui/vue`'s `dist`. The `ori.utilities` layer is declared
  **last**, so utilities (`.ori-color_*`, `.ori-variant_*`, …) win over a component's own rules — they set
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
  case: a same-hue `currentcolor` ring can fall below the 3:1 non-text minimum on the pale soft/outline
  surface (warning ≈ 1.7:1), so ring with the neutral **`--ori-color-on-surface`** (contrasts light + dark),
  and override to `currentcolor` only on the **`solid`** variant (there the on-color contrasts the
  background, and `var(--ori-color)` would BE that background → invisible ring). Place the `solid` override
  last so stylelint `no-descending-specificity` stays happy.
- **Role-as-FOREGROUND text uses a dedicated on-surface tone (`--ori-color-<role>-text`), NOT the raw role.**
  A role's `--ori-color-<role>` is engineered as a fill BACKGROUND (light / saturated, paired with dark
  `--ori-color-on-<role>` ink); painted directly as TEXT on the surface a saturated / light role fails body-text
  4.5:1 (raw `warning #f59e0b` = 2.14:1 on white; the soft tint and the dark-surface status hues are worse). So the
  non-solid button variants (`_themes-variant.css` soft / outline / text), the selected Tab, Alert, Tag, Link and
  the selected Combobox option paint `var(--ori-color-text)`. FILL keeps `--ori-color-on` (unchanged). **Two
  delivery paths + a custom-property gotcha:** the tone reaches an element via the `.ori-color_*` utility (sets
  `--ori-color-text` on the element) OR via a block that bakes a role (button / tabs / tag / combobox bake the
  primary tone, alert the info tone). The `:root` `--ori-color-text` default is the neutral `--ori-color-on-surface`
  ink, NOT a role derive: a `var(--ori-color)` at `:root` freezes to `:root`'s currentColor (a custom property's
  `var()` substitutes where DECLARED, not where used), so it can't track a block-baked `--ori-color` — hence baked
  blocks repoint `--ori-color-text` themselves. The per-role token is a DARKER/LIGHTER SHADE of the role via
  relative colour that clamps ONLY lightness: `oklch(from var(--ori-color-<role>) min(l, 0.42) c h)` (light) /
  `max(l, 0.86)` (dark) — keeps the role's hue + chroma, so the text (and the outline BORDER, which reads the same
  token) is the same colour as the fill, only darker/lighter ("one hue, only lightness varies") — not the muddy
  off-hue a `color-mix` toward the neutral ink gave (the first cut, replaced). Declared IN EACH theme block
  (`:root` / light + `.ori-theme_dark`), NOT only `:root`, so it re-resolves for a SUBTREE theme and under a
  consumer's UNLAYERED `--ori-color` override too (a `:root`-only derive froze to the page value, breaking a real
  consumer's dark theme). Non-text axes: the focus ring + tab indicator still use raw `--ori-color`, where pale
  roles miss the 3:1 minimum (1.4.11) — a SEPARATE, pre-existing axis, unfixed; the outline border now reads the
  darker `--ori-color-text`, so it clears 3:1 for pale roles too. Guard: **e2e/text-contrast.spec.ts** (real
  Chromium — Node can't evaluate `oklch(from …)`, happy-dom axe has no layout): resolves computed `oklch()` /
  `color(srgb …)` via a 1×1 canvas, composites the soft tint over surface, asserts >= 4.5:1 for every role × skin
  × theme × text kind + the soft hover/active tint + the bare-block baked path. `quiet` is asserted like the rest (its
  0.85 fade is the lightest that measures AA). Min observed ~4.55:1.
- **Runtime theme toggle leaves BAKED component colours stale — a Chromium bug, fixed in JS, not CSS.**
  Flipping the `ori-theme_dark` class at runtime changes the inherited role tokens, but Chromium MISSES the
  style invalidation for elements that BAKE a resolved alias into an element-scoped custom property consumed
  through a `var()` chain — i.e. **every styled component** (`--ori-color` / `--ori-color-text` baked on the
  element → `--ori-variant-*` → the longhand). The element's cached computed style is never marked dirty, so it
  AND its paint keep the PREVIOUS theme's colour until the box is rebuilt. Confirmed real in Chromium **148 and
  149** (not a version artifact / not fixed upstream yet). Scope is broad: solid/soft BACKGROUNDS and the role
  text all stale; a bare direct read (`color: var(--ori-color-primary)`, no element-level bake) flips fine — the
  baking + shadowing is the trigger. NOT caused by the relative-colour `-text` tone (a literal reproduces it),
  NOT alpha-9-specific; emergent in the FULL cascade WITH a consumer's unlayered brand override (a bare
  default-skin page does not reproduce). **What does NOT fix it:** `@property` registration (source token, full
  chain, or every flipping alias — all tested), literal per-theme tones, a plain reflow, re-toggling the class, or
  a `display:none` flip applied a TICK LATER. **What does:** rebuilding the box in the SAME task as the class flip
  — a clone / detach+reattach, or a `display:none` round-trip WITH a forced reflow between the two writes. Shipped
  as `@oriui/headless` **`applyTheme` / `createThemeController` / `useTheme`** (core `theme.ts`
  `flushThemeInvalidation` = the `display:none` round-trip on `document.body`); consumers must apply the theme via
  these (or add the flush wherever they flip the class). It CANNOT be fixed in the CSS package. No e2e guard: the
  bug reproduces only on an HTTP-served page with the full cascade — `file://` / `page.setContent` /
  `addStyleTag` don't trigger it (verified manually + via Playwright pointed at a served repro); happy-dom has no
  such cache, so the unit suite (tests/theme.test.ts) guards only the DOM/state contract. Preview screenshot MCP
  is flaky here (30s hangs) — the same-tick `getComputedStyle` vs fresh-clone comparison is the reliable probe.
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
- **A native form control wrapped in a `<div>` needs `defineOptions({ inheritAttrs: false })` +
  `v-bind="$attrs"` on the inner control** — otherwise `aria-label` / `aria-describedby` / `name` / `id`
  land on the **wrapper**, not the control, so a label-less field has no accessible name (axe `label`
  violation, no escape hatch) and `name` doesn't submit. Input / Checkbox / Switch / Select / Textarea /
  Slider all do this — the native `role`/value live on the inner element, so the name must too.
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
- **A controlled boolean prop (`open`) MUST default to `undefined`, or Vue's absent-Boolean→`false`
  coercion breaks the uncontrolled path.** OriDialog is dual-mode: bind `v-model:open` (controlled) OR
  use `defaultOpen` + the `#trigger` slot (uncontrolled). The adapter seeds from `open ?? defaultOpen`
  (a controlled `:open` wins, else the default). The footgun: Vue coerces an **absent** `Boolean` prop
  to `false`, NOT `undefined` — so an uncontrolled dialog's `open` reads `false`, `false ?? true`
  collapses the seed to `false`, and `defaultOpen: true` silently stops opening on mount (4 tests went
  red exactly this way). Fix = an **explicit `open = undefined`** default in the reactive-props
  destructure; that opts the prop out of the coercion so unbound `open` stays `undefined` (the
  "uncontrolled" signal). The `= undefined` looks like a no-op — it is load-bearing, keep it (commented
  in the SFC). Controlled sync is a plain `watch(() => open, v => v !== undefined && dlg.setOpen(v))`;
  `onOpenChange` emits `update:open` (+ `close` on close). No loop: `setOpen` no-ops on an unchanged
  value, so emit → v-model → prop → watch settles. `defineModel` would also work but still needs the
  same coercion opt-out, so a plain prop + `watch` is the smaller footprint here.
- **The Toolbar is COMPOSITIONAL roving, not a data-driven machine.** Unlike `useMenu` (items array +
  core machine), a toolbar's items are arbitrary slotted components, so `useToolbar` is a **provide/inject
  roving context** (`packages/headless/src/vue/use-toolbar.ts`): the root owns orientation/loop/dir + one
  keydown handler; each item calls `useToolbarItem()` to register and get its roving `tabindex`.
  Navigation resolves the target by `container.querySelectorAll('[data-ori-toolbar-item]')` in **DOM
  order** (the OriTabs approach — robust to slot reorder; a v-for ref array is not order-stable). The pure
  index/key math is in `core/roving.ts` (`rovingIntent` / `resolveRovingIndex`), shared with the Svelte
  twin. Real DOM focus (not `aria-activedescendant`), per the APG example.
- **Toolbar disabled = `aria-disabled` + STILL FOCUSABLE — a deliberate divergence from OriTabs** (which
  uses native `disabled` + skips). The WAI-ARIA toolbar keeps disabled controls discoverable: roving
  visits them, but activation is blocked via a **capture-phase click guard** (`@click.capture` →
  `stopImmediatePropagation`), because CSS `pointer-events:none` only covers the mouse — a focused button
  still fires `click` on Enter/Space. It also makes roving simpler: any item can be the single tab stop,
  so there's no "first-enabled" seeding.
- **Toolbar yields arrows to a composite child.** A focused control that owns arrow keys (input / textarea
  / select / `[role=slider|spinbutton|radiogroup|menu|listbox|combobox|textbox]` / contenteditable) is NOT
  hijacked by the toolbar keydown — per the APG "include at most one arrow-consuming control, place it
  last; it keeps its own keys" (how a justpaint-style width slider can live in the bar). OriToolbarButton
  composes OriButton with `inheritAttrs:false` + explicit `v-bind="$attrs"` on the button, so when a
  `tooltip` wraps it in `<OriTooltip>` a caller's `@click`/attrs land on the button, not the tooltip span;
  the `tooltip` prop wires `aria-describedby`→bubble id on the real button. Separator `aria-orientation` is
  perpendicular (vertical in a horizontal toolbar; implicit-horizontal omitted). ToggleGroup `v-model`
  round-trips through the parent, so two SYNCHRONOUS toggles in one tick read the stale value — fine per
  interaction; tests await a tick between clicks.
- **Toolbar a11y refinements (from the flagship review).** (1) A baked `tooltip` wires `aria-describedby`
  onto the button ONLY when a `label` also names it — when the accessible NAME itself falls back to the
  tooltip text (icon-only, no label), describing with the same text double-announces (name == description),
  so describedby is omitted. (2) The toolbar keeps disabled items **keyboard-focusable** (aria-disabled),
  which exposed that OriButton's `opacity: 0.45` on `[aria-disabled]` also dimmed the focus RING below 3:1
  — gated to `:not(:focus-visible)` so the reachable disabled item's ring stays full-strength (native
  `:disabled` is never focused, so it always dims, unchanged). (3) `ownsArrowKeys` (now shared in
  `core/roving-dom.ts`, not duplicated per adapter) must check ANCESTORS via `closest`, else a native
  `<input type=radio>` (role on a `[role=radiogroup]` ancestor) gets its arrows hijacked; it also treats a
  focused native radio as arrow-owning (only checkbox/button inputs are excluded). (4) `useToolbar`
  resolves the root from `event.currentTarget` (the keydown is bound only on the root) — no `toolbarRef`
  to return/wire, matching the Svelte twin and removing a "forgot the ref → dead nav" footgun.
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
- **Cross-component class reuse is a CSS dependency.** OriCombobox renders `.ori-input__field`
  WITHOUT importing OriInput — so its stylesheet must `@import './input.css'`. When adding a
  component css dep, remember the dep map guard (`tests/css.entries.test.ts`) derives deps from
  sibling-component imports **and emitted class literals**, not imports alone.
- **Per-component dist css is self-contained**: each `src/components/*.css` `@import`s its deps and
  the build inlines them (`dist/components/button.css` = button + icon + spinner). The full bundle
  stays deduped — postcss-import's `skipDuplicates` drops repeated imports while bundling
  `styles.css` — so adding a dep costs the subset consumer bytes, not the bundle.
- **Components are reset-independent — keep them that way.** Every component block opens with a
  zero-specificity `:where(.ori-x, .ori-x *)` (+ `::before`/`::after`) border-box subtree rule and
  declares its own UA neutralization; `tokens.css` + components must render identically to `base.css`.
  The contract is an e2e computed-style diff in real Chromium (`e2e/reset-independence.spec.ts`) — a
  new component needs fixture markup there (`data-c="<name>"`; a coverage test fails otherwise).
- **The UA gives `[popover]` `margin: auto`** — an anchored panel that skips `margin` looks fine with
  the global reset and drifts without it. Declare margins explicitly on popover-based panels.

## Packaging / editor support

- **Ship `src`, not just `dist`.** vue-tsc (`declarationMap: true`) and tsdown emit `.d.ts.map` /
  `.js.map` that reference `../src/…`. If `files` ships only `dist`, every map dead-ends at a source
  that isn't in the package: go-to-definition and JS debugging break, and **WebStorm degrades a
  component's resolved model** while chasing the missing file (looks like "no prop hints"). `files:
["dist", "src"]` on all three packages fixes it — go-to-definition lands on the real commented SFC /
  composable. `exports` still routes imports to `dist`; the `src` files are inert. Types themselves were
  never missing — a wrong-prop probe (`color="not-a-role"`) errors under vue-tsc, proving resolution;
  "no hints" is an editor-index/plugin issue, and this map fix removes the packaging half.

- **`@oriui/vue`'s `.d.ts` are post-processed for node16/nodenext** (`packages/vue/scripts/fix-dts.mjs`,
  runs after `vue-tsc` in the package `build`). vue-tsc emits **extensionless** relative specifiers
  (`from './types'`, directory `from './components'`, `.vue` re-exports `from './ori-button.vue'`) that
  `moduleResolution: node16`/`nodenext` rejects (TS2834; `bundler` is fine). The script rewrites each
  relative specifier to an explicit path — a sibling file → `<spec>.js` (incl. `foo.vue` → `foo.vue.js`,
  correct: TS maps the `.js` back to the sibling `.d.ts`), a directory → `<spec>/index.js` — chosen by
  which `.d.ts` actually exists on disk. Why not api-extractor / rollup-dts (a single bundled `index.d.ts`)?
  They can't emit **`.vue` SFC** declarations — the reason the build uses `vue-tsc` at all — so a per-file
  rewrite is the pragmatic fit. Verify with `attw --pack packages/vue --profile node16`: **node16-from-ESM
  must be 🟢**. attw still exits non-zero on `CJSResolvesToESM`, which is EXPECTED for these ESM-only
  (`"type":"module"`) packages — a green attw gate needs `--ignore-rules cjs-resolves-to-esm`.
  `@oriui/headless` is unaffected (tsdown bundles its dts with `.js` specifiers); `@oriui/css` ships no dts.
  **The gate is now live** (`ci.yml`, after publint): `attw --pack {headless,vue} --profile node16
--ignore-rules cjs-resolves-to-esm`, both exit 0. **Why `--profile node16` (not the full check):** the
  packages don't target node10 (classic resolution) — it ignores `exports`, so _every_ entry, incl. the
  subpath `@oriui/headless/{vue,svelte}`, reports `node10: 💀 Resolution failed`. Supporting it would mean
  shipping `typesVersions` fallbacks; instead the profile is scoped to node16/nodenext + bundler, which is
  what an ESM-only Node≥22 library actually serves. **Pin the attw version** (`@0.18.5`): 0.18.2 crashes
  (`Cannot read properties of undefined (reading 'filename')`), and the `alpha` npm dist-tag drift lesson
  applies to `@latest` too.

## Build / tests

- Tests live in `tests/` (out of `src`); `vitest.config.ts` aliases `@oriui/*` to package **source**,
  so the suite needs no `build:packages` first.
- **Test color lists must use real `ThemeColor` roles** — the role is `warning` (it was `warn` until
  the pre-1.0 vocabulary rename) and there is **no `neutral`** role (it's only the internal `--ori-neutral-*` ramp). An invalid member fails
  `test:types` (not assignable to `ThemeColor`) and asserts a dead class the CSS doesn't back. Mirror
  the docs' color row: `primary · secondary · success · warning · danger · info` (+ `surface` / `background`).
- **Singleton stores (e.g. `useToast`) need an `afterEach` reset in tests.** The toast queue is a
  module-level reactive singleton, so state leaks across tests — `afterEach(() => useToast().clear())`,
  and don't assert exact ids (the `seq` counter keeps climbing). For auto-dismiss use `vi.useFakeTimers()`
    - `vi.advanceTimersByTime()`, and call `vi.useRealTimers()` at the END of each fake-timer test (not only
      in `afterEach`) so a failure can't strand the next test on fake timers. `<OriToaster>`'s Teleport works
      in happy-dom with `attachTo: document.body` + one `nextTick()`; clear `document.body.innerHTML` between
      tests so stale teleported nodes don't match.
- The lib build keeps `@oriui/*` **external**; root `build` runs `build:packages` (tsdown) first so
  `vue-tsc` can resolve the package `.d.ts`.
- **A raw `element.click()` on a Toolbar button is flaky in tests — use `.trigger('click')` (or preset
  `_vts`).** OriToolbarButton/ToggleItem attach TWO click listeners to the same `<button>` (the
  action/toggle handler + the capture-phase disabled-guard). Vue's invoker skips a listener whose
  `event._vts` (a `Date.now()` stamp) is `<=` the listener's `attached` time — so a raw `.click()` fired
  in the same millisecond as mount can silently no-op the toggle (value/aria-pressed just don't update).
  `@vue/test-utils`'s `trigger()` works around it by setting `event._vts = Date.now() + 1`; prefer
  `wrapper.find(...).trigger('click')`, or a `click(el)` helper that presets `_vts`, when clicking a
  toolbar button element directly. Keydown-nav tests never flake (they hit only the toolbar-root listener).
- OriDialog tests run on the **native `<dialog>` default** (no adapter), plus one test that swaps in a
  **fake adapter** (`tests/helpers/fake-dialog.ts`, fixed id) to prove the `OriHeadless` contract still
  swaps — the lib's test graph stays engine-free (no Zag).
- **axe + container roles:** a `role="group"` / `role="toolbar"` / `role="region"` with no accessible
  name trips axe — mount such components (OriJoin) **with an `aria-label`** (it falls through via
  `inheritAttrs`) in the axe test. **Separators:** `aria-orientation` is **omitted** for the horizontal
  default (the ARIA implicit value) and set only for vertical — assert `toBeUndefined()`, never
  `toBe('horizontal')` (Vue renders an `undefined` binding as no attribute).
- **OriPopover a11y is a consumer contract (zero-JS Popover API).** The panel defaults to `role="dialog"`;
  give it an accessible name via `aria-label` / `aria-labelledby` — undeclared attrs fall through
  (`inheritAttrs: false` + `v-bind="$attrs"` on the panel). The trigger's **expanded state is unmanaged**:
  the Popover API drives open/close in CSS with no JS state, so `aria-expanded` can't track it —
  `triggerProps` conveys the relationship statically via `aria-haspopup` (mirrors the panel `role`) +
  `aria-controls`. Same CSS-only shape as OriTooltip; live open/close + placement need Playwright, not happy-dom.
- **OriPopover CSS gotchas.** `min-width: anchor-size(width)` makes the panel inherit the **trigger's width**
  by default (right for menu/select panels; a content-sized popover opts out with a width utility), and
  `anchor-size()` resolves against the implicit `position-anchor`, so width and anchoring share
  `--ori-anchor`. `--ori-popover-gap` (block default `0.25rem`) is the single gap source, read bare by each
  placement class. `--ori-size-radius` is baked to `_md` so `.ori-size-radius_*` can repoint it.
- **Testing anchor-positioning / Popover-API components in happy-dom (OriPopover).** happy-dom doesn't
  serialize unsupported CSS props: an object `:style="{ anchorName }"` sets `el.style.anchorName` but
  `getPropertyValue('anchor-name')` / `cssText` come back empty — assert `el.style.anchorName` directly.
  `useId()` restarts at `v-0` per `mount()`, so two separate mounts get the **same** id — to assert
  per-instance uniqueness, mount both under one parent so they share the counter. The Popover API
  (`showPopover` / `:popover-open` / top-layer) isn't implemented either — open/close is Playwright's job.
- **Playwright e2e (`e2e/*.spec.ts`) verify what happy-dom can't** — real-Chromium geometry of the
  `.ori-anchored` floating components: placement, the `position-try` collision flip, and the Popover API.
  They load the **built** `packages/css/dist/styles.css` (so `npm run test:e2e` rebuilds `@oriui/css`
  first) + raw `.ori-*` markup (no Vue). `reducedMotion: 'reduce'` in the config kills the popover
  open/close opacity transition so `boundingBox()` reads are stable. Vitest ignores them — its `include`
  is `tests/**/*.test.ts` (unit `.test.ts`, e2e `.spec.ts`).
- **Interaction e2e mount real Vue components via a Vite harness** (`e2e/harness/`): one view per
  `location.hash` (`#combobox`/`#dialog`/`#menu`), aliasing `@oriui/*` to **source** (mirroring
  `vitest.config`) + `@oriui/css` to built `dist`. Playwright's `webServer` runs it (`npx vite --config
e2e/harness/vite.config.ts --port 5199 --strictPort`, `reuseExistingServer: !CI`); specs `goto('/#…')`.
  CI needs no extra step — `vite` + `@vitejs/plugin-vue` are root devDeps, source is transpiled on the fly.
  The harness `.ts`/`.vue` files don't match `*.spec.ts` so they aren't collected as tests.
- **Native modal `<dialog>` tab-cycle includes `document.body` as the wrap boundary** (Chromium): the
  forward cycle is `body → first → … → last → body`, NOT last→first like a JS focus-trap. OriDialog is
  native (`showModal()` in a `watchPostEffect`, no JS trap), so assert the native _containment_ invariant
  — walk a full forward+reverse cycle and assert focus visits the dialog's controls, wraps, and **never**
  reaches the trigger or any outside control — do not assert a direct last→first hop.
- **Combobox keeps DOM focus on the input (`aria-activedescendant`); Menu moves real focus (roving
  `tabindex`).** Combobox: active option is `[data-highlighted]` and `aria-activedescendant` points at its
  id; `aria-selected` is the _committed_ value, distinct from the keyboard-active one; it opens on
  typing / ArrowDown / trigger-click, **not** focus or input-click alone. Menu: the SFC calls `.focus()`
  on `[data-highlighted]`, so assert `toBeFocused()`. Don't cross-assert the two models.
- **`.ori-anchored` placement is the 12-value `<side>[-start|-end]` grid.** A **bare side centers** on the
  cross axis (`_bottom` = below-centre); `-start` / `-end` align to the trigger's start / end edge. So
  OriPopover / OriMenu / Combobox default to **`bottom-start`** (below, start-aligned) — a plain `bottom`
  would centre. The 12 `position-area` mappings are Playwright-verified (`e2e/placement-grid.spec.ts`);
  the shared prop type is `AnchoredPlacement` (`packages/vue/src/types.ts`).
- **happy-dom does NOT support `var()` fallbacks** — `var(--missing, sentinel)` computes to `''`, so
  unresolvable-token detection can't use a fallback argument; the token bridge wraps its probe in a
  sentinel-colored parent and compares against the inherited color instead. Related: happy-dom's
  `getComputedStyle().getPropertyValue('--x')` does **not inherit** (returns `''` unless declared on that
  very element) — which is exactly why the probe technique is needed even in tests.
- **`vi.stubGlobal('document', undefined)` must be unstubbed FIRST in `afterEach`**, before any DOM
  cleanup — a throwing cleanup line otherwise never reaches `vi.unstubAllGlobals()` and strands every
  subsequent test without a `document` (one failure cascades into dozens).
- **The 1 kB "core engine" size budget measures a re-export shim, not the engine** — tsdown/rolldown
  chunk-splits the shared core into `dist/core-<hash>.js` (~6 kB gzip) imported by all three entries;
  `dist/core/index.js` is ~0.2 kB of re-exports. Read the budget numbers accordingly.

## Svelte adapter (`@oriui/headless/svelte`)

- **A new subpath needs TWO alias entries, not one.** The vitest runtime alias
  (`vitest.config.js`) makes tests import the adapter's SOURCE, but `test:types` / `vue-tsc` resolve
  types through `tsconfig.json` `paths`. Add `@oriui/headless/svelte` to **both**. Miss the tsconfig
  path and TS falls back to the built `dist/svelte/*.d.ts`, where `tsdown` **widens the inferred
  `useCombobox`/`useMenu` return types to `unknown`** (the disclosure/dialog controls have explicit
  hand-written interfaces, so they stay precise — that asymmetry is the tell).
- **`getContext` throws outside component init** (Svelte 5 `lifecycle_outside_component`). `getHeadless()`
  wraps it in try/catch and returns `null`, so the composables fall back to the native adapter and stay
  unit-testable without rendering a component.
- **Reactivity is stores, not runes** (see DECISIONS.md for why). Item prop-getters are a **store of a
  function** — `derived(api, (a) => (item, i) => a.getOptionProps(item, i))`, consumed as
  `$getOptionProps(item, i)`. Stateless imperative methods (`setOpen`/`select`/`clear`/`highlight`) read
  the current api via `get(api)`.
- **Native-dialog ids are built directly** (`` `${baseId}-title` ``), NOT through `scope.getId` (which
  prefixes `ori-`). So the dialog's `titleId` is `myid-title`, while a disclosure's trigger is
  `ori-myid-trigger`. Same split as the Vue native dialog — mirror it, don't "fix" it.
- **Reactive options = a store, not a getter.** The Svelte twin of Vue's `MaybeRefOrGetter` is
  `MaybeReactive<T> = T | Readable<T>` — because a **plain getter can't be tracked** in a plain `.ts`
  file (runes only track inside `.svelte`/`.svelte.ts`). `useCombobox`/`useMenu` fold the options store
  into `derived([serviceVersion, opts$], …)` so list/filter changes re-project; `disabled` is a **side
  effect** (a machine `SET_DISABLED`), so it rides a separate eager `opts$.subscribe` torn down via
  `safeOnDestroy`. Don't do the `SET_DISABLED` inside the `derived` callback — mutating the machine there
  re-enters the derived (machine change → `serviceVersion` bump → recompute).

## Slots / a11y

- **A slot that renders displayable content must be reflected in DERIVED a11y state, not just the
  template.** OriField renders its error/hint `<p>` on `prop || $slots.x`, but the `isInvalid` /
  `describedBy` computeds first tracked only the props — so a slot-only `#error` left `aria-invalid` /
  `aria-describedby` unset, and `#error`-slot + `hint`-prop pointed `aria-describedby` at a hint `<p>` the
  error's `v-else-if` suppressed (a **dangling** describedby, which REVIEW.md forbids). Fix: fold
  `useSlots()` into the computeds — `hasError = error || slots.error`, `hasHint = hint || slots.hint`.
- **OriBadge's `decorative` (aria-hidden) guard must include `!$slots.content`, GATED ON non-dot.** A
  slotted glyph with no `content`/`label` prop would otherwise be aria-hidden and dropped from AT — but
  the `#content` slot only renders when `!dot`, so the guard is
  `!label && (dot || ((empty displayValue) && !slots.content))`. A dot stays decorative regardless of a
  (suppressed) content slot, else a `dot` + `#content` renders an empty, unnamed, non-hidden span.
- **Interactive slot content inside a native `<label>` / `<summary>` inherits click/activation
  semantics.** The Checkbox/Switch/Radio label slots sit inside `<label>` (a label click forwards to the
  control); the Accordion title slot sits inside `<summary>` (a click toggles). Fine for text / icons /
  badges; a nested interactive control (a link in a consent label) is the caller's responsibility — the
  same limitation the native elements carry.

## CSS cascade / layers

- **A component-layer rule CANNOT win a token the variant utilities set — the layer beats specificity.**
  `@layer` order is `ori.reset, ori.tokens, ori.base, ori.components, ori.utilities` (layers.css) — so
  `ori.utilities` beats `ori.components` **regardless of selector specificity**. The toolbar's pressed
  rule set `--ori-variant-bg-color: <tint>` in `ori.components`, but `.ori-variant_text` re-sets that
  token to `transparent` in `ori.utilities` → the token resolves to transparent everywhere, so
  `background-color: var(--ori-variant-bg-color)` painted nothing (only the literal box-shadow ring
  showed). Fix: set the property (`background-color`) as a **literal** in the component rule, NOT via the
  variant-owned token — the variants set only the token, never `background-color` directly, so a literal
  wins on specificity within `ori.components`. Rule of thumb: to override a variant-controlled look from a
  component file, write the final property literally; don't reassign `--ori-variant-*` (utilities owns it).
- **Do NOT `transition` a property whose value is a relative-color token (`oklch(from <role> …)`).**
  Browsers don't interpolate relative-color functions in a transition — a runtime `--ori-color` swap
  makes the value STICK on the old color until a repaint. `.ori-button` dropped `color` from its
  `transition` (the role-text tokens are relative colors, and no built-in state animates text color
  anyway), which unblocks consumers who recolor a button/icon by swapping `--ori-color`. If a future state must animate a relative-color property, resolve it to a concrete
  color first.

## Attribute fall-through: a later explicit binding DELETES the caller's value

`v-bind="$attrs"` followed by `:aria-describedby="x"` compiles to Vue's `mergeProps`, which **assigns
unconditionally** — when `x` is `undefined` it does not fall back to the `$attrs` value, it removes it. So
any component with `inheritAttrs: false` that both promises attribute fall-through AND binds an `aria-*`
attribute itself must **fold** the inherited value into its own computation. Reordering the bindings is not
a fix; it only flips which side gets clobbered. The two modes produce opposite bugs for the same attribute,
so an audit has to check `inheritAttrs` per component: with `inheritAttrs: false` + `$attrs` bound before an
explicit binding, the COMPONENT wins and the caller's id is deleted (input / select / textarea / combobox /
slider — fixed 2026-09-18); with default fall-through onto a root element that also binds the attribute,
fall-through merges last, so the CALLER wins and the component's own hint/error id is deleted (radio-group,
color-picker — ORI-I-98). `useAttrs()` reads ARE reactive inside a `computed` (the
proxy tracks every property get), so `attrs['aria-describedby']` in a computed is the correct idiom and needs
no getter dance — unlike props (`vue/no-setup-props-reactivity-loss`).

## A live region has to exist BEFORE its content

The a11y question is never "is there an element with `aria-live` in the DOM" but "did that element exist,
empty, before the content was inserted". A `role="status"` node that appears already populated is not
announced. `role="alert"` is the exception assistive tech special-cases, which is exactly what masked the
toaster bug: only danger toasts announced, so manual testing with an error toast showed everything working.
Two consequences: (1) axe and role-string assertions structurally cannot catch this class of defect — both
inspect an already-populated DOM — so a live-region regression test MUST mount with an EMPTY queue and assert
the semantics before any content exists; (2) do NOT put `role="status"` on a toast CONTAINER: it implies
`aria-atomic="true"`, which re-announces the whole queued stack on every push. A roleless container with
`aria-live="polite"` + explicit `aria-atomic="false"` is the correct shape (`aria-relevant` defaults to
`additions text`, so dismissals stay silent — setting it is noise). `<transition-group tag="div">` renders
its container even with zero children and fall-through attributes land on it, so it can BE the persistent
region with no extra wrapper.

## A bare axis base class in `ori.utilities` is never a harmless no-op

The declared layer order (`layers.css`) puts `ori.components` BEFORE `ori.utilities`, so a base class that
zeroes an axis cluster — the old `.ori-variant` — does not "opt a block into the system", it **overrides the
defaults the block bakes in**: `.ori-button.ori-variant` painted transparent with a `currentColor` label,
bypassing the AA-checked `--ori-color-on` pairing. The single-class model needs no base at all, and deleting
one keeps legacy paired markup (`ori-variant ori-variant_solid`) rendering, because at equal specificity the
value class wins on source order. Related cascade trap: `--ori-color-<role>-text` only tracks a skin because
skins are declared as `:root[data-ori-skin='…']`, i.e. on the SAME element as the `oklch(from …)` derive — a
custom property's `var()` substitutes where it is DECLARED, not where it is used, so a skin applied to a
subtree would inherit the frozen `:root` tone.

## A guard test that scans sources can pass by scanning nothing

Two rules for any "no file in this package may do X" test: strip `/* … */` comments before matching (the
stylesheet headers legitimately discuss the anti-pattern they forbid, so a naive scan self-triggers), and
assert the scan actually saw files — a lower bound on the count plus a couple of known filenames. Add a
self-check on synthetic input so the matcher itself is proved rather than assumed. Same idea in Vue: a prop
declared in `defineProps` but never read is INVISIBLE at runtime (Vue consumes declared props, so passing it
emits nothing) — which makes "does the rendered DOM change when I pass it?" the right contract test for a
prop, not "is it mentioned in the template?".

## happy-dom focuses a `<div>` that has no `tabindex` — real browsers do not

A negative test of the shape "omit the roving `tabindex` and assert focus does NOT move" passes in a real
browser and FAILS here: happy-dom will happily focus a non-focusable element, so the assertion cannot be
falsified. Pin such a requirement by ATTRIBUTE in the unit suite (exactly one item carries `tabindex="0"`,
the rest `-1`) and put the actual focus behaviour in the Playwright e2e, which runs real Chromium. The same
caveat applies to anything else that depends on the focusability rules rather than on the DOM shape.

## The Svelte `onDestroy` leg of any composable is DEAD in the vitest suite

`vitest.config.js` declares no `browser` condition, so Vitest resolves `svelte` to its **server** build,
where `onDestroy` is a no-op and component lifecycle never runs. Every Svelte composable that tears down on
`onDestroy` (`safeOnDestroy` in `./use-store`, used by native.ts, use-dismissable, use-toolbar,
use-color-picker and now use-theme) therefore has an untestable leg here: the unit suite proves the
subscribe/unsubscribe path and the explicit `destroy()` path, never the component-unmount path. Do not read
a green suite as proof that teardown happens in a real Svelte app — and do not "simplify" a composable by
deleting the explicit escape hatch just because no test covers it.

## Windows CRLF makes `\n`-anchored string surgery silently no-op

The working tree is CRLF (git converts on checkout). A throwaway script that does
`src.replace('foo\nbar', …)` matches nothing, writes the file back unchanged, and the "negative control"
that was supposed to go red passes instead — a FALSE PASS that looks like the code was already correct.
Normalise first (`raw.includes('\r\n') ? raw.replace(/\r\n/g, '\n') : raw`), edit, then write back in the
original ending. Better: use the Write/Edit tools rather than heredoc-driven scripts — a quoted bash
heredoc also collapses one level of backslashes, which silently breaks regexes and string literals written
that way.

## A contrast probe must pair its surface background with a text colour

The Chromium contrast guard built its probe surface with a background and no `color`, so any cell that did
not set its own colour was measured against the UA default foreground — pure black in light, pure white
under `color-scheme: dark`. That is the most flattering foreground that exists, and it hid nothing for
years only because every original cell set its own colour. The first inherited-text cells (form labels,
hints, control values) exposed it: the hint's true worst reading is 4.87:1, not the 7.43:1 the unpaired
probe reported. Every real surface block in the library declares both (card, dialog, menu, popover, the
combobox listbox), so the probe must too. **Rule: a test surface that stands in for a component surface has
to reproduce BOTH halves of the pairing, or it measures a page that does not exist.**

Related, from the same batch: the pre-fix `danger`-as-body-text bug was only ever catchable in the DARK
theme (it reads 5.69–6.47:1 in light across all skins). Any future attempt to speed the spec up by
sweeping one theme loses the ability to see that entire class of defect.

## Runtime theme toggling is not a measurement method

Flipping `.dark` on `<html>` and reading `getComputedStyle` gives STALE values for anything the element
baked in — the recorded Chromium bug (ISSUES-OUTER ORI-O-01). It bit again while hand-verifying the outline
variant: the border measured `0,82,136` (dark blue on a dark surface, apparently a 1.4:1 defect) when the
real value after a clean load is 12.17:1. Measure after a page load with the theme already applied, which
is exactly what the e2e specs do and why they are the authority for theme-dependent numbers.

Also note `getComputedStyle` returns `oklch(...)` / `oklab(...)` for relative-colour declarations, and
`color-mix()` values come back uncomposited. To get a true sRGB triple, paint the colour on a 1×1 canvas
over the real backdrop and read the pixel — a parser that assumes `rgb()` silently produces nonsense
(computing luminance from `oklch(0.86 0.19 27.5)` as if it were RGB yields a 1.1:1 "failure" that is not
real).

## Introducing a bundler plugin to size-limit changes every existing entry

`.size-limit.json` entries that only measure a built file use `@size-limit/file`. The moment one entry
needs the `import` field (to measure what a single named export costs), the config needs
`@size-limit/esbuild`, and size-limit then applies **every installed plugin to every entry** — so all the
pre-existing file entries must add `disablePlugins` or they start bundling and report different numbers.
Plugins are also discovered from the nearest `package.json`, which is why the devDependency lands in the
ROOT manifest rather than a workspace. The failure mode if the manifest change is dropped from the commit
is loud (`Config option import needs @size-limit/esbuild plugin`), but it fails the release gate.

## A capture listener on a component root swallows the caller's fall-through `@click`

Binding `@click.capture` unconditionally on an SFC's root element stops a caller's own `onClick` (arriving
through `$attrs` fall-through) from ever running on a real `<button>` — even when the capture handler itself
does nothing. It cost an afternoon to find because the failure is invisible in isolation: the test passes
when it runs alone, and passes again if anything reads the DOM (`outerHTML`) between mount and dispatch,
which is how it first passed.

Three things to remember:

- **Bind the guard only where it is needed.** `:onClickCapture="as === 'button' ? undefined : onClickCapture"`
  — a real `<button>` is stopped at the source by its `disabled` attribute and must not carry the listener.
- **The camelCase spelling is load-bearing.** `:on-click-capture` does NOT compile to a capture listener
  (Vue only recognises the camelCase DOM prop here), so `vue/attribute-hyphenation` is configured to ignore
  `onClickCapture` in `eslint.config.mjs` rather than "fixed". Auto-fixing that warning silently removes the
  guard while leaving a binding that looks right.
- **`@click.capture` cannot be made conditional**, which is why the explicit prop binding exists at all.

## Resolving a computed colour: canvas, not a colour library

`getComputedStyle` returns `oklch(…)` / `oklab(…)` for relative-colour declarations and serialises
`color-mix()` as `color(srgb r g b / a)`. colord cannot parse that serialisation — it silently returns
opaque black, which made a 2.1:1 switch thumb measure 21:1 and look perfect. Paint the value on a 1×1
canvas over the real backdrop and read the pixel instead; that also composites translucent layers, which a
parser cannot do at all. (Pair this with the entry above about runtime theme toggling: measure after a
fresh load, or force a `display: none` reflow flush per permutation.)

## A `prepack` hook is a build in a place you do not control the scheduling of

`changeset publish` packs every package **in parallel** (the `Publishing "…"` lines share a millisecond
in the run log). In a workspace where one package's build output is another's build input, that turns
per-package `prepack` builds into a race: `@oriui/headless` builds with tsdown's `clean: true`, so it
empties `packages/headless/dist` while `@oriui/vue`'s `vue-tsc -p tsconfig.build.json` — which resolves
`@oriui/headless` from exactly that directory — is reading it. Result: `TS2307` on every headless import
and **exit code 2**, which is `DiagnosticsPresent_OutputsGenerated`, not a crash.

Three things that made it expensive to diagnose (it half-published 1.0.0-rc.18):

- **npm hides the output of lifecycle scripts.** The workflow log showed the `prepack` banner, then
  `npm error code 2` and nothing in between — the diagnostics went to `~/.npm/_logs/*-debug-0.log`, which
  the runner throws away. `--foreground-scripts` is what surfaces them.
- **It cannot reproduce serially.** `npm pack -w @oriui/vue`, twice in a row, from a clean tree: always
  green. Only concurrent packs lose. The cheap repro is to stage the race by hand — move
  `packages/headless/dist` aside and run the vue build.
- **The gate does not cover it.** Everything ahead of the publish built, measured and smoke-installed a
  `dist`; `prepack` then threw that away and rebuilt, so the published bytes were never the measured
  bytes. Publishing with `npm_config_ignore_scripts=true` after one ordered build fixes both problems at
  once — the artifact ships as gated, and nothing rebuilds under a neighbour's feet.

## Widening a `vi.waitFor` window past the test's own budget does nothing

`vi.waitFor(fn, { timeout: 5000 })` inside a test that has vitest's default 5s `testTimeout` cannot
ever use that window: the enclosing budget expires first, and the report reads `Test timed out in
5000ms` — pointing at the test, not at the wait, so it looks like the assertion is wrong rather than
the clock. A waitFor window is only real if the test states a budget comfortably larger than it
(`it(name, fn, 20_000)`).

Worth knowing alongside it: a suite that is green in isolation and flaky in the full run is usually
saying the budget is too tight, not that the behaviour is wrong. `tests/token.test.ts` waits on
happy-dom MutationObserver deliveries, which are macrotasks — 20 runs of the file alone never flake,
while 65 files across parallel workers can starve a worker for seconds. Raise the budget on the tests
that genuinely wait; raising `testTimeout` globally hides real hangs everywhere else.

## A fresh publish is not visible on the registry for minutes — a 404 is not evidence

After a successful publish, `npm view <pkg> dist-tags` can keep serving the previous state, and so can a
direct `https://registry.npmjs.org/<pkg>` fetch — **including one with a cache-buster query, and
including the version endpoint `/<pkg>/<version>`, which 404s**. The package document carries
`Cache-Control: public, max-age=300`, misses are cached the same way, and `time.modified` in the cached
document keeps pointing at the previous publish, which makes the stale answer look authoritative.

Measured on the 1.0.0-rc.18 release: the workflow published at 17:10:30, four independent reads still
said "not published" at 17:12–17:14, and the registry's own recorded publish time came out as 17:12:37.

The consequence worth remembering is not the lag itself but what it invites: a half-published group is a
real failure mode here, so a 404 right after a release reads as confirmation of it. Take the
workflow's own publish step as the primary evidence — `npm publish` exiting 0 inside `changeset publish`
— and re-read the registry minutes later before concluding anything. A release gate that fails on an
immediate registry read would fail good releases, which is why no such check exists.

## `opacity` on a container that wraps a caller's slot is a contrast bug waiting to happen

`opacity` is a group fade: it composites the element and everything inside it, so putting one on a wrapper
applies it to content the component did not author — buttons, inputs, links — and it MULTIPLIES with any
fade those carry of their own. `.ori-dialog__body { opacity: 0.85 }` met `.ori-field__hint { opacity: 0.7 }`
and produced 0.595, taking a primary solid button to 3.35:1 and the hint to 3.95:1.

What makes it expensive is that it is invisible to every guard that does not rasterise:

- the **token test** walks role/on-role PAIRS and never renders — the button's pair measured 5.43:1 and was
  telling the truth;
- **axe** reads declared colours, so it sees the same honest pair;
- the **e2e contrast probe** did rasterise, but no probe had an opacity ANCESTOR — it only ever carried its
  own fade. A defect class the fixture cannot express is a defect class the suite cannot catch.

The rule this leaves: secondary text is a leaf with its own tone (`__subtitle`, `__hint`), never a fade over
a region. If a wrapper must dim, the contrast has to be measured composited, with a probe that puts the real
ancestors above it. Dark themes will usually pass while light ones fail, so a single-theme check proves
nothing here.

## A prop named `label` that only ever becomes `aria-label` renders an empty control

`OriToolbarButton` declared `label` as the accessible name for an ICON-ONLY button — it went into
`aria-label` and nowhere else. The visible text lived in a separate `text` prop. So
`<OriToolbarButton label="New" />`, with no `icon` and no `tooltip`, rendered a button with an
accessible name and **nothing inside it**: `OriButton`'s slot fallback needs `icon`, `loading` or
`text`, and none was set.

Nothing would have caught it, and the reasons are the part worth keeping:

- **the unit tests always passed an `icon` too** — `h(OriToolbarButton, { label: 'Redo', icon: 'x' })`
  is an icon button, which is the case the prop was designed for, so every assertion was about
  `aria-label` and none about the rendered text being non-empty;
- **axe is satisfied by an accessible name** — an empty button WITH `aria-label` passes `button-name`.
  An empty control is a visual defect, not an ARIA one;
- **the dev-time guard had the same blind spot**: it warns when `icon` is set but nothing names it —
  the exact inverse of this case.

The rule this leaves: a prop that names a control must either render or be spelled so that it cannot
be mistaken for the visible text. `ariaLabel` (→ `aria-label`) is spelled that way; `label` is not,
and now means the visible text everywhere in the library. Where a component can render no text at all
(`OriIcon`, `OriSpinner`, `OriToolbar`, `OriToolbarToggleGroup`), `label` remains the accessible name
— there is nothing for it to be confused with.

**The one component that still has both shapes is `OriBadge`**: `content` is what it renders,
`label` is its accessible name, so `label` there is the aria meaning, not the visible one. It is
deliberate rather than overlooked — a badge's rendered value is a COUNT (it pairs with `max`), and
the accessible name is what says what the count counts ("3 unread"). Vuetify names that field
`content` too. If a third component ever needs the pair, it takes `label` + `ariaLabel` like the
toolbar, and Badge becomes the exception to justify rather than the precedent to copy.

**The corollary:** once `label` renders, nothing else may
quietly become the accessible name. `OriToolbarButton` fell back to `aria-label: tooltip`, which was
correct while `label` was the aria name and became a WCAG 2.5.3 Label in Name failure the moment it
was the visible one — the button read "Save" and answered to "Write the document to disk", so voice
control could not activate it. The fallback is now conditional on nothing visible naming the button.
