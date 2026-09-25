# Ideas

Candidate components, classes and infrastructure — **not committed scope**. The filter for building one
is a single question: **does a real screen need it?** When an idea ships, delete it from this file; what
exists is in `packages/vue/src/components` and the docs.

Priority: ⭐ a real screen needs it, or it is foundational · ◽ parity nice-to-have · 🧪 niche / experimental.

## Project

- ⭐ **A real composed screen** — a recipes / showcase page a docs visitor can poke, assembled from the
  library to surface API gaps that isolated component demos hide.
- ◽ **Generic item values** — `T extends string` narrowing for Tabs / Select / RadioGroup values. Today a
  narrowed union has to be bridged to `string | number | undefined` by hand (justpaint's `AuthForm.vue`).
- ◽ **A rule for polymorphic `as`** — it exists on 7 of 34 components with no stated policy. The ones that
  render a `<div>` without it (Card, Alert) are where it bites: a `<div>` has far more invalid parents than
  a `<span>`.
- ◽ **`glass` variant.**
- ◽ **Tooltip on `.ori-anchored`** — its arrow does not flip under `position-try` yet; low value.
- 🧪 **`v-model.lazy` on Slider** — commit-only binding on top of the existing `change` event.
- 🧪 **Visual-regression snapshots** — deliberately not done: the highest-maintenance test type, and
  behaviour / a11y / geometry / contrast are already covered.
- 🧪 **Token inspector** — a dev-time panel showing which `--ori-*` tokens resolve and which `.ori-*`
  classes apply to a hovered element.
- 🧪 **Contributor scaffolder** — a new component as SFC + stylesheet + test + docs page, once the
  conventions settle. A consumer CLI is not planned: a shadcn-style copy-in does not fit (component CSS
  lives in `@oriui/css`), the agent surface already ships as `llms.txt` and `/raw/*.md`, and the unscoped
  name is unavailable (ORI-O-04).

## Platform and adapters

- ◽ **Vanilla headless adapter** for htmx / no-framework — focus trap and roving tabindex without a
  framework, behind the existing contract (`@zag-js/vanilla` or the native helpers).
- 🧪 **Zero-JS triggers for the CSS layer** — `command` / `commandfor` invokers opening `popover` and
  `<dialog>` with no script, as progressive enhancement.
- 🧪 **Hybrid (Capacitor) mode** — haptics, native gestures; an iOS adaptive skin.
- 🧪 **Style adapters** — a Tailwind v4 preset and an UnoCSS preset (`presetOri()`, on-demand classes).

## Candidate components

- **Forms:** ◽ NumberField / Stepper · ◽ Segmented control (a toggle group outside a toolbar) ·
  ◽ FileInput / Dropzone · 🧪 DatePicker / TimePicker · 🧪 PIN / OTP · 🧪 Rating
- **Navigation:** ◽ Breadcrumbs · ◽ Pagination · ◽ Steps · 🧪 Command palette · 🧪 Navbar / Bottom nav
- **Overlays:** ⭐ Drawer / Sheet (the docs shell has a bespoke one to extract; the native `<dialog>`
  engine can back it) · 🧪 Hovercard
- **Feedback:** ◽ Indicator (a dot / count anchored on an icon or avatar) · ◽ Empty state · 🧪 Meter
- **Data display:** ◽ Table (styled `<table>` first) · ◽ Stat · ◽ List · 🧪 Timeline · 🧪 Tree ·
  🧪 Carousel · 🧪 Calendar · 🧪 Description list · 🧪 Avatar group
- **Layout:** ◽ Container · ◽ AspectRatio · ◽ Center · ◽ ScrollArea · 🧪 Footer / Hero (better as docs
  recipes) · 🧪 Mask · 🧪 z-Stack
- **Typography:** ◽ Prose (`.ori-prose`) · 🧪 Heading / Text

## CSS layer

oriUI is not a utility framework. Utilities stay single-class and token-repointing.

- ⭐ **Pure-CSS icons** (`.ori-i-<name>`) — an icon as one class via `mask-image`, tinted by `currentColor`,
  for htmx / Astro / plain HTML.
- ◽ **More token scales** — shadow (`.ori-shadow_*`), z-index, aspect-ratio.
- ◽ **Attribute API** — `[ori-variant="solid"]` selectors mirroring the class utilities, for
  server-rendered markup.
- ◽ **Consumer recipes** — a documented way to compose `.ori-*` classes into a named recipe.
- 🧪 `.ori-mask-*`.

## Where to look for ideas

Compare one area against one or two of these at a time; findings land here, nothing is adopted
automatically.

- **Headless:** [Ark UI](https://ark-ui.com) / [Zag.js](https://zagjs.com) · [Reka UI](https://reka-ui.com) ·
  [Headless UI](https://headlessui.com) · [Radix](https://www.radix-ui.com) · [Ariakit](https://ariakit.org)
- **Styled:** [daisyUI](https://daisyui.com) · [Quasar](https://quasar.dev) · [PrimeVue](https://primevue.org) ·
  [Naive UI](https://www.naiveui.com) · [Element Plus](https://element-plus.org) · [Mantine](https://mantine.dev) ·
  [Park UI](https://park-ui.com) · [Chakra](https://chakra-ui.com)
- **Tokens / positioning / distribution:** [Open Props](https://open-props.style) ·
  [Floating UI](https://floating-ui.com) · [shadcn/ui](https://ui.shadcn.com) · [Panda](https://panda-css.com)
