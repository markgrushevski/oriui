# oriUI — ideas & catalog backlog

A parking lot for candidate components, classes, and tokens. **Not committed scope.** oriUI is
**not racing** daisyUI / Ark / Panda on catalog size — the point is _prototype fast, scale without
rewriting_, on a clean token foundation. The filter for pulling something OUT of this list and INTO
a [roadmap](ROADMAP.md) phase is one question: **does a real screen need it?** (the justpaint /
mtp-tg screens we build on oriUI), or is it portfolio-defining. Everything here is "maybe, later".

Priority legend: ⭐ high (real-screen / foundational) · ◽ parity nice-to-have · 🧪 niche / experimental.

## Shipped today (27) — for reference

Button · Card · Avatar · Icon · Spinner · Dialog · Input · Checkbox · Switch · RadioGroup ·
Accordion · Alert · Badge · Progress · Select · Tabs · Tag · Textarea · Tooltip ·
Divider · Stack (+ Cluster) · Join · Link · Skeleton · Kbd · Toast · Slider.

## Candidate components

### Forms & input

- ⭐ **Field / FormControl** — extract the shared label / hint / error / required contract that
  Input and Select grew by hand, so every control wires a11y identically (one source of truth).
- ⭐ **Slider / Range** — single + range thumb; token-sized track. Pure-CSS thumb is doable; keyboard
  step needs a little JS.
- ⭐ **Combobox / Autocomplete** — filterable listbox; needs the headless layer (roving, listbox
  ARIA, type-ahead). The first control that really exercises `@oriui/vue`.
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
