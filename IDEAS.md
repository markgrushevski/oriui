# oriUI — ideas & catalog backlog

A parking lot for candidate components, classes, and tokens. **Not committed scope.** oriUI is
**not racing** daisyUI / Ark / Panda on catalog size — the point is _prototype fast, scale without
rewriting_, on a clean token foundation. The filter for pulling something OUT of this list and INTO
a [roadmap](ROADMAP.md) phase is one question: **does a real screen need it?** (the justpaint /
mtp-tg screens we build on oriUI), or is it portfolio-defining. Everything here is "maybe, later".

Priority legend: ⭐ high (real-screen / foundational) · ◽ parity nice-to-have · 🧪 niche / experimental.

## Shipped today (31) — for reference

Button · Card · Avatar · Icon · Spinner · Dialog · Input · Field · Combobox · Checkbox · Switch · RadioGroup ·
Accordion · Alert · Badge · Progress · Select · Tabs · Tag · Textarea · Tooltip · Popover · Menu ·
Divider · Stack (+ Cluster) · Join · Link · Skeleton · Kbd · Toast · Slider.

## Project improvements (beyond the catalog)

Engineering / DX / docs work that raises the quality bar — distinct from new catalog entries below.
Roughly by priority.

1. ⭐ **Floating / positioning primitive** — a small anchored-panel helper (CSS `anchor-positioning`,
   or a tiny JS positioner behind a contract). **Highest leverage:** unblocks Menu, Popover, Combobox
   collision-flip, and a rich Tooltip. **OriPopover + OriMenu shipped**, and the **`.ori-anchored` placement primitive is extracted** (`components/anchored.css`) — both consume it. **Done since:** Combobox listbox flip, and the **12-value `<side>[-start|-end]` placement grid** — locked + **Playwright-verified in real Chromium** (`e2e/placement-grid.spec.ts`). **Remaining:** retrofit Tooltip onto `.ori-anchored` (deferred — its arrow doesn't auto-flip under `position-try`; low value).
2. ⭐ **Docs IA + framework switcher** — a consistent per-page section order that mirrors the three
   layers (CSS / headless-JS / framework), a Vue ↔ Svelte switcher (Svelte now ships **real
   `@oriui/headless/svelte` snippets** on the behaviour-driven components — Combobox / Dialog / Menu +
   the headless pages; the CSS-only components are covered by the HTML tab, so the perpetual "soon" tab is
   gone), and explicit section separation. _(mostly done — applicability matrix / skin gallery remain)_
3. ⭐ **Svelte adapter** `@oriui/headless/svelte` — **SHIPPED.** A `connectStore` bridge (core
   `subscribe()` → Svelte `readable`/`derived`) + a Svelte `normalizeProps` (lowercased event names);
   full parity with `./vue` — `useDisclosure` / `useDialog` / `useCombobox` / `useMenu` + `provideHeadless`,
   returning Svelte stores. Chose **stores over runes** (no Svelte compiler in the tsdown build; SSR-safe);
   item-getters are stores-of-functions; options are `MaybeReactive<T> = T | Readable<T>` (a plain object
   or a store — Combobox/Menu re-filter + re-sync `disabled` reactively when a store is passed). 20 vitest
   specs; `svelte ^5` optional peer. **Remaining:** wire the docs framework-switcher's Svelte tab to real
   snippets (that's improvement #2).
4. ⭐ **Real composed screen / recipes page** — assemble an actual screen on oriUI to surface API gaps
   (the "build a real screen" goal); doubles as a portfolio piece.
5. ✅ **Size budget in CI** — **DONE.** `size-limit` (`@size-limit/file`, gzip) with budgets in
   `.size-limit.json` for the CSS bundle + the full `@oriui/vue` lib + the three headless entries;
   `npm run size` (self-contained `size:build`), a CI gate after Build (node 22), and a bundlephobia
   minzip badge in the README. Guards the zero-runtime / small-bundle promise.
6. ⭐ **`@oriui/css` à-la-carte entry points** — **SHIPPED (2026-07-05).** Split the
   package exports so direct CSS consumers (htmx / Astro / plain HTML) pay only for what they use — today
   `.` is the full bundle (~11 kB gzip, all 31 components). Plan: keep `.` (the full `styles.css`); add
   `./base.css` = the foundation (the `@layer` order declaration + reset + size/theme/font tokens +
   positions + utilities — everything except `components/*`); add `./components/*.css` wildcard
   per-component entries. **Pitfall to remember:** the cascade-layer ORDER is declared once
   (`@layer ori.reset, ori.tokens, ori.base, ori.components, ori.utilities;`) — for arbitrary import
   subsets/orders to cascade correctly, that declaration must ship in `base.css` and `base.css` must be
   imported first. The win is only for direct `@oriui/css` consumers; `@oriui/vue` consumers still get
   the full sheet. Shipped with an extra foundation pair beyond the plan: `./tokens.css` (reset-free, for
   apps with their own preflight) + `./reset.css` (standalone) — `base.css` = tokens + reset; guarded by
   `tests/css.entries.test.ts`, `base.css` budgeted at 3 kB gzip in `.size-limit.json` (2.5 kB today).
7. ⭐ **Token bridge: `useToken` / `useThemeColor`** — **SHIPPED (2026-07-05).** An
   official way to read resolved `--ori-*` design tokens from JS — canvas / WebGL / charting libs (Konva)
   cannot read CSS custom properties. Naive `getComputedStyle().getPropertyValue()` returns the
   UNresolved `var()` chain for unregistered custom properties, so the engine resolves through a **probe
   element** (set `color: var(--ori-color-primary)` on a hidden probe, read the computed color). Reactive
   to theme switches: a MutationObserver on the documentElement class (`ori-theme_dark`) +
   `matchMedia('(prefers-color-scheme: dark)')` for auto mode. Shape: framework-agnostic engine in
   `@oriui/headless` core + Vue and Svelte adapters (`useToken('--ori-color-primary')`,
   `useThemeColor('primary')` sugar). First real consumer: justpaint (the Konva canvas app). MVP scope:
   **colors only** (the probe reads through the `color` property). Shipped as `resolveToken` /
   `observeTheme` in core + `useToken` / `useThemeColor` for Vue (`MaybeRefOrGetter`) and Svelte
   (`MaybeReactive`, lazy `readable`); 19 vitest specs; all headless entries stay within their size budgets.
8. ⭐ **Playwright interaction e2e** — **SHIPPED (2026-07-06).** Real keyboard + focus flows happy-dom
   can't assert: Combobox `aria-activedescendant` nav + typeahead, Menu roving-focus, and the native
   `<dialog>` focus-**containment** invariant — 14 specs via a Vite harness (`e2e/harness/`, source-aliased
   components behind Playwright's `webServer`), green on Linux CI. **Visual regression deferred** by choice:
   it's the highest-maintenance test type (cross-OS baselines, churn on every intentional restyle) and the
   library already has behavior / a11y / contract / geometry / contrast coverage — low ROI for a solo lib.
9. ◽ **Theme / skin gallery** page · **applicability matrix** (Vue / Svelte / htmx / Astro / …) · the
   **`glass`** variant — the ROADMAP phase 5/7 remainders.
10. 🧪 **Package-export correctness in CI** (`publint` + `@arethetypeswrong/cli`) · a **token-inspector**
    devtool.
11. ⭐ **Reset-independence audit** — **SHIPPED (2026-07-06).** Make every `.ori-*` component block
    self-sufficient (declare its own `box-sizing` / margin zeroing / `font: inherit`) so `tokens.css` +
    components works with **no reset at all** — today only 10 of 32 component files set `box-sizing`
    themselves. Also reconsider `html { font-size: 16px }` in `reset.css`: it's not a reset — it pins
    the rem base and overrides the user's browser font-size preference (an a11y smell); dropping it
    would let the rem tokens scale with user settings. Shipped as a computed-style **diff e2e** over
    all 32 components (`e2e/reset-independence.spec.ts`: one fixture rendered under `tokens.css` alone
    vs `base.css` in real Chromium) plus the fixes it forced — a border-box subtree rule per block,
    `padding-block: 0` + `font-family: inherit` on Button, `padding-block: 0` on the input field,
    `padding: 0` on the Dialog close, `margin: 0` on `.ori-anchored` (the UA gives `[popover]`
    `margin: auto`) — and the `font-size` pin is dropped: the rem base now follows the browser setting.
12. ⭐ **rem token scales** — **SHIPPED (2026-07-06).** The size/font raw scales were px, so components
    honored zoom but ignored the user's browser font-size preference — the a11y half the reset-pin
    removal (item 11) left open. Unit policy: **rem** for the scales (action/gap/radius/font, exact
    16px-baseline equivalents — 44px → 2.75rem), **em** stays for text-relative values, **px** stays for
    hairlines/shadows/the `9999px` pill cap and the screen breakpoints (media-query rem resolves against
    the initial font size, not `html`). Proof pair in `e2e/rem-scaling.spec.ts`: pixel-identical computed
    dimensions at the 16px default, exactly ×1.25 at a 20px root while a 1px border stays 1px.

## Idea sources & periodic mining

oriUI is **not racing** these on catalog size — they are reference points to **mine** for API shape,
a11y patterns, class names, states, and gaps. The practice: **periodically run a scout agent** (when
starting a component, or every few weeks) to compare one oriUI area against one or two libraries and
report ideas worth pulling into this backlog — _findings land here, nothing is auto-adopted._

- **Headless / behavior:** [Ark UI](https://ark-ui.com) (+ [Zag.js](https://zagjs.com)) ·
  [Reka UI](https://reka-ui.com) (Vue) · [Headless UI](https://headlessui.com) ·
  [Radix](https://www.radix-ui.com) · [Ariakit](https://ariakit.org).
- **Styled / CSS catalogs:** [daisyUI](https://daisyui.com) · [Quasar](https://quasar.dev) ·
  [PrimeVue](https://primevue.org) · [Naive UI](https://www.naiveui.com) ·
  [Element Plus](https://element-plus.org) · [Mantine](https://mantine.dev) ·
  [Park UI](https://park-ui.com) · [Chakra](https://chakra-ui.com).
- **Tokens / positioning / distribution:** [Open Props](https://open-props.style) ·
  [Floating UI](https://floating-ui.com) · [shadcn/ui](https://ui.shadcn.com) (registry / CLI model) ·
  [Panda](https://panda-css.com).

> **Reusable scout prompt:** _"Compare oriUI's `<component / area>` against `<library>`. List concrete,
> on-philosophy ideas we're missing (props, states, a11y wiring, class names) — token-first, standalone
> CSS, a11y-correct, not chasing catalog size. Output a short ranked list; don't adopt anything."_

## Candidate components

### Forms & input

- ⭐ **Slider / Range** — single + range thumb; token-sized track. Pure-CSS thumb is doable; keyboard
  step needs a little JS. _(shipped, plus a `change` commit event — see DECISIONS.)_
    - 🧪 **`v-model.lazy` (`modelModifiers.lazy`)** — bind commit-only (update on native `change`, not
      `input`), the idiomatic Vue shape; purely additive on top of the shipped dual `update:modelValue`
        - `change` (which already covers "both streams at once"). ~5 lines SFC + a test; defer until asked.
- ◽ **NumberField / Stepper** — numeric input with +/− and clamping.
- ◽ **Segmented / ToggleGroup** — single/multi-select button row (pairs with **Join**).
- ◽ **FileInput / Dropzone** — styled file picker.
- 🧪 **DatePicker / TimePicker** (calendar-backed) · **PIN / OTP** · **Rating** · **ColorPicker**.

### Actions & navigation

- ⭐ **Link** (`OriLink` / `.ori-link`) — inline text link with color variants + underline-on-hover.
  We only have OriButton `as=` (a _button that navigates_); that is not the same as an inline prose
  link. This is daisyUI's [`link`](https://daisyui.com/components/link/). Small, used everywhere.
- ⭐ **Menu / Dropdown** — needs headless (focus, roving, Esc, outside-click) or the native Popover
  API path (see ROADMAP deferred). Backs context menus, action menus, the Select internals.
- ◽ **Breadcrumbs** · **Pagination** · **Steps / Stepper** (visual progress).
- 🧪 **Command palette** · **Navbar / Bottom nav** (more page _blocks_ than primitives).

### Overlays

- ⭐ **Drawer / Sheet** — edge-anchored panel. The docs shell already has a bespoke one to extract;
  the native `<dialog>` engine (same as OriDialog) can back it. daisyUI
  [`drawer`](https://daisyui.com/components/drawer/).
- ⭐ **Toast / Snackbar** — transient notifications; needs a portal + a small queue store. Real
  screens want it early.
- ◽ **Popover** — native Popover API path; backs Menu / Hovercard / rich Tooltip.
- 🧪 **Hovercard**.

### Feedback & status

- ⭐ **Skeleton** — loading placeholder; trivial CSS, high value.
- ◽ **Indicator** — corner-overlay anchor (a dot / count on an icon or avatar). daisyUI
  [`indicator`](https://daisyui.com/components/indicator/). **Overlaps our floating-Badge demo** —
  could generalize that into a real `.ori-indicator` placement primitive.
- ◽ **Kbd** — keyboard-key chip; trivial. · **Empty state** — illustration + message + action.
- 🧪 **Meter** — static measurement (vs Progress = task completion).

### Data display

- ◽ **Table** — styled `<table>` first (zebra, sticky head); sorting / virtualization later.
- ◽ **Stat** — big-number metric block. · **List / ListItem** — structured rows.
- 🧪 **Timeline** · **Tree** · **Carousel** · **Calendar** · **Description list** ·
  **Avatar group** (a cheap extension of Avatar).

### Layout primitives (we have **zero** of these today)

The catalog so far is forms / overlays / feedback — there is no layout group yet. This is the gap
behind daisyUI's [divider](https://daisyui.com/components/divider/) /
[drawer](https://daisyui.com/components/drawer/) / [footer](https://daisyui.com/components/footer/) /
[hero](https://daisyui.com/components/hero/) / [indicator](https://daisyui.com/components/indicator/) /
[join](https://daisyui.com/components/join/) / [mask](https://daisyui.com/components/mask/) /
[stack](https://daisyui.com/components/stack/). Highest-value first:

- ⭐ **Divider** (`.ori-divider`) — horizontal / vertical rule, optional centered label. Trivial,
  used on nearly every screen.
- ⭐ **Stack / Cluster** (`.ori-stack`, `.ori-cluster`) — flex column / wrapping row with a token
  gap; the workhorse layout primitive. (This is the _flow_ stack — distinct from daisyUI's `stack`,
  which z-overlaps children; we'd want the flow one ⭐ and could add the z-one 🧪.)
- ⭐ **Join / Group** (`.ori-join`) — collapse adjacent radii + borders so children read as one unit
  (button groups, input+button, segmented toolbars). daisyUI `join`. High value for toolbars.
- ◽ **Container** (`.ori-container`) — max-width + responsive padding shell. · **AspectRatio** ·
  **Center** · **Spacer** · **ScrollArea** (styled overflow).
- 🧪 **Footer** / **Hero** — page _blocks_ (compositions), better shipped as docs recipes than
  library components. · **Mask** — clip to a shape; niche. · **z-Stack** — overlap in one cell; niche.

### Typography

- ◽ **Prose** (`.ori-prose`) — opinionated long-form wrapper (the docs `.prose` could graduate).
- 🧪 **Heading / Text** — polymorphic typographic components.

## Candidate classes / utilities (the `@oriui/css` side)

oriUI is **not** a utility framework (no Tailwind race — CLAUDE.md). Utilities stay _component-
scoped and token-repointing_ (the two-tier `base + value` pattern, e.g. `ori-size-action`), not a
general atomic set. Candidates that fit that rule:

- ⭐ `.ori-link` (+ `_primary` / `_danger` / …, hover underline) — the CSS half of OriLink.
- ⭐ `.ori-divider` · `.ori-stack` / `.ori-cluster` (gap via an `--ori-gap` token) · `.ori-join`.
- ◽ `.ori-indicator` (+ placement) · `.ori-skeleton` (shimmer) · `.ori-kbd`.
- ◽ New token scales mirroring `ori-size-*`: a **shadow** scale (`.ori-shadow_*`), a **z-index**
  scale, an **aspect-ratio** scale — same single-class token-repointing pattern.
- 🧪 `.ori-mask-*`.

## Cross-cutting / infra ideas (not components)

- ⭐ **llms.txt** (`nuxt-llms`) — machine-readable docs so an AI in a consumer project gets the whole
  API in one fetch (ROADMAP phase 7).
- ⭐ **Consumer cheat-sheet** page — install + catalog + token reference on one page (the human twin
  of llms.txt).
- ◽ **CSS "Cascade & layers" guide note** — warn consumers that their _unlayered_ `a` / `button`
  reset can beat layered components (the exact footgun in NOTES.md; bit us twice in the docs shell).
- ◽ **Theme / skin gallery** page · **framework-switch** examples (Vue ↔ Svelte) — ROADMAP phase 7.
- 🧪 Tailwind v4 preset adapter · `@oriui/vanilla` (Zag) headless adapter for htmx / no-framework.

## Inspired by UnoCSS (integration / no-framework layer)

oriUI is component-first with a standalone CSS layer; UnoCSS is an on-demand atomic engine. The overlap
is the css layer — these fit oriUI's "integrate, don't reinvent" philosophy (like native `<dialog>` and
Zag-behind-a-contract), not a rewrite. Most serve the htmx / Astro / plain-HTML target.

- ⭐ **oriUI UnoCSS preset** (`presetOri()`) — ship the tokens + `.ori-*` utilities as a composable
  UnoCSS **preset**, generated **on-demand**. This is the on-demand answer to "we ship all ~41 kB of
  classes": a consumer already on UnoCSS gets only the oriUI classes they use, zero unused CSS. Pairs
  with the planned **Tailwind v4 preset** — both are style adapters; the token contract is the shared
  core. (UnoCSS: presets + JIT.)
- ⭐ **Pure-CSS icons for `@oriui/css`** (`.ori-i-<name>`) — an icon as a single class via `mask-image`
  (currentColor-tinted), no Vue, no SVG component, no JS. Lets htmx / Astro / plain-HTML use icons the
  way OriIcon serves Vue. (UnoCSS: `preset-icons`.) Complements, doesn't replace, OriIcon.
- ◽ **Attributify-style attribute API** for the css / htmx layer — `[ori-color="danger"]` /
  `[ori-variant="fill"]` attribute selectors mirroring the class utilities, so server-rendered markup can
  express an axis as an attribute instead of a class. (UnoCSS: attributify mode.) Niche, opt-in.
- ◽ **Consumer recipes / shortcuts** — a documented pattern (or a tiny helper) to compose oriUI classes
  into a named recipe, like UnoCSS `shortcuts`. oriUI's component size sugar (`ori-button_lg`) is already
  a built-in shortcut; this would expose the mechanism to consumers.
- 🧪 **Token inspector devtool** — a dev-time panel showing which `--ori-*` tokens resolve and which
  `.ori-*` classes are active on a hovered element. (UnoCSS: inspector.)
