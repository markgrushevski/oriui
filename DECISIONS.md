# Decisions

Architecture decision log for oriUI — the "why" behind key choices, so they aren't
relitigated after a context compaction or by a new contributor. Companion to
[ROADMAP.md](ROADMAP.md) (what / when) and [CLAUDE.md](CLAUDE.md) (how). Newest first.

## Roving-tabindex is a compositional context over shared core helpers — a THIRD headless shape, and when to use which

Decided 2026-07-10 (OriToolbar flagship). The catalog now has **three** ways to implement behavior in the
headless layer; this records the taxonomy so the next widget picks the right one instead of copying the
nearest example.

1. **Machine behind the `OriHeadless` adapter contract** — Dialog, Combobox, Menu. Use when the behavior
   has a **meaningful alternative engine** a consumer might swap (native `<dialog>` / a Zag machine / a
   custom adapter) and/or real async state (open/close, typeahead, focus-trap). The swap seam earns its keep.
2. **Compositional roving context over pure core helpers** — **Toolbar** (`useToolbar` = provide/inject in
   Vue, `setContext` in Svelte; `core/roving.ts` = the pure index/key math; `core/roving-dom.ts` = the
   arrow-yield predicate). Use when the item set is **open / slotted** (not a closed data array) and the
   behavior is **just roving tabindex + real DOM focus** — which has NO alternative engine (it's DOM order
    - `.focus()`), so the adapter-swap seam would be the wrong abstraction. Real focus, `querySelectorAll`
      by DOM order.
3. **SFC-hand-rolled roving** — Tabs. A closed, data-driven (`tabs` array) widget whose roving wasn't yet
   worth extracting.

**Reconciles the OriPopover ADR** ("roving-tabindex is real state → the contract seam is for it → OriMenu
will re-enter the contract"). That still holds for **Menu**, whose COMPOUND behavior (roving + open +
typeahead, with a swappable engine) warrants the machine. A **bare toolbar's** roving does not: no
alternative engine, no async state → shape #2, deliberately outside the adapter contract. The rule is the
_presence of a swappable engine / real async state_, not the word "roving".

**Convergence intent (YAGNI-gated):** `core/roving.ts` is shared by the toolbar today only. When a SECOND
roving consumer lands — migrating Tabs onto `rovingIntent`/`resolveRovingIndex` (needs an optional
`isEnabled` skip predicate, since Tabs SKIPS disabled tabs while the toolbar VISITS them), or a future
RadioGroup/SegmentedControl (IDEAS) — extract a `useRovingFocus` adapter primitive (the Radix
RovingFocusGroup factoring) that `useToolbar`/`useTabs` compose. Do NOT build it speculatively.

## OriSlider commit event, and the live-vs-commit event convention for form controls

Decided 2026-07-09. OriSlider gained a `change` event (payload: the committed `number`), fired once when
the value settles — pointer release after a drag, or a keyboard step — alongside the existing
`update:modelValue`, which streams live on every `input` tick. A consumer binds both: `v-model` for the
live value (thumb + fill track the drag), `@change` to commit a whole drag as a single undo entry or run
a per-release side effect. This reclaims the last native fallback in justpaint — its LayersPanel opacity
slider stayed a raw `<input type=range>` precisely because commit-on-release wasn't a first-class
OriSlider event (its author didn't know `@change` already fell through).

**`@change` payload changed (pre-1.0 breaking).** `@change` was previously reachable only as an
undeclared native-event `$attrs` fallthrough (a raw `Event`). Declaring `change` as an emit removes it
from `$attrs` and changes the payload to a `number`. Cleanly subsuming the fallthrough beats leaving a
raw-`Event` shadow next to a coined `commit` (the two-idioms smell); pre-1.0 breaking is acceptable and
is disclosed in the changeset. A consumer needing the raw event attaches to the inner `<input>` via a ref.

**The convention (so the next control doesn't fork it):** a native-backed form control surfaces the
platform's commit under its **native name** — `change`, payload = the committed value, mirroring
`update:modelValue` — while a JS-driven selection widget uses a **semantic name** (`select`, as OriMenu
does). When a consumer needs BOTH the live stream and the commit at once (drag preview + one history
entry), the **dual event** (`update:modelValue` + `change`) is the sanctioned primitive — not a
`v-model.lazy` modifier, which can express only one or the other. This is the event-naming sibling of the
two-way-binding convergence flagged in the OriDialog entry, and the reference pattern for future
draggable/continuous controls (e.g. ColorPicker). A `modelModifiers.lazy` binding could be added later as
a purely additive convenience — tracked in IDEAS.

## OriDialog controllability is an optimistic dual-mode `v-model:open`, hand-rolled in the SFC

Decided 2026-07-09. `OriDialog` gained host control — a controlled `open` prop (`v-model:open`) plus
`update:open` / `close` emits, alongside the existing uncontrolled `defaultOpen` + `#trigger` slot.
This unblocks a consumer that owns the open state in its own ref (justpaint's confirm / shortcuts
dialogs were hand-rolled precisely because OriDialog couldn't be driven by a `confirmOpen` ref).

**Optimistic (notify-only), not veto-capable.** A user-initiated close (Esc / backdrop / ×) mutates
state and closes the native `<dialog>` immediately, _then_ emits — the host mirrors it into its ref. A
host can't keep the dialog open by ignoring the event: a native `<dialog>` can't be held open once the
browser closes it, and Esc is non-vetoable except via `closeOnEscape=false`. Full React-style control
(the parent as sole authority over closes) is therefore impossible on the native element — optimistic
is the only coherent contract, and the component + docs state it. Consumers echo `update:open`/`close`.

**Hand-rolled in the Vue SFC, not the headless contract.** Controllability lives entirely in
`ori-dialog.vue` — a `watch(() => open)` mirrors the prop into the adapter's `setOpen`, and
`onOpenChange` emits back. The framework-agnostic `DialogControl` contract is untouched: it already had
`defaultOpen` (seed), `setOpen`, and `onOpenChange`, so no "controlled prop" concept leaks into the
core and the swappable-adapter seam is preserved (a swapped `fakeDialog` drives the controlled path in
tests). The seed is `defaultOpen: open ?? defaultOpen` (a bound `:open` wins the initial value). One
footgun recorded in NOTES: the `open` prop MUST default to `undefined`, or Vue coerces an absent
boolean to `false` and the seed collapses.

Deferred (not a blocker): a catalog-wide two-way-binding convention. The catalog now carries three
idioms — Slider (manual `modelValue` + emit), Combobox (`defineModel` + reconciling watchers), Dialog
(manual `open` + `watch` + emit). Converging on one — likely `defineModel` plus a shared
`useControllable` helper, or lifting a reactive `open?` into the headless contract Ark-style — would
retire the recurring `= undefined` footgun and unify future overlays, but it's a cross-component
refactor and a convention choice, out of scope here. Left open for a dedicated pass.

## Runtime theme switching is a headless controller (`applyTheme` / `useTheme`), because the fix can't live in CSS

Decided 2026-07-08. Toggling the `ori-theme_dark` class at runtime leaves every styled component painting
the PREVIOUS theme's colours until it re-renders — a real Chromium bug (reproduced in **148 and 149**): the
engine misses the style invalidation for elements that bake a resolved alias into an element-scoped custom
property consumed through a `var()` chain (oriUI's core mechanism — see NOTES). It is broad (fill/tonal
backgrounds AND role text), NOT specific to the relative-colour `-text` tone (a literal reproduces it), and
emergent in the full cascade with a consumer's unlayered brand override. A bare `var(--ori-color-primary)`
read flips fine; the baking is the trigger.

**It is not fixable in `@oriui/css`.** Tested and ineffective: `@property` registration (source token, the full
consuming chain, and every flipping alias), literal per-theme tones, a plain reflow, and re-toggling the class.
The only thing that re-resolves it is rebuilding the box in the SAME task as the class flip. So the fix is
necessarily JS, and ships in **`@oriui/headless`**: core `applyTheme` (flip the `ori-theme_{light,dark}` class +
`flushThemeInvalidation`, a `display:none` round-trip on `document.body`) and `createThemeController` (adds
`auto` / persistence, reusing the matchMedia plumbing), with `useTheme` Vue + Svelte adapters mirroring
`useToken`.

**Why headless, not `@oriui/vue` or `@oriui/css`:** it's framework-agnostic behaviour with thin framework
adapters — the exact shape of the existing `observeTheme` / `resolveToken` / `useToken` theme bridge — and a
CSS-only consumer (no Vue) must still be able to switch themes, which needs the vanilla core in headless `.`.
`@oriui/vue` is for styled components; theming isn't one. There is no oriUI runtime that can intercept a theme
change, so the model is always **oriUI provides, the consumer invokes** at its toggle point (justpaint calls
`applyTheme` from its `useThemeStore`; the class flip is still the consumer's).

Alternatives considered:

- **Vue `:key` remount of the affected subtree** — also works (node re-creation is the bulletproof re-resolve),
  but it's app-specific, drops component-local state, and can't be shipped from a library as a default. The
  `display:none` flush is the lighter, framework-neutral default; `:key` stays a valid consumer choice for
  subtrees that must remount anyway.
- **A `MutationObserver` auto-fix** (`installThemeInvalidationFix()`) — most decoupled (call once, keep your own
  toggle), but the fix would run a microtask after the class change; timing vs paint is unverified. Deferred in
  favour of the explicit `applyTheme` path.
- **Wait for a browser fix** — rejected: reproduces in current Chromium, and the flush is a cheap, harmless
  no-op reflow once the browser fixes it.

## Role-as-text gets a dedicated on-surface tone (`--ori-color-<role>-text`) — a darker/lighter shade of the role

Decided 2026-07-08. A role's `--ori-color-<role>` is engineered as a fill **background** (light / saturated,
paired with dark `--ori-color-on-<role>` ink). The non-fill variants (text / outline / tonal), the selected
tab, alert + tag painted that raw role as **foreground text on the surface** — where a saturated or light role
fails WCAG AA 4.5:1 (default amber `warn` = 2.14:1 on white; the pale `secondary` and the dark-theme status hues
worse). One token can't be both a good light fill-bg (dark ink on it) and dark on-surface text — opposite
lightness requirements — so a **third member of the role token family** was added: `--ori-color-<role>-text`,
the AA-safe on-surface foreground; consumers read it through the `--ori-color-text` alias.

**The default is DERIVED, not hand-authored per skin — and it is the SAME hue as the role, only darker/lighter.**
Relative colour clamps ONLY the lightness of the role, keeping its hue + chroma:
`oklch(from var(--ori-color-<role>) min(l, 0.42) c h)` in light, `… max(l, 0.86) …` in dark. So the text — and the
outline border, which now reads the same token — is a darker (light theme) / lighter (dark theme) shade of the
SAME colour as the fill: "one hue, only lightness varies," not a muddy off-hue. It is declared **in each theme
block** (`:root` / light default + `.ori-theme_dark`), so it re-resolves for theme, skin, and a brand's role
override at ANY nesting — a **custom brand gets an AA text tone for free**, no per-skin authoring — and stays fully
overridable (`:root`, per-skin, per-instance) as the sanctioned replacement for the `.ori-button { --ori-color: … }`
hack. The light cap 0.42 / dark floor 0.86 are the tightest bounds that clear WCAG AA (>= 4.5:1) for every role ×
skin × text kind incl. the tonal hover/active tint (min ~4.55:1).

Alternatives considered:

- **`color-mix(role, on-surface 65%)`** (the first cut) — auto-adapting + AA, but mixing toward the neutral ink
  DESATURATED and hue-shifted the tone into a muddy colour that no longer matched the role's fill / border; replaced
  by the lightness-only relative-colour clamp above.
- **Explicit per-role `-text` tones per skin** (~40 hand-tuned values) — best aesthetic control but heavy, and a
  custom skin would have to author its own (no free AA). The derived default subsumes it; a specific hue is still
  available by overriding `--ori-color-<role>-text` directly.
- **Neutral (on-surface) text for the non-fill variants** — trivially AA but discards the role colour (a danger
  text button would be plain ink), so rejected.
- **Darken the role token itself** — breaks the working fill variant (its dark on-ink loses contrast on a
  darkened fill) and changes the whole palette's character, so rejected.

**Delivery — and a custom-property gotcha.** The tone reaches an element two ways: the `.ori-color_*` utility sets
`--ori-color-text` on the element, and every block that bakes a role also bakes it (`.ori-button` / `.ori-tabs` /
`.ori-tag` / `.ori-combobox` → primary, `.ori-alert` → info). The `:root` `--ori-color-text` default is NOT a role
derive — it is the neutral `--ori-color-on-surface` ink, because a `var(--ori-color)` written at `:root` freezes to
`:root`'s value (a custom property's `var()` is substituted where the property is DECLARED, not where it's used),
so it could never track a block-baked `--ori-color`. This is why baked-role blocks must repoint `--ori-color-text`
themselves rather than lean on the default. Declaring the `-text` tokens **in each theme block** (not only `:root`)
also lets them track a **subtree** `.ori-theme_dark` / `.ori-theme_light`, not just a whole-page swap, and
re-resolve correctly even when a consumer overrides `--ori-color-<role>` with an **unlayered** theme rule — an
earlier `:root`-only derive silently froze to the page value there (it bit a real consumer's dark theme in testing).

Guarded by **e2e/text-contrast.spec.ts** in real Chromium (the Node token guard can't evaluate `oklch(from …)`;
happy-dom axe has no layout engine) — covering every role × skin × theme × text kind, the tonal hover/active tint,
and the bare-block baked path. **Revisit trigger:** if CSS `contrast-color()` reaches Baseline, the derived default
could become a true auto-contrast pick rather than a fixed mix ratio.

## Tests stay in the root `tests/` directory (not co-located in `src`, not per-package)

Decided 2026-07-05. The suite is **contract / cross-package by nature** — `tokens.contrast` parses the
css package's skin CSS, the headless contract is driven through a fake `DialogAdapter`, and the a11y/axe
pass runs over the styled components — so there is no single component or package to co-locate with. Root
placement also keeps the tests out of the lib build and `npm run types` **for free** (its original
purpose). Alternatives considered:

- **Co-location in `src`** — loses the free isolation, and the contract tests have no home.
- **Per-package `tests/`** — only pays off when the packages gain independent CI / releases; today the
  three release in lockstep via a fixed changesets group, so YAGNI.

**Revisit trigger:** if the packages start releasing / CI-ing independently, split per-package while
keeping the out-of-`src` principle.

## Token-axis classes are single-class + block-baked defaults (dropped the paired base)

The `.ori-*` token utilities were **paired** — a base class plus a value (`ori-color ori-color_primary`,
`ori-size-action ori-size-action_md`). That had two costs the user flagged while imagining a consumer
building their **own** Vue components on the css layer: **verbosity** (five axes × two classes is a wall
of markup) and a **silent-no-op footgun** (the utility selector was the compound `.ori-x.ori-x_y`, so a
value class without its base did nothing, with no error). Decision: make every axis a **single-class**
utility and **bake sensible defaults into each block**.

- **One class repoints one token.** `.ori-color_danger { --ori-color: …; --ori-color-on: … }` lives in
  `@layer ori.utilities` (declared last), so it beats a block's baked default by **layer order, not
  specificity** — the base class is gone, the no-op footgun with it. The radius/font **scales moved to
  `:root`** (`@layer ori.tokens`) so the value class is self-sufficient (they previously lived inside the
  base-class rule; one dead per-component step override — Button's `--ori-font-size-step_inc` — was
  removed in the move, preserving the 2px progression).
- **A bare block is valid.** Each `.ori-<name>` bakes its prop-default tokens (size / radius / font /
  color, and the default variant cluster where the css reads `--ori-variant-*`), so
  `<button class="ori-button">` is a complete filled-primary md button; add a class only to override.
- **Size keeps a friendly component sugar.** `ori-button_lg` / `ori-input_md` / `ori-avatar_xs` (the
  daisyUI-familiar shape) repoint `--ori-size-action`; the low-level `ori-size-action_lg` still works for
  hand-authored markup. `action-space` was unified to the same single-class shape
  (`ori-size-action-space_*`). Other axes are the generic single-class utilities.
- **Backward compatible.** A component or doc still emitting `ori-color ori-color_primary` keeps working —
  the value class matches; the now-inert base is a harmless extra — so all 18 components + 19 doc pages
  migrated without a flag day.

**Color is a ROLE, variant is the MAPPING — there is deliberately no `bg-color`** (user asked).
`ori-color_*` sets a semantic pair (`--ori-color` accent + `--ori-color-on` contrast); the variant
decides how it is painted (fill → bg + on-text; tonal / outline / text → accent). A separate `bg-color`
would re-introduce the manual "pick bg AND matching text" pairing the variant abstracts away — and break
the AA contrast pairing the contrast test enforces. An arbitrary background is a surface token
(`ori-color_surface`) or an inline `--ori-color`.

This supersedes the "two-tier aliases repointed by a utility class" entry below **only in the class
surface** (one class, not a pair); the two-tier **token** model (raw scale → resolved alias the component
reads) is unchanged and is exactly what makes the single class a one-line repoint. Rolled out via an
orchestrated workflow with per-component / per-page adversarial verification; verified by 324 tests,
types, lint, and browser measurements at every step. Input and Button are the hand-built references.

## `OriDialog` defaults to the native `<dialog>`; Zag dropped from the default path

`useDialog` / `OriDialog` now run on the platform `<dialog>` element (`showModal()`), with **no
adapter required** — the same native-default pattern `useDisclosure` already uses. The element supplies
the focus-trap, `Esc`-to-close, `::backdrop`, top-layer rendering, `inert`-on-rest and focus-return that
were the entire reason a dialog was previously delegated to Zag (Baseline ~2023, incl. the modern
Telegram WebView). The component owns the `<dialog>` markup and a `watchPostEffect` that calls
`showModal()`/`close()` from reactive `open` state; the adapter supplies only state + ARIA prop bags, so
the `OriHeadless` swap mechanism is **retained** — a custom dialog adapter still slots in, and Zag can be
re-added **per-widget** for a genuinely hard widget (combobox / datepicker / listbox / typeahead-menu) if
one ever appears in a real project.

**Why now, and on what evidence:** an exhaustive inventory of the two real consumer apps (justpaint —
already on oriUI; mtp-tg — a Telegram Mini-App marketplace) classified **every** interactive/overlay
surface, and three adversarial reviewers each hunted for a Zag-only widget. Verdict: **none exists**. The
three canonical Zag justifications — async combobox/typeahead, datepicker, virtualized/multi-select
listbox — are absent from both. The "hardest" surfaces were ordinary modals (`ContactFormModal`,
`OrderConfirmModal`, justpaint's menu drawer) that hand-roll an overlay and are **missing**
focus-trap/`Esc`/`inert`/focus-return — so a native `<dialog>` is not parity but a strict a11y **upgrade**;
the order-history accordion is already native `<details>`, the theme switch already a native checkbox, and
in Telegram-WebView mode mtp-tg deliberately prefers the host's native `MainButton`/popup over its own DOM
controls — native-first at the platform tier. The one honest gap: CSS anchor-positioning's collision flip
(`position-try`) is not yet Baseline in the Telegram WebView, so a future edge-anchored flyout/menu would
want a small positioning helper (floating-ui-style) — still **not** Zag. This supersedes the old
"`useDialog` has no native default / fails loud without Zag" design. Removed the prototype `zagDialog`
adapter and the `@zag-js/*` docs dependencies; `@oriui/headless` + the agnostic contract remain the hedge.

## Scope: a portfolio showcase + the author's own Vue design system (not a market competitor)

oriUI's two goals are a **senior-level GitHub portfolio** piece and the author's **own design system**
for personal Vue projects (justpaint, mtp-shop) — **not** competing with Ark UI / Panda / Reka on market
reach, framework breadth, or catalog size. Comparing a solo alpha to those mature, team-built libraries
is the wrong frame: the portfolio value is visibly senior-level architecture + judgment, and the
personal value is a design system the author understands and can bend to their own needs. Consequences:

- **No multi-framework race.** Styled components stay **Vue-only**; `@oriui/css` + `@oriui/headless` are the
  framework-agnostic hedge already in place (React/Svelte styled wrappers come only on real adoption —
  YAGNI, not speculative layers built blind).
- **No catalog-breadth race.** Build only the components the author's projects actually need, not Ark's 40. Requirements come from building a real screen of a personal project, not imagined gaps.
- **Zag dropped from the default path** (done — see the dialog ADR above). Presentational components need
  no behaviour engine; `OriDialog` now runs on the native `<dialog>` + `showModal()` platform path
  (focus-trap, `Esc`, `::backdrop`, focus-return, `inert` — Baseline ~2023) with no adapter to wire,
  confirmed by an inventory of both real consumer apps. The **swappable contract stays** as the hedge:
  re-add Zag **per-widget** only if a genuinely hard widget (combobox, datepicker, listbox,
  typeahead-menu) shows up in a real project — no rewrite needed.
- **Next step = a real screen** of justpaint / mtp-shop on oriUI: it proves usefulness, surfaces real
  requirements, and is the portfolio's "a real app built on my library" story.

## CSS layer extracted to a standalone `@oriui/css` package

The CSS layer (tokens + base + `.ori-*` utilities) now ships as its own **zero-dependency** package,
`@oriui/css` (`packages/css/`), instead of an `@oriui/vue/css` subpath. **Why:** the subpath forced a
CSS-only consumer (htmx / Astro / plain HTML) to `npm install @oriui/vue`, which drags in `@oriui/headless` and a `vue` peer-dependency warning
— directly contradicting the "CSS layer is Vue-free,
first-class" positioning. `@oriui/css` has no deps and no peer, so `import '@oriui/css'` (or a CDN
`<link>`) is clean. `@oriui/vue` now **depends on** `@oriui/css` (its components read those tokens) and
no longer ships its own `./css`; styled Vue consumers `import '@oriui/css'` for the stylesheet. The
styles source moved `src/styles/` → `packages/css/src/`, bundled to one file via `postcss-import`
(+ autoprefixer). Three packages now move in lockstep: `@oriui/vue`, `@oriui/headless`, `@oriui/css`.

**Completed since:** the bundle is now **minified with cssnano** (~40 → 16.6 kB without component
styles; ~40 kB with them), and the **component block styles were moved into `@oriui/css`** — each
component's CSS now lives in `packages/css/src/components/<name>.css` under `@layer ori.components`, the
SFCs carry no `<style>` block, and `@oriui/vue` emits no per-component CSS chunks. So the standalone CSS
layer now renders the actual `.ori-*` components (not just tokens), making htmx / Astro / plain-HTML a
real target; styled-component consumers `import '@oriui/css'` once for everything. Cascade note: moving
the previously-**unlayered** SFC styles into `ori.components` means the `ori.utilities` layer (declared
last) now wins over component rules — fine, since utilities only set tokens the components read.

## Root package renamed `oriui` → `@oriui/vue` (npm name-similarity block)

npm's typosquatting filter **rejects the unscoped name `oriui`** as "too similar to existing package
`cliui`" (a popular yargs dependency) — a hard 403 on the first publish, not appealable in practice.
Unscoped variants that normalize to the same token (e.g. `ori-ui`) are blocked too; **scoped names
bypass the filter**, which is why `@oriui/headless` and `@oriui/headless` published fine. So the flagship styled
package ships as **`@oriui/vue`** under the existing `oriui` npm org, giving a clean trio: `@oriui/headless`
(agnostic contract) · `@oriui/headless` (headless Vue) · `@oriui/vue` (styled). Consumers
`import { OriButton } from '@oriui/vue'` and `import '@oriui/css'`. The **oriUI brand** (project name,
npm org, docs title) is unchanged — only the install/import specifier moved. The docs Nuxt alias, the
MDC plugin registration, and every install/import example were updated to match.

## Trunk-based `main`; a release is a separate tagged event

`main` is an always-green **trunk**, not a release-only branch: coherent, green work merges in
continuously — the docs site deploys from `main`, so doc and fix work shouldn't wait on the npm
cadence. A **release** is a distinct, deliberate event layered on top — bump the three packages in
lockstep, publish ([RELEASING.md](RELEASING.md)), and **tag `vX.Y.Z`** on the release commit, so
every published npm version maps to an exact commit. Decoupling "on `main`" from "published" is the
reason internal deps are pinned and publishing is its own runbook.

- **`--no-ff` merges** into `main` (user preference): the merge commit keeps each branch as a single
  unit in `main`'s first-parent history. Work lands on **short-lived topic branches** off `main` —
  `refactor/oriui-foundation` was a one-off foundation epic, not the ongoing model.
- Rejected **release-gated `main`** (advance `main` only at releases): it would leave the live docs
  stale between alpha publishes — bad for a portfolio site.

The full branch / commit / release workflow lives in [CONTRIBUTING.md](CONTRIBUTING.md).

## Docs IA: Reka-style sections; framework split is per-component, not a nav branch

Reworked the docs navigation to the Reka/Radix model (user-driven). The top level is four sections:
**Overview** (intro, get-started, installation, a11y), **Guides** (styling, theming, customization,
the CSS layer), **Components** (nested by category — Actions / Data Input / Data Display / Feedback →
pages), and **Headless** (the behaviour layer, nested by sub-layer: **Core** = `@oriui/headless`, the
framework-agnostic contract + native engine; **Vue** = the composables; a Svelte group / Utilities
slot in later). The nav tree (`NavTree` → collapsible `NavSection`, built on `useDisclosure`) is
shared by the desktop sidebar and the mobile drawer.

- **Frameworks are a per-component switcher, not a nav dimension.** A component page shows the same
  example as **Vue** (the styled component) or **HTML** (the standalone `.ori-*` CSS layer) via the
  Example tabs; a Svelte tab joins later. So "Vue vs Svelte vs CSS" lives _inside_ the page, and the
  headless composables sit under Headless → Vue (their framework binding). Rejected a top-level
  framework branch (premature — only Vue exists) and a global framework switcher (a no-op today).
- **The home is a landing**, not a doc page: no sidebar, the nav sits behind the burger, and the hero
  bleeds full-width (100vw). Responsive (≤ 860px): the header collapses to a burger → a drawer
  carrying the full nav; horizontal overflow is clipped at the viewport with `overflow-x: clip` on
  `.docs` (which, unlike `hidden`, keeps the sticky nav working).
- **Component pages** use the chip `ClassTable` (a coloured type chip per row) at the top + dense
  examples + Props / Events / Slots + a11y — the Button page is the exemplar.

Why: it scales (sections + per-component framework tabs), matches what Vue devs expect (Reka / Radix),
and stays honest about the layered architecture (styled / headless / CSS; Vue binding / agnostic core).

## Dropped silent no-op props (Avatar `shadow`, Card `icon`)

The first orchestrated docs review surfaced props declared in the SFCs but never wired to the
template — silent no-ops a consumer could set with zero effect (a misleading API, worse than a
missing feature). Removed `shadow` from OriAvatar and `icon` from OriCard (the latter redundant with
`prependIcon` / `appendIcon`). `OriCard.image` is kept for now but **documented as a reserved/planned
hero image** — the rule going forward: a reserved feature ships with real behaviour, not as a no-op
prop. (Pre-1.0 alpha, so the removal is a free breaking change.) Notable: the multi-agent review
earned its keep by finding real component bugs while writing the docs.

## CI: GitHub Actions quality gate (Phase 8, first slice)

`.github/workflows/ci.yml` runs on push to `main` + every PR: **lint → types → test → build**
across a Node matrix (`22` and `24`; the tsdown build toolchain requires Node ≥ 22.18, and Node 20 is EOL). Decisions:

- **Separate `lint:ci` (check mode) from the local `lint:*` (fix mode).** The everyday scripts run
  `prettier --write` / `--fix` for DX; CI must _fail_ on drift, so `lint:ci` runs `prettier --check`,
  `stylelint`, and `eslint` with no auto-fix. The type gate runs both `types` (lib) and `test:types`.
- **Reordered `.lintstagedrc.json` so Prettier runs LAST** (after `stylelint --fix` / `eslint --fix`).
  The old order let stylelint reformat _after_ Prettier, so committed SFCs could be left
  not-Prettier-clean (caught here: `ori-dialog.vue` had a stray blank line). Prettier-last makes it
  authoritative. Added `.prettierignore` entries for generated output (`.output`, `.nuxt`, `coverage`).
- **Deploy stays Vercel-side**, not in Actions — Vercel's Git integration builds `npm run docs:build`
  on push (preset pinned in an earlier commit). **npm publish via changesets is deferred** — it needs
  the npm Trusted-Publishing setup and a release-flow decision (the `alpha` prerelease dist-tag), which are the maintainer's call.

**Stack** — Vitest 4 (the line that peer-supports Vite 8), happy-dom (fast, no layout engine),
`@vue/test-utils` for mounting, `axe-core` for structural a11y. Lives in `tests/` (out of `src`,
so the lib build and `npm run types` never see it); a dedicated `vitest.config.ts` keeps the
lib build's externals/preserveModules out of the test run and aliases `@oriui/*` to package
**source** so the suite needs no `build:packages` first (clean-CI friendly).

- **Rejected `@testing-library/vue`** (listed in the original plan): these tests assert classes,
  attributes and ARIA — VTU queries them more directly, and `axe-core` covers the "test like a
  user" a11y dimension better than role-queries would. Lean dependency surface; can add later.
- **Contrast is an executable test, not a comment.** `tests/tokens.contrast.test.ts` parses the
  token CSS, resolves `var(--ori-neutral-*)`, and asserts every role/on-role pair (base + 6 skins,
  light+dark, +status) meets WCAG AA >= 4.5:1. It immediately caught a real failure (Sumi
  `secondary-dark` at 4.18:1 -> darkened to `#7e5e44`, 5.18:1), making the "every colour ships a
  contrast-checked on-color" promise enforceable on every change.
- **Headless contract tested without Zag.** OriDialog is driven by a fake in-memory `DialogAdapter`
  (`tests/helpers/fake-dialog.ts`) that emits the contract's accessible prop shape. This unit-tests
  the component against the _contract_ (proving swappability) and keeps Zag — a docs/app dependency,
  not a lib one — out of the library's test graph. Also asserts the no-adapter case fails loud.
- **Playwright/visual regression deferred.** The component + a11y + contrast unit layer delivers
  most of the signal at a fraction of the flakiness; visual-regression E2E is a later add (Phase 8
  CI), not a blocker for the first test pass.

## OriDialog promoted into the `oriui` package: styled = headless + css (depends on @oriui/headless)

The first behavioral styled component now lives in the library (moved out of the docs prototype).
`oriui` gains a runtime **dependency on `@oriui/headless`** — `OriDialog` consumes `useDialog()`, so the
layering is literally "styled = headless + css". Mechanics:

- `@oriui/headless` (+ `@oriui/headless`) are **external** in the Vite lib build (not bundled); the import is
  preserved and resolved from the consumer's deps. The root `build` script runs `build:packages`
  first so `vue-tsc` can resolve the package `.d.ts` (fresh-clone / CI safe). Verified: the built
  `ori-dialog.js` keeps `import … from '@oriui/headless'` and the types flow through the barrel.
- The library can't use Nuxt's `<ClientOnly>`, so the Teleport is gated on a `mounted` ref —
  SSR-stable in any Vue/Nuxt host. Styles are tokenized (`--ori-color-surface`, `--ori-shadow-lg`).
- `useDialog` still has **no native default** — the consumer wires a dialog adapter via `OriHeadless`
  (e.g. Zag), per the native-simple / Zag-complex split. The docs `DialogDemo` now imports
  `OriDialog` from `oriui` and the prototype is deleted; build + live behavior both verified.
- `@oriui/headless` is a regular `dependency` (not peer) for DX — the contract core is tiny and the
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
  components on Zag, on our **native** `@oriui/headless` adapter, or on a user-supplied one — same
  markup. If runtime swap ever proves messy, the fallback is the simpler "enable Zag or use no
  headless" toggle (user-approved).
- **The native `@oriui/headless` Disclosure is kept** as the reference/default adapter and the "one
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

**Update — Svelte adapter shipped (`@oriui/headless/svelte`), with two deviations from the sketch above:**
(1) **Svelte stores, not runes.** The reactive cell is a `readable`/`derived` store (a `connectStore`
bridge re-emitting `connect()` on every `subscribe()`), not `$state`/`$derived`. Rationale: runes only
compile in `.svelte`/`.svelte.ts` files, which would pull the Svelte compiler into the `tsdown` library
build (headless ships plain ESM); stores stay pure `.ts`, are SSR-safe, work in Svelte 4 & 5, and give
consumers `$store` auto-subscription. Item prop-getters (`getOptionProps(item, i)`) are exposed as a
**store of a function** (`$getOptionProps(item, i)`) — the store establishes reactivity, the call takes
the runtime args. (2) **Reactive options via `MaybeReactive<T> = T | Readable<T>`** — the Svelte twin of
Vue's `MaybeRefOrGetter`. A **plain getter can't be tracked** in plain `.ts` (runes only track inside
`.svelte`/`.svelte.ts`), so the reactive channel is a **store**, not a getter: `useCombobox`/`useMenu`
take a plain object (snapshot) OR a `Readable`; option-list changes re-filter via
`derived([serviceVersion, opts$], …)` and `disabled` is pushed into the machine through a lifecycle-safe
`opts$.subscribe` (torn down via `safeOnDestroy` = `onDestroy`-in-try/catch). Interactive machine state
(input/highlight/open/selection) is reactive regardless of call style.
SSR ids: Svelte has no `useId()` callable outside component init, so the adapter uses a module counter
(`uid`) and documents "pass an explicit `id` for SSR". The build adds a third `tsdown` entry
(`src/svelte/index.ts` → `dist/svelte/*`) and a `./svelte` export; `svelte ^5` is an optional peer.

## Packaging = scoped monorepo packages, not subpath exports

Multi-framework needs **separate npm packages**: `dependencies`/`peerDependencies` are declared
once per package, so a single `oriui` with `./headless/vue` + `./headless/svelte` subpaths would
force a Svelte consumer to carry `vue` as a peer (and vice-versa). Ark UI proves the split —
`@ark-ui/vue` (peer vue) and `@ark-ui/svelte` (peer svelte) are separate; a Svelte app installs
zero Vue. So: `@oriui/headless` ships the vanilla-TS engine (`.`) + a Vue adapter (`./vue`, peer vue), with a
`./svelte` adapter later; styled stays `@oriui/vue`; `@oriui/css` split deferred.

- **Build:** per-package — `tsdown` (headless `@oriui/headless` — engine + Vue adapter, ESM + dts; migrated off
  `tsup`, now maintenance-mode), Vite-lib + `vue-tsc` (styled `@oriui/vue`, SFCs + CSS),
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

## OriPopover: non-modal overlays are platform primitives, not headless-contract behavior

OriPopover deliberately sits **outside** the `OriHeadless` contract — no `useDisclosure` / adapter, no JS
state machine. The platform supplies everything a non-modal popover needs with zero JS: top-layer +
light-dismiss + `Esc` from the **Popover API** (`popover` + `popovertarget`), and placement + collision
flip from **CSS Anchor Positioning** (`position-anchor` + `position-area` + `position-try-fallbacks`). This
extends the native-`<dialog>` thesis (the dialog ADR above) to the non-modal case: the contract seam is
for behavior with real state (focus-trap, roving-tabindex, typeahead); a pure placement primitive has
none, so wrapping it in `useDisclosure` would be a wrong abstraction. **Corollary:** OriMenu _will_ re-enter
the contract (roving-tabindex is real state) while **reusing** OriPopover's placement CSS.

Its a11y is a **consumer contract** (the zero-JS cost): the panel `role` defaults to `dialog`, the
accessible name comes from `aria-label` / `aria-labelledby` (fall through via `inheritAttrs: false` +
`v-bind="$attrs"`), and the trigger's expanded state is **unmanaged** — `aria-haspopup` + `aria-controls`
convey the relationship statically, since there is no JS open-state to bind `aria-expanded` to.

This anchor-positioning placement is the **new catalog reference** for floating panels; OriTooltip and
OriCombobox use older static placement and are **legacy to retrofit** onto it. Pending (with OriMenu):
extract the placement + flip into a reusable `.ori-anchored_*` primitive (populating `positions/positions.css`),
retrofit Combobox/Tooltip collision-flip, and lock the shared `placement` enum to the 12-value
`<side>-<align>` grid before Menu consumes it.
