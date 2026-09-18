# Known issues — inner (we fix these here)

Defects and design debts whose fix lands **in this repository**. Problems that belong to someone else
(a browser, a dependency, a tool) live in [ISSUES-OUTER.md](ISSUES-OUTER.md).

**Boundary with the other docs.** [IDEAS.md](IDEAS.md) is what we might _build_; [NOTES.md](NOTES.md) is a
trap we already _absorbed_; [DECISIONS.md](DECISIONS.md) is _why_ something is the way it is. This file is
what is _broken and still open_. When an entry closes it leaves this file — and leaves one line in NOTES.md
if it taught something non-obvious.

**Status vocabulary.** `confirmed` — reproduced, evidence cited · `unconfirmed` — suspected, no repro yet ·
`fixing` — a branch is open · `mitigated` — worked around, root cause open · `accepted` — will not fix, with
the reason · `fixed` — shipped, version noted (delete at the next release).

**Protocol.** Review agents _report_; the orchestrator _records_ here (same rule as NOTES.md, so parallel
agents never edit this file at once). Reviewers should read this file first: a defect already recorded here
must not be re-reported as a new finding.

---

## @oriui/headless — behaviour layer

### ORI-I-01 — The swap contract is typed as opaque prop bags, but consumers depend on specific keys inside them

`confirmed` · severity `blocker-for-1.0` · rebuttal `downgraded` · source: paired review 2026-09-18 (headless/opaque-prop-bags-hide-the-real-contract)

- **Where:** packages/headless/src/vue/contract.ts:11-18,42-51,70-90,105-118; packages/vue/src/components/menu/ori-menu.vue:37,47; packages/vue/src/components/combobox/ori-combobox.vue:120,122
- **What:** The swap tests spread the native adapter, so they prove the injection seam routes but never that the _published_ contract is sufficient to drive OriMenu/OriCombobox. Separately, three unchecked `as string` casts (ori-combobox.vue:120,122; ori-menu.vue:37) encode an assumption about bag contents that lives only in prose.
- **Fix:** Do the test, skip the type surgery. Write ONE from-scratch fake menu adapter that implements MenuControl without touching nativeMenu, mount OriMenu on it, and assert focus-return and roving still work; whatever the fake must invent to pass is the real contract, and it belongs in the MenuControl JSDoc as an explicit 'an adapter MUST emit `id` on triggerProps and `data-highlighted` on the highlighted item bag' clause.…

### ORI-I-02 — Vue's `useDisclosure` accepts a reactive getter it never re-reads; `disabled` can never change

`confirmed` · severity `should-fix` · rebuttal `downgraded` · source: paired review 2026-09-18 (headless/vue-usedisclosure-fake-reactivity)

- **Where:** packages/headless/src/vue/use-disclosure.ts:10; packages/headless/src/vue/native.ts:20-28; packages/headless/src/core/disclosure/disclosure.types.ts:6; docs/content/headless/use-disclosure.md:23,28
- **What:** One docs sentence overstates: docs/content/headless/use-disclosure.md:23 says 'or a getter returning one, to keep it reactive' above a table whose `disabled` row (:28) reads as live behaviour. Options are init-only for this primitive in all three adapters.
- **Fix:** Fix the sentence, not the signature: 'Options seed the primitive and are read once; the getter form is accepted for call-site uniformity with the other composables.' Keep MaybeRefOrGetter. If live `disabled` is ever actually wanted, SET_DISABLED + a watch in the three native adapters is a purely additive minor at any time — it does not need to happen before 1.0.

### ORI-I-03 — Svelte `useTheme` tears the controller down when the last store subscriber leaves, permanently breaking `auto`

`confirmed` · severity `should-fix` · rebuttal `upheld` · source: paired review 2026-09-18 (headless/svelte-usetheme-destroys-on-last-unsubscribe)

- **Where:** packages/headless/src/svelte/use-theme.ts:37-43; packages/headless/src/core/theme.ts:169-177
- **What:** `useTheme` ties the controller's lifetime to Svelte's store subscriber count, not to the component's lifetime. A subscriber count that drops to 0 and back to 1 — an ordinary `{#if}` around markup that reads `$theme` — calls `controller.destroy()` and then re-subscribes to a controller whose `matchMedia` listener is gone, so `auto` silently stops following the OS scheme for the rest of the component's life.
- **Fix:** Their safeOnDestroy fix is right but incomplete: safeOnDestroy is a no-op when useTheme is called outside component init (module scope), which is exactly the case the current design was covering, so that path would leak the matchMedia listener forever. Ship both halves: (1) create the controller once per call and tear it down via safeOnDestroy, leaving the readable's stop() to only unsubscribe; (2) document that a…

### ORI-I-04 — Five different "how do I pass options" idioms are about to be frozen into one package

`confirmed` · severity `should-fix` · rebuttal `downgraded` · source: paired review 2026-09-18 (headless/five-reactive-option-idioms)

- **Where:** packages/headless/src/vue/use-combobox.ts:14; packages/headless/src/vue/use-tabs.ts:40; packages/headless/src/vue/use-color-picker.ts:52; packages/headless/src/vue/use-dismissable.ts:27;…
- **What:** Two signatures are genuinely inconsistent, not eight: UseToolbarToggleGroupOptions mixes both styles inside one interface (vue/use-toolbar.ts:157-159 — `type` is MaybeRefOrGetter, `value` a bare getter), and Svelte's pair disagrees with itself (svelte/use-toolbar.ts:67 useToolbar takes MaybeReactive, :185 useToolbarToggleGroup takes a plain object). And the rule behind the two families is written down nowhere, which…
- **Fix:** Align the two toolbar toggle-group signatures with their own root (~2 signatures, contained to the toolbar family), and add one paragraph to docs/content/headless/core.md stating the rule: 'options that SEED a primitive accept a value, a ref/store or a getter; options that are re-read live require the reactive form.' That makes the surface self-explanatory at a fraction of the churn, and it is the thing a senior…

### ORI-I-05 — `core/mergeProps` is unused, untested, and collides by name with Vue's — while being documented as core toolkit

`confirmed` · severity `should-fix` · rebuttal `downgraded` · source: paired review 2026-09-18 (headless/dead-colliding-mergeprops)

- **Where:** packages/headless/src/core/merge-props.ts:25-47; packages/headless/src/core/index.ts:16; docs/content/headless/core.md:67; packages/vue/src/components/combobox/ori-combobox.vue:2
- **What:** Not dead code; an untested, under-documented export whose `class` branch assumes string values and whose docs row (docs/content/headless/core.md:67) does not tell a Vue reader to use Vue's own instead.
- **Fix:** Keep it, and spend three lines instead of a deletion: add 'Vue users should use Vue's own mergeProps; `class` values must be strings' to the core.md row and the JSDoc, and add one unit test covering handler chaining, class concat and style merge. That closes the honest half of the finding without removing the helper the non-Vue story needs.

### ORI-I-06 — React `useToast` hands back new function identities on every render for a module-level singleton

`confirmed` · severity `should-fix` · rebuttal `upheld` · source: paired review 2026-09-18 (headless/react-usetoast-unstable-action-identities)

- **Where:** packages/headless/src/react/use-toast.ts:40-47; packages/headless/src/core/toast/queue.ts:115-125
- **What:** `useToast()` calls `createToastActions(queue)` inside the hook body, so `toast` / `success` / `dismiss` / `clear` are fresh closures on every render even though the queue they close over is a module-level singleton that never changes. That is the standard React footgun: `useEffect(() => { toast('saved') }, [toast])` re-fires forever, and any memoised child taking `toast` as a prop re-renders on every parent render.
- **Fix:** Exactly their fix — hoist `const actions = createToastActions(queue)` to module scope beside the queue and return `{ toasts, ...actions }` — plus their identity assertion. While there, check the Svelte twin for the same shape, since it shares the createToastActions factory.

### ORI-I-07 — The three adapters' option interfaces are copy-pasted, with nothing pinning them together

`confirmed` · severity `should-fix` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (headless, missed-by-skeptic)

- **Where:** packages/headless/src/vue/contract.ts:4-8,26-33,55-67,94-102; packages/headless/src/react/contract.ts:7-10,30-36,59-70,98-105; packages/headless/src/svelte/contract.ts:10-13,32-38,61-72,100-107
- **What:** UseDisclosureOptions / UseDialogOptions / UseComboboxOptions / UseMenuOptions are declared three times, once per adapter, with identical members that are entirely framework-neutral (strings, booleans, ComboboxItem[], plain callbacks). Only the CONTROL shapes legitimately differ per framework (ComputedRef vs Readable vs plain). Today the copies agree — I diffed them member for member. Nothing enforces that tomorrow:…
- **Fix:** Hoist the four option interfaces into core (they import nothing framework-specific) and have each contract.ts re-export them: `export type { UseComboboxOptions } from '../core'`. One shared declaration, three re-exports, zero runtime change, and parity becomes a compile error instead of a review item. Do it before the freeze — afterwards, fixing a drift means adding an option to two adapters as a minor and…

### ORI-I-08 — Every item prop-getter freezes a redundant `index` the connect already has, and a wrong one silently mis-aims aria-activedescendant

`confirmed` · severity `should-fix` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (headless, missed-by-skeptic)

- **Where:** packages/headless/src/core/combobox/combobox.connect.ts:29,42,51-53,204-206; packages/headless/src/core/menu/menu.connect.ts (getItemProps); docs/content/headless/use-combobox.md:72
- **What:** connect() already receives the full visible collection (combobox.connect.ts:42) and computes highlightedIndex from it itself (`collection.findIndex`, :52), yet getOptionProps(item, index) makes the CALLER re-supply that same index, and the option's DOM id is built from the caller's number (`optionId(index)`, :29 and :204). The two must agree or the input's aria-activedescendant points at an id no element carries — a…
- **Fix:** Drop the parameter: derive `const index = collection.findIndex(i => i.value === item.value)` inside getOptionProps / getItemProps and key the option id off that (or off the item's value, scoped by the anatomy). Misuse stops being expressible, three docs examples get shorter, and the item bag is what a senior reader expects — `getOptionProps(item)`. Cheapest now: after 1.0 the Control interfaces in three contract.ts…

### ORI-I-09 — React's compound-event map is a hand-maintained allowlist whose failure mode is silence, with no test holding it to the core

`confirmed` · severity `should-fix` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (headless, missed-by-skeptic)

- **Where:** packages/headless/src/react/normalize-props.ts:23-42,47-61; packages/headless/src/core/combobox/combobox.connect.ts:213-218; packages/headless/src/core/menu/menu.connect.ts:171
- **What:** The React normalizer renames compound handlers through a literal map and passes everything else through, and its own comment states the consequence: an unmapped onXxx 'would pass through mis-cased and React would drop it silently' (normalize-props.ts:26-29). I checked today's core against it — the connects emit only onClick, onKeydown and onPointermove, all covered, so nothing is broken right now. That is the point:…
- **Fix:** Ten lines of test, no design change: build each widget's api (disclosure / combobox / menu connect with a pass-through normalizer), walk every prop bag plus the item getters, and assert every key matching /^on[A-Z]/ is either single-word or present in eventMap. The invisible coupling becomes a red CI the day someone adds onFocusout, which is the only time it matters.

## @oriui/vue — styled components

### ORI-I-10 — A toggle button has two incompatible models: OriButton's `active` is a look with no accessible state, OriToolbarButton's `pressed` is state with no look outside a toolbar

`confirmed` · severity `blocker-for-1.0` · rebuttal `downgraded` · source: paired review 2026-09-18 (vue/button-toggle-two-vocabularies)

- **Where:** packages/vue/src/components/button/ori-button.vue:14,50; packages/vue/src/components/toolbar/ori-toolbar-button.vue:36,73; packages/css/src/themes/_themes-variant.css:57,68,79,90,101; packages/css/src/components/toolbar.css:74,80;…
- **What:** One doc line is wrong and one look is over-scoped. accessibility.md:18 lists "`aria-pressed` / `data-active` for toggles" as if they were interchangeable a11y mechanisms; they are a state and a look. And the good pressed fill (tint + inset hairline) is scoped to `.ori-toolbar`, so a standalone toggle built on OriButton has no dedicated persistent-pressed appearance. Neither is frozen.
- **Fix:** Before 1.0, fix one sentence: accessibility.md:18 should read "`aria-pressed` for toggle state; `data-active` is a forced `:active` look, not an AT mechanism" — and the same distinction belongs in DECISIONS.md, since this is the second reviewer to misread it. After 1.0, whenever a standalone toggle is actually wanted: add `pressed?: boolean` with the `= undefined` coercion opt-out (ori-toolbar-button.vue:21-24) and…

### ORI-I-11 — `OriCard.image` is a declared prop that renders nothing, and 1.0 turns it into a compatibility promise

`fixed` · severity `blocker-for-1.0` · rebuttal `upheld` · source: paired review 2026-09-18 (vue/card-image-noop-prop)

- **Where:** packages/vue/src/components/card/ori-card.vue:16; docs/content/components/card.md:455; DECISIONS.md "Dropped silent no-op props (Avatar `shadow`, Card `icon`)"
- **What:** `image` is a silent no-op — declared, typed, documented, and never read by the template or by card.css. Freezing it means removing it later is a major bump, and keeping it means shipping 1.0 with a prop that lies. The DECISIONS entry that grandfathered it justified the exception with "Pre-1.0 alpha, so the removal is a free breaking change" — that rationale expires at the freeze.
- **Fix:** Delete it, don't implement it. Implementing a hero image properly is a design task, not a one-liner: it needs a `.ori-card__image` block with aspect-ratio handling, a defined position in `ori-card_row` mode (card.css:63 `.ori-card.ori-card_row { display: flex }`), and an `alt` story — a prop that renders an `<img>` with no way to set `alt` would trade a harmless no-op for an a11y failure. So delete `image` and its…

### ORI-I-12 — Disabled and selected are expressed as BEM classes in four components; under `<fieldset disabled>` the checkbox/switch/radio render as fully enabled

`confirmed` · severity `should-fix` · rebuttal `downgraded` · source: paired review 2026-09-18 (vue/state-as-class-fieldset-bug)

- **Where:** packages/vue/src/components/checkbox/ori-checkbox.vue:37; packages/vue/src/components/switch/ori-switch.vue:34; packages/vue/src/components/radio/ori-radio-group.vue:75; packages/vue/src/components/combobox/ori-combobox.vue:244;…
- **What:** Two different-sized things. Small: checkbox/switch/radio style disabled only from the prop-driven class, so a fieldset- or attribute-disabled control is inert but not dimmed — cosmetic, additively fixable at any time. Freeze-relevant: combobox.md:88-90 hands CSS-layer consumers `class:ori-combobox__option_selected={$getOptionState(item).selected}` as the documented way to mark selection. That teaches non-Vue…
- **Fix:** Do the cheap correct thing, not the sweep. Change combobox.css:188 to `.ori-combobox__option[aria-selected='true']` and delete the `class:ori-combobox__option_selected` line from the combobox.md:88 example — it is redundant the moment the CSS keys off the attribute the getter already emits. Keep the class binding in the SFC for a cycle so nobody's override breaks. Leave checkbox/switch/radio for a post-1.0 patch…

### ORI-I-13 — A caller's `aria-describedby` is silently deleted by the four text controls, contradicting the documented "everything falls through" promise

`fixed` · severity `should-fix` · rebuttal `upheld` · source: paired review 2026-09-18 (vue/aria-describedby-silently-dropped)

- **Where:** packages/vue/src/components/input/ori-input.vue:91,100; select/ori-select.vue:97,104; textarea/ori-textarea.vue:93,102; combobox/ori-combobox.vue:191,199; docs/content/components/input.md:330,358-360
- **What:** `<OriInput aria-describedby="form-note" />` renders no `aria-describedby` at all. The template binds `v-bind="$attrs"` first and `:aria-describedby="describedBy"` second; when `describedBy` is `undefined`, Vue's `mergeProps` overwrites the caller's value with `undefined` and the attribute is dropped. The docs promise the opposite. The `describedby` prop exists as the workaround but is documented only as a way to add…
- **Fix:** Cheaper than five join-expressions: OriInput's `describedBy` computed (ori-input.vue:68-72) already builds and joins an id list, so add the caller's value to that array — `useAttrs()['aria-describedby']` reads reactively inside a computed — and the template needs no change, because mergeProps then overwrites with a value that already contains the caller's id. Mirror that in select/textarea/combobox. For OriSlider…

### ORI-I-14 — Four collection-item types are unexported, one is documented but missing from the barrel, and `TabItem` collides by name with an incompatible type in @oriui/headless

`confirmed` · severity `should-fix` · rebuttal `downgraded` · source: paired review 2026-09-18 (vue/collection-item-types-unexported)

- **Where:** packages/vue/src/components/tabs/ori-tabs.vue:6-10; packages/headless/src/vue/use-tabs.ts:18-21; radio/ori-radio-group.vue:6-10; select/ori-select.vue:6-10; accordion/ori-accordion.vue:5-9; menu/ori-menu.vue:3,23; menu/index.ts;…
- **What:** Five item shapes are local interfaces where one sibling re-exports its own, and menu.md:319/:337 names a type the styled barrel does not forward. Worth doing before 1.0 because it is free, not because it freezes anything.
- **Fix:** Re-export from each component barrel, mirroring combobox/index.ts:2, rather than hoisting five shapes into types.ts — types.ts is 84 lines of cross-cutting token vocabulary (sizes, colors, variants, placements) and per-component item shapes do not belong in it. For Tabs, write `interface TabItem extends HeadlessTabItem { label: string }` and export that name: the inheritance documents the relationship and makes the…

### ORI-I-15 — Ruling on (b): deferring `useControllable` is defensible (the retrofit is mostly additive), but three per-component policies freeze and cannot be fixed additively

`confirmed` · severity `should-fix` · rebuttal `downgraded` · source: paired review 2026-09-18 (vue/controllability-ruling)

- **Where:** packages/vue/src/components/dialog/ori-dialog.vue:33,44-47,111; tabs/ori-tabs.vue:52-58; combobox/ori-combobox.vue:65,103-114; menu/ori-menu.vue:27,75; slider/ori-slider.vue:11,25-28; color-picker/ori-color-picker.vue:43-44;…
- **What:** The deferral of `useControllable` is sound and the retrofit stays additive. The genuine asymmetry is the one the skeptic listed second and understated: only Dialog has an uncontrolled seed (`defaultOpen`, ori-dialog.vue:28/33/55), so Combobox, Tabs, ToggleGroup and ColorPicker can only be initialised through a bound model. That is a real API-shape inconsistency across the catalog — and a `default*` prop is additive…
- **Fix:** Keep the deferral. Add `:open="m.open.value"` to ori-menu.vue:75 for symmetry with Dialog (one line, do it now because it is free). Document Tabs' reconciliation policy in tabs.md as a contract — do not add a prop to disable it. Leave OriSlider alone until the convergence pass actually happens; converting it in isolation pays the behaviour-change cost without retiring the mechanism split, since Dialog would still be…

### ORI-I-16 — `loading` on a non-button OriButton is guarded only by `pointer-events: none` — the exact failure mode the project's own NOTES.md warns about

`confirmed` · severity `nit` · rebuttal `upheld` · source: paired review 2026-09-18 (vue/button-loading-nonbutton)

- **Where:** packages/vue/src/components/button/ori-button.vue:47,51; packages/css/src/components/button.css:98-100; NOTES.md "Toolbar disabled = aria-disabled + STILL FOCUSABLE"
- **What:** `<OriButton as="a" href="/x" loading>` renders `aria-busy="true"` and nothing else: no `aria-disabled`, no `tabindex="-1"`, and the real `disabled` attribute is deliberately skipped for non-buttons. The only guard is CSS `pointer-events: none`, which does not stop keyboard activation — a focused link still navigates on Enter.
- **Fix:** Reuse the pattern the repo already owns instead of inventing a new one. Add to ori-button.vue the same capture-phase guard as ori-toolbar-button.vue:80-85, active when `(disabled || loading) && as !== 'button'`, and widen the ARIA to match: `:aria-disabled="disabled || (loading && as !== 'button') ? 'true' : undefined"`. Leave `:tabindex` exactly as it is — a loading control should stay focusable and simply refuse…

### ORI-I-17 — `<OriCard disabled>` is mouse-blocked, keyboard-open and silent to assistive tech — a container that only looks disabled

`confirmed` · severity `should-fix` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (vue, missed-by-skeptic)

- **Where:** packages/vue/src/components/card/ori-card.vue:14,17,44,45; packages/css/src/components/card.css:52-59; docs/content/components/card.md:280,429-431
- **What:** `disabled` renders `aria-disabled="true"` on a plain `<div class="ori-card">` with no role, and the only enforcement is `pointer-events: none`. Buttons and links inside the card stay tab-focusable and Enter-activatable, and because `aria-disabled` is not a global ARIA attribute (a role-less `<div>` is `role=generic`, which supports globals only) assistive tech is told nothing — not about the card, and certainly not…
- **Fix:** Use the platform primitive this library's own bar already reaches for. `inert` (Baseline 2024, the same tier as the native `<dialog>`, exclusive `<details>` and anchor positioning oriUI already depends on) blocks pointer AND keyboard AND removes the subtree from the accessibility tree — exactly the semantics the docs claim. Bind `:inert="disabled || undefined"` on ori-card.vue:44 and replace the `pointer-events:…

### ORI-I-18 — The five collection-item shapes disagree on `label` vs `title` and on whether `value` may be a number — five near-identical contracts, all frozen at once

`confirmed` · severity `should-fix` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (vue, missed-by-skeptic)

- **Where:** packages/vue/src/components/accordion/ori-accordion.vue:5-9; tabs/ori-tabs.vue:6-10; radio/ori-radio-group.vue:6-10; select/ori-select.vue:6-10; packages/headless/src/core/menu/menu.types.ts:2-6;…
- **What:** The skeptic argued about whether these types are exported; the more expensive question is that they do not agree. Four spell the display string `label` (TabItem:8, RadioOption:7, SelectOption:7, ComboboxItem:4) and `AccordionItem` spells it `title` (ori-accordion.vue:7) for the identical concept. Four accept `value: string | number` (accordion, tabs, radio, select) and two accept `value: string` only (MenuItem:3,…
- **Fix:** Pick one shape and converge before the freeze: `{ value: string | number; label: string; disabled?: boolean }`, with `label` optional only where a value is a legitimate display fallback (MenuItem, which already falls back at ori-menu.vue:89 `item.label ?? item.value`). Concretely: rename `AccordionItem.title` → `label` (the one breaking rename, and `ori-accordion.vue:7` is its only reader), and widen…

### ORI-I-19 — OriTabs renders panels into a dynamic slot namespace that collides with its own reserved `tab` slot

`confirmed` · severity `nit` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (vue, missed-by-skeptic)

- **Where:** packages/vue/src/components/tabs/ori-tabs.vue:70,75-77
- **What:** Line 70 renders the tab button's label through `<slot name="tab" :tab="tab">`, and line 75 renders each panel through `<slot :name="String(tab.value)" :tab="tab">`. The per-value panel slots share one unnamespaced namespace with the component's reserved named slots, so a tab whose `value` is `"tab"` resolves its panel to the consumer's `#tab` template — the label renderer — and that content renders twice: once in…
- **Fix:** Either namespace the panel slots now — `<slot :name="'panel-' + String(tab.value)">`, a one-character-class change while the API is still free, and arguably clearer to read at the call site — or, if the bare `#<value>` ergonomics are worth keeping, document the reserved names explicitly in tabs.md (`tab`, `default`) and add a DEV-only warn in the SFC when a tab's value matches one, mirroring the dev-time a11y warns…

## @oriui/css — tokens, layers, class API

### ORI-I-20 — Every form block paints the raw `danger` role as body text — 2.4:1 in dark theme, in violation of the project's own role-as-text rule

`fixed` · severity `blocker-for-1.0` · rebuttal `upheld` · source: paired review 2026-09-18 (css/form-error-text-raw-role)

- **Where:** packages/css/src/components/field.css:42,58; input.css:76,144; select.css:76,169; textarea.css:76,145; combobox.css:73,219; contrast guard scope at e2e/text-contrast.spec.ts:33-46
- **What:** `.ori-*__error` and `.ori-*__required` set `color: var(--ori-color-danger)` — the fill-background role, not the AA-safe `--ori-color-danger-text` tone. Because status hues are theme-shared (`_themes-color-tokens.css:84`), the error message fails WCAG AA on every dark surface, and the e2e contrast guard cannot catch it because its probe markup contains no form controls.
- **Fix:** Their nine-line change is correct. Add the part that stops it reopening: the artifact that drifted is the closed list at NOTES.md:197, so (a) swap the nine declarations, (b) add one `<div class="ori-field"><p class="ori-field__error">` row (and one per other form block) to the e2e probe markup at text-contrast.spec.ts:32-48 so the guard covers the axis rather than a hand-listed sample, and (c) extend the NOTES…

### ORI-I-21 — Subtree theming (`.ori-theme_dark` / `.ori-theme_light` on a non-root element) is documented as working but is only half-implemented

`confirmed` · severity `should-fix` · rebuttal `upheld` · source: paired review 2026-09-18 (css/subtree-theme-half-wired)

- **Where:** packages/css/src/themes/_themes-color-tokens.css:130 and 134-145 and 163-168; _themes-elevation.css:8-29; components/link.css:18; docs/content/guides/theming.md:111-118; docs/content/guides/customization.md:330-336
- **What:** The neutral `--ori-color-text` default is declared only in the plain `:root` rule, so its `var()` substitutes to the LIGHT ink and merely inherits into a `.ori-theme_dark` subtree; and `.ori-theme_light` re-declares neither the six role `-text` clamps nor the elevation shadows, so a light region inside a dark page keeps dark-theme text tones. Page-level theming is fine (same element), subtree theming is not — which…
- **Fix:** Do not duplicate ~20 lines into two blocks — that is exactly how this drifted the first time. Split the derived group out of the bare `:root` source-token rule and give it the selector `:root, :root.light, .ori-theme_light` (it holds the six `-text` clamps plus `--ori-color-text`), leave the `*-light` / `*-dark` source tokens in their own `:root` rule, and add the single missing `--ori-color-text:…

### ORI-I-22 — `ori.utilities` contains ten rules that name a component block (`.ori-button`) — the variant vocabulary's interactive half fires for exactly one component

`confirmed` · severity `should-fix` · rebuttal `downgraded` · source: paired review 2026-09-18 (css/variant-states-hardcode-button)

- **Where:** packages/css/src/themes/_themes-variant.css:57-110; compare tag.css:107-111 and link.css:27-42
- **What:** The variant utilities correctly own their interactive tints; the only residue is that a consumer building their own block on the css layer (DECISIONS.md:246-247's stated audience) gets `[data-active]` but cannot opt into hover. That is a missing opt-in hook, not a defect, and adding `:where(.ori-button, [data-ori-interactive])` to the ten selectors later is purely additive — zero freeze cost, so it does not belong…
- **Fix:** Either (a) move the ten `:hover`/`:active` rules into button.css where `.ori-button` lives — honest about who owns them, and the utilities layer goes back to being pure token repointing; or (b) make them generic with an opt-in hook, e.g. `:where(.ori-button, [data-ori-interactive]).ori-variant_fill:hover`, so a consumer's own block can join. (a) is the smaller change and loses nothing today; (b) keeps the variant…

### ORI-I-23 — Three blocks bake literal colours that no theme or skin can reach — the tooltip chip is 1.1:1 against the dark page

`confirmed` · severity `should-fix` · rebuttal `downgraded` · source: paired review 2026-09-18 (css/theme-blind-literal-colors)

- **Where:** packages/css/src/components/tooltip.css:28-29; avatar.css:19; switch.css:72,74
- **What:** One clean rule violation (avatar.css:19 hardcodes `#00000018` where `color-mix(in srgb, currentcolor 10%, transparent)` is the library's own idiom), one measured non-text contrast miss (switch.css:72's white thumb at 2.14:1 on the dark-theme checked track, fixed by reading `var(--ori-color-surface)`), and one cosmetic nit (the tooltip chip does not invert in dark, contradicting its own comment at tooltip.css:23).…
- **Fix:** Avatar: `--ori-color: color-mix(in srgb, currentcolor 10%, transparent)` — one line, auto-inverting, no new token. Tooltip: add a `.ori-theme_dark`/`:root.dark` re-declaration swapping `--ori-tooltip-bg`/`-color` to `neutral-50`/`neutral-900` (keeps the "inverse of the page" intent in both modes; 6 lines). Switch thumb: read `var(--ori-color-surface)` like the slider thumb border already does (slider.css:88). All…

### ORI-I-24 — The two-tier contract leaks: `.ori-card` pins its padding to a raw scale token while reading the alias four lines later

`confirmed` · severity `should-fix` · rebuttal `downgraded` · source: paired review 2026-09-18 (css/raw-scale-token-reads)

- **Where:** packages/css/src/components/card.css:30 vs 67,75,96,106; sizes/_sizes-gap.css:13 vs 23-45; sizes/_sizes-action.css:16-22; toast.css:130-132
- **What:** `.ori-card` is missing the local-token escape hatch every other block uses: its outer padding is a real second dimension and should be `--ori-card-padding: var(--ori-size-gap_xl)` read at :30, matching the `--ori-tooltip-radius` / `--ori-toolbar-gap` idiom, so a consumer can retune the card's padding without moving the whole gap scale. The other two sub-claims are a documented token (gap_xxl) and a documented odd…
- **Fix:** Card: bake `--ori-card-padding: var(--ori-size-gap_xl)` (or read the `--ori-size-gap` alias with a multiplier, matching lines 67/75) so one knob drives the block. Gap: either ship `.ori-size-gap_xxl` + add it to `GapSize`, or delete the orphan token — shipping a public token with no way to select it is the worst of both. Action-space: make the scale monotonic or rename the values to what they are. All three are…

### ORI-I-25 — The alpha slider reads tokens declared in another component's block, and three public token names are un-namespaced

`confirmed` · severity `should-fix` · rebuttal `downgraded` · source: paired review 2026-09-18 (css/colorpicker-slider-token-seam)

- **Where:** packages/css/src/components/slider.css:180-206 vs color-picker.css:22-25; color-picker.css:45,132; packages/vue/src/components/color-picker/ori-color-picker.vue:126,153; docs/content/components/color-picker.md:24
- **What:** Two of the three token names are mis-namespaced and should be renamed before the class table becomes a promise: `--ori-hue` → `--ori-color-picker-hue`, `--ori-ink` → `--ori-color-picker-ink` (two inline styles in ori-color-picker.vue and one doc row). `--ori-checker-1/2` is correctly un-namespaced because two components share it, and correctly declared at block level because its value derives from theme tokens; the…
- **Fix:** Rename to `--ori-color-picker-hue` / `--ori-color-picker-ink` and move the checker pair to a shared, theme-derived declaration the slider owns (e.g. declare `--ori-checker-*` under `.ori-slider` too, or promote them to a `--ori-surface-checker-*` token in `ori.tokens` since two components already need them). Update the SFC's two inline styles and the class table. Renaming is free today and a breaking change once the…

### ORI-I-26 — `.ori-shadow` is a legacy hardcoded utility that breaks the axis naming convention and ignores the elevation tokens it predates

`confirmed` · severity `should-fix` · rebuttal `upheld` · source: paired review 2026-09-18 (css/ori-shadow-off-axis)

- **Where:** packages/css/src/utils/utils.css:1-6; themes/_themes-elevation.css:8-29
- **What:** The only shadow class in the library is a bare `.ori-shadow` with two literal `rgb(0 0 0 / …)` layers — no theme awareness, no value suffix, and no `_sm`/`_md`/`_lg` siblings despite `--ori-shadow-{sm,md,lg,ring}` existing and being theme-aware. It appears in no component and no doc page, so 1.0 would freeze a public class nobody uses and nothing documents.
- **Fix:** Delete the bare class outright rather than keeping it as a deprecated alias — a class with zero uses and zero doc mentions has no compat story to preserve, and carrying the off-axis name into 1.0 permanently is the worse trade. Then frame the replacement by its actual value, which the finding undersells: the win is not tidiness, it is that a consumer building their own block on the css layer (DECISIONS.md:246-247's…

### ORI-I-27 — `.ori-variant`, the legacy paired base class, is still shipped — and it does not no-op, it strips the block's fill

`confirmed` · severity `blocker-for-1.0` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (css, missed-by-skeptic)

- **Where:** packages/css/src/themes/_themes-variant.css:10-15; layers.css:12; button.css:30-31; DECISIONS.md:265-267; docs/content/guides/theming.md:101-103
- **What:** `.ori-variant` sets `--ori-variant-bg-color: transparent` and `--ori-variant-text-color: currentColor` in `@layer ori.utilities`, which is declared last (layers.css:12) and therefore beats every block's baked variant cluster in `ori.components` by layer order, not specificity. So `class="ori-button ori-variant"` — the exact shape the pre-refactor docs taught — silently renders a transparent, black-on-page button. I…
- **Fix:** Delete the `.ori-variant` rule (_themes-variant.css:10-15) and sweep the 7 doc occurrences to the single-class form. Deleting a class that no component emits and no page needs is free today; after 1.0 it is a major-version event for a class whose only effect is to break the element it is applied to. If the owner wants belt-and-braces, keep the selector but drop every declaration from it, so a stale `ori-variant` in…

### ORI-I-28 — 105 `.ori-x.ori-x_y` compound selectors contradict the project's own specificity bar, and specificity is override behaviour consumers will freeze against

`confirmed` · severity `should-fix` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (css, missed-by-skeptic)

- **Where:** packages/css/src/components/*.css (105 matches across 22 files: button 12, avatar 12, input 8, select 8, textarea 8, spinner 8, icon 8, combobox 7, toast 6, tabs 4, surface 4 …); REVIEW.md:64; input.css:40-42
- **What:** REVIEW.md:64 sets the bar — 'Specificity stays flat — `:where()`, no `.a.a_b` stacking' — and the component layer breaks it 105 times. The cause is structural, not sloppy: each block declares its baked token defaults in the same `.ori-input { … }` rule (0,1,0) that carries its layout, so a single-class modifier could never win, and input.css:40-42 says so out loud ('Compound with the block so it beats the baked `md`…
- **Fix:** Split each block in two: `:where(.ori-x) { /* the baked token defaults */ }` at zero specificity and `.ori-x { /* layout */ }` as today. Then every modifier collapses to a single class — `.ori-input_lg`, `.ori-card_fluid` — the modifier vocabulary becomes uniform with the `.ori-size-action_*` utilities it was meant to mirror (DECISIONS.md:261-264), the 105 compounds go to near zero, and a consumer's plain…

### ORI-I-29 — Fifteen `var(--ori-color, …)` fallbacks across seven components are provably dead, and three of them lie about what happens

`confirmed` · severity `should-fix` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (css, missed-by-skeptic)

- **Where:** packages/css/src/components/color-picker.css:130,139,173; slider.css:182,196; accordion.css:59,64,91,100; menu.css:66,76; popover.css:42; tabs.css:77,110,127; _themes-color-tokens.css:121; tooltip.css:23-27
- **What:** `--ori-color: currentColor` is declared unconditionally at `:root` (_themes-color-tokens.css:121), so it is always defined on every element and the fallback arm of `var(--ori-color, X)` can never fire. The library already knows this and paid for the knowledge once: tooltip.css:23-27 explains that the tooltip needed dedicated `--ori-tooltip-bg/-color` tokens precisely because 'those aliases are globally defined…
- **Fix:** Drop the fifteen fallback arms so the code says what it does, and record the constraint where the next author will see it: one short DECISIONS.md entry stating that `--ori-color` / `--ori-color-on` are globally defined, that a `var()` fallback on them is unreachable, and that a component needing its own default must declare a dedicated block-local token — the rule tooltip.css:23-27 already discovered the hard way.…

## Packaging & release

### ORI-I-30 — Nothing in the repo ever imports the packages the way a consumer does — dist + the exports map are built, measured, and never run

`confirmed` · severity `blocker-for-1.0` · rebuttal `downgraded` · source: paired review 2026-09-18 (packaging/dist-never-executed)

- **Where:** vitest.config.js:11-22; docs/nuxt.config.js:118-122; e2e/harness/vite.config.ts:12-20; packages/vue/vite.config.js:15-26; .github/workflows/ci.yml:52-77
- **What:** There is no artifact-level smoke test. Every code path in the repo that says `@oriui/vue` or `@oriui/headless` is aliased to `src/`, so `packages/vue/dist/index.js` and `packages/headless/dist/*/index.js` are produced by CI and then only weighed (size-limit) and statically parsed (publint, attw). No test, no doc page, and no e2e spec ever resolves those packages through their `exports` map or executes the built JS.…
- **Fix:** Keep the smoke job, shrink it: `npm pack --workspaces`, install the three tarballs plus vue into a scratch dir, and run one ESM script that imports `@oriui/vue`, `@oriui/headless`, `/vue`, `/svelte`, `/react` and asserts one export from each. Do not also bolt the tree-shaking gate onto it — that needs a bundler and a second budget file, and it is a separate change. Cheaper still and worth doing first: a 5-line CI…

### ORI-I-31 — release.yml's quality gate is a strict subset of ci.yml's, while its own comment claims parity — attw, size, docs:build and e2e do not gate the publish

`confirmed` · severity `blocker-for-1.0` · rebuttal `downgraded` · source: paired review 2026-09-18 (packaging/release-gate-narrower-than-ci)

- **Where:** .github/workflows/release.yml:16-18, 49-59; .github/workflows/ci.yml:55-97; packages/vue/scripts/fix-dts.mjs:41-53
- **What:** release.yml's inline gate is narrower than ci.yml's, which is a defense-in-depth gap rather than an exposure (the full gate runs on the Version-Packages PR that produces every publish). The exposure is the supply-chain one: two `npx -y` tool trees execute in the OIDC-privileged job.
- **Fix:** Two changes, in this order. (1) Move publint and @arethetypeswrong/cli into root devDependencies installed by `npm ci`, and call them as local binaries in both workflows — this removes the OIDC-job code-execution hole and pins the whole tree via package-lock.json, at zero cost. (2) Instead of hand-syncing two command lists that have already drifted, extract the gate into one reusable workflow…

### ORI-I-32 — `alpha` is frozen at 1.0.0-alpha.3 while `latest` has been serving prereleases for fourteen releases — and both runbooks state the opposite as fact

`fixed` · severity `blocker-for-1.0` · rebuttal `upheld` · source: paired review 2026-09-18 (packaging/dist-tags-wrong-and-docs-say-otherwise)

- **Where:** RELEASING.md:12-14, 56, 74; CONTRIBUTING.md:50-54, 67; node_modules/@changesets/cli/dist/changesets-cli.cjs.js:1002-1008, 1086, 1110
- **What:** RELEASING.md and CONTRIBUTING.md both assert that pre mode publishes to the `alpha` dist-tag automatically. It does not, and cannot, for this repo — changesets deliberately routes to `latest` when every published version of a package is a prerelease. The result, verified live today for all three packages, is `{"alpha": "1.0.0-alpha.3", "latest": "1.0.0-alpha.17"}`. RELEASING.md:74's own smoke test (`npm i…
- **Fix:** Repoint, do not delete: `npm dist-tag add @oriui/{vue,headless,css}@1.0.0-alpha.17 alpha`. The reviewer offers deletion as an equal option — it is not, because removing the tag makes `npm i @oriui/vue@alpha` a hard 404 for anyone who took CONTRIBUTING.md's advice to pin it, which is the one audience the repair exists for. Then fix the three prose passages to say what actually happens, and add `npm dist-tag ls…

### ORI-I-33 — Exact internal pins survive past the reason recorded for them, and the public `Symbol()` injection keys turn a duplicate `@oriui/headless` into a silent no-op

`confirmed` · severity `should-fix` · rebuttal `upheld` · source: paired review 2026-09-18 (packaging/exact-pins-and-module-scope-symbols)

- **Where:** packages/vue/package.json:47-48; CONTRIBUTING.md:50-54; DECISIONS.md:370; packages/headless/src/vue/contract.ts:135; packages/headless/src/vue/use-toolbar.ts:37, 60, 118
- **What:** The exact pins are a recorded decision, but the rationale recorded for them is prerelease-specific and expires at 1.0. CONTRIBUTING.md:51-53 gives the reason as "a `*` range cannot match a prerelease" — true of `1.0.0-alpha.N`, false of `1.0.0`. What remains after the freeze is only the cost: an exact pin defeats npm deduplication, and because the library's public cross-package seams are module-scope `Symbol()`…
- **Fix:** Do both, and say why in one DECISIONS entry: (1) `Symbol.for('ori-headless')` / `Symbol.for('ori-toolbar')` in the Vue and Svelte contracts and toolbars — four one-line edits, invisible to the type surface, makes duplicate copies interoperate; (2) switch the internal ranges to `^1.0.0` at the cutover, because it is the only thing that helps the React adapter, where `createContext` identity cannot be globalised. Also…

### ORI-I-34 — `@oriui/vue` publishes a Node engine floor copied from the build toolchain; the other two packages publish none

`confirmed` · severity `should-fix` · rebuttal `downgraded` · source: paired review 2026-09-18 (packaging/engines-floor-on-vue-only)

- **Where:** packages/vue/package.json:7-9; packages/headless/package.json:1-19; packages/css/package.json:1-21; package.json:8-10; CLAUDE.md (Node section)
- **What:** Cosmetic inconsistency, not an install hazard: three packages of one product answer the engines question three ways, and the one floor that exists is pinned to a build-toolchain patch version rather than a runtime requirement. Either drop it from `@oriui/vue` or relax it to `>=22` and record the choice. Nit.
- **Fix:** Relax `@oriui/vue` to `>=22` (drops the arbitrary `.18`, keeps the honest signal that this is the SSR-executed package), leave `@oriui/css` and `@oriui/headless` without one, and add one line to DECISIONS.md saying the floor tracks Node's supported line and not tsdown's build minimum. This is strictly cheaper than harmonising all three and does not invent a requirement for a CSS file.

### ORI-I-35 — No published tarball contains a LICENSE file, and `@oriui/css` ships 52 unreachable source files under a rationale that does not apply to it

`fixed` · severity `should-fix` · rebuttal `upheld` · source: paired review 2026-09-18 (packaging/tarball-contents-wrong)

- **Where:** packages/css/package.json:15-18, 23-31; packages/vue/package.json:24-27; packages/headless/package.json:13-16; .changeset/ship-sources.md; packages/css/build.mjs:16, 31-37
- **What:** Two independently verified defects in what actually goes into the .tgz. First: all three packages declare `"license": "MIT"` and none of them ships the license text — npm auto-includes a LICENSE file from the package root regardless of `files`, but there is no LICENSE in packages/vue, packages/headless or packages/css, and the root LICENSE is not carried into workspace tarballs. Second: the `ship-sources` decision…
- **Fix:** Do not symlink at pack time (symlinks do not survive `npm pack` portably). Add a real `LICENSE` file to each of the three package directories — npm auto-includes it with no `files` change — and add `"CHANGELOG.md"` to each `files` array in the same commit, since that is the other thing a 1.0 evaluator opens. For css, keep `src`, and edit .changeset/ship-sources.md to state the two distinct reasons honestly:…

### ORI-I-36 — The 1.0 cutover is one buried sentence in RELEASING.md, and the 1.0.0 CHANGELOG will restate all 41 alpha entries verbatim

`fixed` · severity `should-fix` · rebuttal `upheld` · source: paired review 2026-09-18 (packaging/pre-exit-undocumented)

- **Where:** RELEASING.md:58-59; .changeset/pre.json:1-51; package.json:5, 47; packages/vue/CHANGELOG.md:1-60; node_modules/@changesets/assemble-release-plan/dist/changesets-assemble-release-plan.cjs.js:158-170, 603-607
- **What:** The single most consequential release this project will ever perform is documented by half of one sentence, and that sentence offers it as an alternative to a dist-tag command rather than as a procedure. Nothing tells the maintainer that `changeset pre exit` must be committed to main before the Version Packages PR regenerates, that `pre.json` is deleted by `changeset version` rather than by the human, or — the…
- **Fix:** Same numbered procedure, plus two things the reviewer left out. First, run `npx changeset pre exit` on a branch and merge it as its own commit with nothing else in it, so the Version-Packages PR that regenerates is reviewable as pure version arithmetic — confirm it says 1.0.0 and not alpha.18 before merging. Second, do the curation in the Version-Packages PR by hand-editing the generated `## 1.0.0` block down to a…

### ORI-I-37 — The two scripts that mint the published artifacts are outside every lint, format and type gate

`confirmed` · severity `should-fix` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (packaging, missed-by-skeptic)

- **Where:** package.json:44 (lint:ci globs); packages/vue/scripts/fix-dts.mjs:10-12; packages/css/build.mjs:1-6
- **What:** `lint:ci` checks prettier over `**/*.{vue,js,ts,json,md,html,css}` and eslint over `packages/*/src/**/*.{vue,ts}`. Neither glob matches `.mjs`, and nothing type-checks these files. So `packages/vue/scripts/fix-dts.mjs` — which rewrites every shipped `.d.ts` specifier — and `packages/css/build.mjs` — which emits every shipped stylesheet — are the only two files in the pipeline with no static gate at all. The proof is…
- **Fix:** Add `mjs` to the prettier glob in package.json:44 and extend the eslint glob to cover `packages/*/{scripts,*.mjs}`, then run `lint:all` once to absorb the formatting delta. One line of config; it puts the two artifact-producing scripts under the same bar as everything else before their output becomes a compatibility promise.

### ORI-I-38 — All three framework peers on @oriui/headless are optional, so no consumer ever gets a missing-peer warning — and the one-package-three-adapters shape is what freezes at 1.0

`confirmed` · severity `should-fix` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (packaging, missed-by-skeptic)

- **Where:** packages/headless/package.json:47-62; DECISIONS.md:654-660 and :652
- **What:** `peerDependencies` declares react, svelte and vue, and `peerDependenciesMeta` marks all three optional. That is the standard escape from mutually-exclusive framework peers, but it means the warning channel is switched off for everyone: someone installing `@oriui/headless` and importing `/vue` without vue present gets no install signal at all, only a downstream resolution error. More significant for the freeze:…
- **Fix:** Do not split — the optional-peer technique genuinely solved the problem the 2024 decision was worried about, and the dist proves the isolation is real (I checked: dist/vue/index.js imports only `vue`, dist/svelte/index.js only `svelte`, dist/react/index.js only `react`, dist/core/index.js nothing). Instead rewrite the DECISIONS.md:654-660 entry to say so explicitly and mark the separate-packages rationale…

### ORI-I-39 — dist is gitignored and no package has a prepack hook, so the documented manual publish path can ship an empty package

`confirmed` · severity `nit` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (packaging, missed-by-skeptic)

- **Where:** .gitignore (dist); package.json:48 (release script); RELEASING.md:61-66; packages/*/package.json (no prepack/prepublishOnly)
- **What:** `dist` is gitignored and untracked (`git ls-files packages/vue/dist` is empty), `files` is `["dist","src"]`, and I grepped all four package.json files for `prepack` and `prepublishOnly` — there are none. The only thing that puts a build inside the publish is the root script at package.json:48, `npm run build && changeset publish`. CI always goes through it, so this has never bitten. But RELEASING.md:61-66 documents…
- **Fix:** Add `"prepack": "npm run build"` to each of the three package.json files. npm runs prepack for both `npm pack` and `npm publish`, so the build becomes structurally unskippable regardless of which command anyone types, the root `release` script keeps working unchanged, and the manual fallback in RELEASING.md stops being a foot-gun without needing a warning paragraph.

## Consumer-facing gaps (found via justpaint)

### ORI-I-40 — À-la-carte `@oriui/css/components/*.css` has no completeness guard — the only real consumer already ships two components unstyled

`confirmed` · severity `blocker-for-1.0` · rebuttal `downgraded` · source: paired review 2026-09-18 (consumer/alacarte-css-no-completeness-guard)

- **Where:** justpaint apps/web/src/main.ts:3-24; justpaint views/LeaderboardView.vue:91-99,116; views/PlayView.vue:840; components/game/JudgingOverlay.vue:26,30; oriUI packages/css/package.json (exports "./components/*.css");…
- **What:** justpaint ships OriBadge and OriSkeleton unstyled because its hand-maintained à-la-carte list in main.ts:6-24 is missing badge.css and skeleton.css — an app bug, one line to fix. The oriUI-side residue is documentation, not packaging: grep of docs/content for 'oriui/css/components' returns ZERO hits, so the à-la-carte path exists only in packages/css/README.md:35-55 and is invisible on the docs site where a consumer…
- **Fix:** Fix justpaint's main.ts. In oriUI, do the free half: add the à-la-carte import line to each component docs page (the class table is already there) and a line to overview/get-started saying the full bundle is the default for styled Vue consumers. If a machine check is still wanted later, `@oriui/css/manifest.json` (component → required files) is additive and can ship in any 1.x — it does not need to precede the…

### ORI-I-41 — `OriButton active` announces nothing and paints the same pixels as hover — the toggle contract is incomplete in both dimensions

`confirmed` · severity `blocker-for-1.0` · rebuttal `downgraded` · source: paired review 2026-09-18 (consumer/button-active-no-pressed-affordance)

- **Where:** oriUI packages/vue/src/components/button/ori-button.vue:14,50; packages/css/src/themes/_themes-variant.css:57-110; packages/css/src/components/toolbar.css:75-76; docs/content/components/button.md:223,328; justpaint…
- **What:** oriUI has exactly one correct pressed treatment — toolbar.css:74-77 keyed on `[aria-pressed='true']` — and it is gated behind a `.ori-toolbar` ancestor, so a correctly-authored toggle button anywhere else (justpaint IconButton.vue:53,56, which sets both `active` and `aria-pressed`) renders only the `data-active` look, which is byte-identical to `:hover`. Secondarily, `:active` == `:hover` in all five variants, so…
- **Fix:** One selector edit instead of the skeptic's two-part change: ungate toolbar.css:74-77 to `.ori-button[aria-pressed='true']` (keeping the literal `background-color`, whose layer rationale is documented in place at toolbar.css:66-73). That makes `aria-pressed` the one styled toggle idiom across the catalog, works for any consumer that already wires it, and touches no public API. Then give `[data-active]`/`:active` its…

### ORI-I-42 — `@oriui/vue` pins its two siblings as exact `dependencies` — a coupling it cannot enforce and that silently duplicates the headless singleton

`confirmed` · severity `blocker-for-1.0` · rebuttal `upheld` · source: paired review 2026-09-18 (consumer/exact-pin-deps-not-peers)

- **Where:** oriUI packages/vue/package.json ("dependencies": {"@oriui/css": "1.0.0-alpha.17", "@oriui/headless": "1.0.0-alpha.17"}, "sideEffects": false); packages/headless/src/vue/use-toast.ts:6-10; justpaint apps/web/package.json (all three pinned…
- **What:** `@oriui/vue` declares exact-version `dependencies` on `@oriui/css` and `@oriui/headless`, but it never imports `@oriui/css`, and the app imports both siblings directly. So the pin cannot enforce the CSS/component version match it appears to guarantee, and on any partial upgrade npm nests a second copy — giving new components on old CSS, plus a duplicated module graph around a documented module-level singleton. This…
- **Fix:** Do not treat the two the same — they are different relationships, and collapsing them is why the skeptic's version reads as boilerplate. `@oriui/headless` is a genuine runtime import AND holds process-wide singletons (contract.ts:135, use-toolbar.ts:37,153, vue/use-toast.ts:10) → move it to `peerDependencies` (plus `devDependencies` for the repo build) with `"^1.0.0"` post-freeze; npm 7+ auto-installs it so `npm i…

### ORI-I-43 — There is no neutral/structural colour token, so the library hardcodes ~40 ad-hoc `color-mix` percentages and the consumer squatted `--ori-color-outline` in oriUI's namespace

`confirmed` · severity `blocker-for-1.0` · rebuttal `downgraded` · source: paired review 2026-09-18 (consumer/no-neutral-structural-token)

- **Where:** oriUI packages/css/src/themes/_themes-color-tokens.css:52-131; packages/css/src/components/surface.css:26, divider.css:16, input.css:12,37, accordion.css:25,30, menu.css:31, popover.css:31, checkbox.css:59, radio.css:80, kbd.css:22,26,…
- **What:** oriUI derives its neutral structure two different ways for the same job: `var(--ori-color-on-surface) 12%` at surface.css:26 versus `currentcolor 12%` at menu.css:31 and popover.css:31, which diverge inside a `.ori-color_*` region (a red hairline on a danger-coloured panel vs a neutral one). Pick one mechanism. The percentage spread is mostly deliberate WCAG duty, not disagreement, except 12 vs 14 and 20 vs 25.…
- **Fix:** Normalise the mechanism (one of `currentcolor` or `--ori-color-on-surface`, stated once in NOTES.md) and collapse 12/14 and 20/25 to single values. If a retunable handle is wanted later, add it as an opt-in default — `color-mix(in srgb, currentcolor var(--ori-outline-strength, 12%), transparent)` — which keeps the adaptive derivation, gives a consumer one knob, and ships in any 1.x without a name collision.

### ORI-I-44 — `OriPopover`'s `role?: string` leaks into the trigger slot as an untyped `aria-haspopup`, forcing consumers to cast away the slot's types

`confirmed` · severity `should-fix` · rebuttal `upheld` · source: paired review 2026-09-18 (consumer/popover-role-untyped)

- **Where:** oriUI packages/vue/src/components/popover/ori-popover.vue:21-25,34-39,43; justpaint components/FloatingToolbar.vue:203-208
- **What:** `role` is typed as unconstrained `string`, so the `triggerProps` bag infers `'aria-haspopup': string`. Vue's `ButtonHTMLAttributes` types that attribute as a literal union, so `v-bind` of the bag does not type-check on a `<button>` — the documented, intended usage. The only real consumer works around it with `as Record<string, unknown>`, which discards type-checking on the whole bag.
- **Fix:** The skeptic's fix is wrong in kind. Narrowing `role` to the `aria-haspopup` union would FORBID legitimate panel roles — a popover holding `role="group"`, `role="region"` or no role at all is valid markup — because the panel's role and the trigger's `aria-haspopup` vocabulary are simply not the same set. The defect is the conflation at ori-popover.vue:36, not the width of the type. Keep `role?: string` for the panel…

### ORI-I-45 — `--ori-size-action` follows a third, undocumented scoping rule — the alias is re-baked twice on the element, so a wrapper repoint is a silent no-op

`confirmed` · severity `should-fix` · rebuttal `downgraded` · source: paired review 2026-09-18 (consumer/action-size-third-scoping-rule)

- **Where:** oriUI packages/css/src/sizes/_sizes-action.css:14; packages/css/src/components/button.css:20,146-148; docs/content/guides/customization.md:289-329; docs/content/guides/design-tokens.md:244; justpaint components/FloatingToolbar.vue:505-515
- **What:** customization.md:325 NAMES only "Radius and font-size" for a rule that equally governs the action-size family, and design-tokens.md:243-244 presents the `:root` default `--ori-size-action: var(--ori-size-action_text)` (packages/css/src/sizes/_sizes-action.css:14) as if a component read it, when no action component ever does — every block bakes over it (button.css:20). Cost: justpaint reached for `.bar__tool-wrap…
- **Fix:** Edit two sentences, change no CSS. In customization.md §5, rename the heading to "Size, radius and font-size" and add `--ori-size-action_<step>` to the raw-step example — with the caveat the skeptic omitted, that a wrapper repoint also retunes every other md action control in the subtree (inputs, selects), which is what you want for a tool cluster and wrong for a mixed panel. In design-tokens.md:243-244, say the…

### ORI-I-46 — OriTooltip renders an `aria-describedby` it documents as non-functional, and the only consumer never wires the working path

`confirmed` · severity `should-fix` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (consumer, missed-by-skeptic)

- **Where:** oriUI packages/vue/src/components/tooltip/ori-tooltip.vue:41-46; packages/vue/src/components/toolbar/ori-toolbar-toggle-item.vue:50 (`describedBy`); justpaint apps/web/src/components/ui/IconButton.vue:47-60
- **What:** ori-tooltip.vue:41 puts `:aria-describedby="bubbleId"` on `<span class="ori-tooltip__trigger">`, and the comment immediately below at :42-44 states why that cannot work: "aria-describedby only announces when the element bearing it is focused, and this wrapper span isn't focusable". So every OriTooltip ships a dead attribute in the DOM, and the relationship that actually announces is opt-in — the consumer must pull…
- **Fix:** Stop rendering the attribute where it cannot fire. Either drop `:aria-describedby` from the wrapper span (ori-tooltip.vue:41) and make the slot prop the single documented path, or — better — resolve it on mount: query the first focusable descendant of `.ori-tooltip__trigger` and set `aria-describedby` on it, falling back to the slot prop for full control. Do it before 1.0 because the `#default` slot's prop name…

### ORI-I-47 — 13 of the 20 types `@oriui/vue` exports are used by zero components, and the frozen ones are built with interface-then-`keyof` ceremony where a union would say it

`confirmed` · severity `should-fix` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (consumer, missed-by-skeptic)

- **Where:** oriUI packages/vue/src/types.ts:3-42,44-56,60-75,83-84; packages/vue/src/index.ts:1 (`export * from './types'`); justpaint apps/web/src/components/ui/IconButton.vue:18
- **What:** `packages/vue/src/index.ts:1` re-exports the whole of types.ts, so all 20 exported names become public API at 1.0. Grepping packages/vue/src (excluding types.ts itself) for each one by word: `Sizes` 0, `BlockSize` 0, `ScreenSize` 0, `ActionSpaceSize` 0, `Size` 0, `CenterPosition` 0, `InlinePosition` 0, `BlockPosition` 0, `CustomPosition` 0, `Position` 0, `AnchoredSide` 0, `SeverityColor` 0, `DeepPartial` 0 —…
- **Fix:** Before the freeze, delete the 13 unreferenced exports (or, if any is wanted for consumer convenience, keep it deliberately and say so in the doc comment), and flatten the six size interfaces into plain string-literal unions — `ActionSize`, `RadiusSize`, `BlockSize` etc. read the same to a consumer and stop pretending to model a record. Cost now: one file, one type-check run, zero runtime. Cost after 1.0: removing…

### ORI-I-48 — `useToolbarToggleGroup` with `type: 'single'` is unconditionally deselectable, so a tool picker that must always have a selection is impossible — the only consumer guards it by hand

`confirmed` · severity `should-fix` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (consumer, missed-by-skeptic)

- **Where:** oriUI packages/headless/src/vue/use-toolbar.ts:155-191 (options + `toggle`); justpaint apps/web/src/components/FloatingToolbar.vue:76-82, 110-113
- **What:** use-toolbar.ts:184 is `options.onChange(current === value ? undefined : value)` — clicking the pressed item in a single-select group always clears it, with no option to require a selection. `UseToolbarToggleGroupOptions` (use-toolbar.ts:155-162) exposes only `type`, `value` and `onChange`; the JSDoc at :156 states the intent ("'single' keeps one value (deselectable, like Radix)"), but a toolbar tool palette — the…
- **Fix:** Add `deselectable?: MaybeRefOrGetter<boolean>` (default `true`, preserving today's behaviour exactly) to `UseToolbarToggleGroupOptions` and gate use-toolbar.ts:184 on it, then surface it as a prop on `OriToolbarToggleGroup`. It is additive and therefore shippable in any 1.x — but the DEFAULT is what freezes, and `true` is the wrong default for the flagship use case: once 1.0 publishes, flipping it (or making…

## Docs generation & the CLI idea

### ORI-I-49 — The command the whole idea is named after cannot be published — the project already took a 403 on `oriui`

`confirmed` · severity `blocker-for-1.0` · rebuttal `downgraded` · source: paired review 2026-09-18 (cli/npx-oriui-name-is-blocked)

- **Where:** IDEAS.md:232,236,240 vs DECISIONS.md:351-360; .changeset/config.json:5
- **What:** Three command strings in a parking-lot entry use an invocation form the npm registry will not serve (`npx oriui …`); the reachable published form is `npx @oriui/cli …`. Worth a one-line footnote cross-referencing DECISIONS.md:352 so the 403 is not rediscovered later. Nit, not a blocker; the lockstep argument should be dropped entirely.
- **Fix:** Correct the entry: the reachable forms are `npx @oriui/cli …` (published, joins or breaks the lockstep group) or an in-repo `node scripts/…` (neither). Cost of the correction: one edit. Cost of not making it: the idea gets picked up later and the name problem is discovered after the design is committed, since the 403 is recorded 120 lines away in a different file.

### ORI-I-50 — The shadcn copy-in model is architecturally incompatible with oriUI's own CSS extraction

`confirmed` · severity `blocker-for-1.0` · rebuttal `upheld` · source: paired review 2026-09-18 (cli/copy-in-registry-incompatible-with-layer-split)

- **Where:** packages/vue/src/components/dialog/ori-dialog.vue:1-3 (128 lines, no `<style>`); packages/css/src/components/dialog.css:1; packages/css/src/layers.css:12; DECISIONS.md:330-349
- **What:** shadcn's registry works because a copied file is self-contained — the Tailwind classes travel inside it. oriUI deliberately made the opposite choice: DECISIONS.md:330 moved every component's CSS out of the SFC into `@oriui/css`. So `oriui add dialog` cannot produce a self-contained artefact. It produces a fork that still depends on two of the three packages, which is strictly worse than the import it replaces.
- **Fix:** Do not delete the shape — record why it is closed, in one sentence, with the citation: the SFC deliberately carries no styles (DECISIONS.md:330), so `add` cannot produce a self-contained file the way shadcn's Tailwind-inline components can. Then note the honest substitute that already exists and costs nothing: `@oriui/css` already exports `./components/*.css` per component (packages/css/package.json:29) and the…

### ORI-I-51 — "Get the code in your own tree" already ships in the npm tarball

`confirmed` · severity `should-fix` · rebuttal `downgraded` · source: paired review 2026-09-18 (cli/registry-value-already-shipped-via-files-src)

- **Where:** packages/vue/package.json:24-27; packages/css/package.json:15-18; packages/headless/package.json:13-16; .changeset/ship-sources.md
- **What:** A crude copy-out path exists (the published `src` tree in `node_modules`, explicitly inert and wiped by `npm ci`), which lowers the marginal value of a registry `add` command. It does not eliminate it, and it is not a documented consumer story.
- **Fix:** Record this in the IDEAS entry as the reason shape 1 is closed, not merely weighed. The honest framing is: oriUI already has a copy-out story (it costs one `cp` and is documented nowhere), and the cheap improvement — if anyone ever asks — is a docs paragraph titled "forking a component", not a second publish pipeline.

### ORI-I-52 — The "queryable agent surface" already ships — `/raw/**.md` is generated for every page and the project hasn't noticed

`confirmed` · severity `should-fix` · rebuttal `upheld` · source: paired review 2026-09-18 (cli/raw-md-agent-surface-already-ships)

- **Where:** node_modules/@nuxt/content/dist/features/llms/module.js:11-14; docs/.output/public/raw/components/button.md (16 KB, generated 2026-09-18 12:45); docs/.output/public/llms.txt:103; IDEAS.md:244-247
- **What:** Shape 3's distinguishing promise over the static files — "a CLI makes it queryable" (IDEAS.md:247) — is already true today via plain HTTP. `@nuxt/content` auto-mounts a per-page raw-markdown endpoint, the static build emits one `.md` per page, and llms.txt already links them absolutely with descriptions. An agent that wants only the Button contract issues one GET for ~16 KB. It needs no binary, no MCP server, and no…
- **Fix:** Same conclusion, cheaper execution. `llms-full.txt` is already generated at build time and already contains exactly the per-component payload (props table, class table, a11y section). Rather than adding a `docs` copy step, emit the per-page markdown into the tarball from the artefact that already exists, and — the part their fix misses — make `/raw/` an explicit, recorded decision: an `llms` config opt-in plus a…

### ORI-I-53 — The shipped agent surface is duplicated and entity-mangled — fix it before building a second one

`confirmed` · severity `should-fix` · rebuttal `upheld` · source: paired review 2026-09-18 (cli/existing-llms-surface-is-broken-and-duplicated)

- **Where:** docs/nuxt.config.js:29-116 (the hand-authored `sections`, components list at :58-95); docs/.output/public/llms.txt:39 vs :103; docs/.output/public/llms-full.txt
- **What:** The artefact IDEAS.md:246 calls "the static prototype of exactly this" is materially defective in three ways, all cheap to fix and none of them fixed. Building a queryable CLI on top of a generator you have not yet debugged routes around the bug instead of fixing it — and adds a third hand-maintained copy to a set that already cannot keep two in sync.
- **Fix:** Their fix is right and I would add one thing they missed: deleting the hand-authored `sections` block does double duty. It removes the duplication _and_ eliminates one of the five per-component registries from their own finding 7 — the two findings share a single edit, which changes the cost/benefit of the scaffolder they went on to recommend. On the entities: `&#x2A;`/`&#x29;` is an MDC-to-markdown serialization…

### ORI-I-54 — "tests/tokens.contrast.test.ts is already that engine" is not true — it is a hardcoded vitest file

`confirmed` · severity `should-fix` · rebuttal `downgraded` · source: paired review 2026-09-18 (cli/contrast-test-is-not-an-engine)

- **Where:** IDEAS.md:241 vs tests/tokens.contrast.test.ts:23-25, :45-58, :64-67
- **What:** A four-word accuracy fix: 'is already that engine' should read 'is the prototype of that check'. The reusable-module cost is real but only materialises if shape 2 is ever built.
- **Fix:** Either strike the claim or state the real cost: extracting a `checkSkinContrast(css)` into a published package means a real CSS parser (postcss is already a dependency of the css build), a test suite of its own, and — the freeze-relevant part — a _public input format_ for consumer skin files, frozen at 1.0. That is a package, not a weekend. If contrast-checking a custom skin is the actual user need, the cheapest…

### ORI-I-55 — The conventions a scaffolder would encode are inconsistent in the repo right now — and the real pain is five registries, not the file template

`confirmed` · severity `should-fix` · rebuttal `downgraded` · source: paired review 2026-09-18 (cli/scaffolder-would-freeze-conventions-the-repo-contradicts)

- **Where:** REVIEW.md:67 and :84 vs CLAUDE.md "no `<style>` block"; packages/vue/src/components/index.ts; packages/css/src/styles.css:14-48; docs/app/plugins/oriui.ts:44; docs/app/layouts/default.vue:49-63; docs/nuxt.config.js:58-95
- **What:** REVIEW.md:67 is stale and REVIEW.md:84 undercounts the docs registries — both real, both cheap. The 'five hand-edited registries' pain is actually one silent list once existing CI gates and finding 5's own edit are accounted for, which is not enough to justify a scaffolder in any form, in-repo or published.
- **Fix:** Drop the scaffolder entirely and do three edits instead. (1) Fix REVIEW.md:67 to reference `packages/css/src/components/<name>.css` rather than a `<style>` block, and extend :84 to name the docs plugin, the sidebar and the content page. (2) Delete the hand-authored `sections` block in docs/nuxt.config.js (finding 5's edit, which removes a registry as a side effect). (3) Add `tests/docs.parity.test.ts` in the exact…

### ORI-I-56 — The "one consumer" premise is weaker than the entry states, and the ⭐ tag contradicts the legend

`confirmed` · severity `should-fix` · rebuttal `downgraded` · source: paired review 2026-09-18 (cli/premise-check-the-one-consumer-is-four-releases-behind)

- **Where:** IDEAS.md:9, :39, :232, :249-251; C:/Users/markg/WebstormProjects/justpaint/apps/web/package.json:21-23
- **What:** The ⭐ on IDEAS.md:232 asserts a priority the entry's own closing paragraph refuses to assert; demote it to 🧪 until IDEAS.md:39 (the real composed screen) produces evidence. The version-lag observation should be dropped — it does not support the conclusion it is attached to.
- **Fix:** Demote the entry to 🧪 ("niche / experimental") until a real screen asks, or split it: keep the in-repo contributor scaffolder as a ◽ under "Project improvements" where it belongs (it serves contributors, not consumers, and so does not belong in a consumer-facing distribution discussion at all), and strike shapes 1 and 3 with the reasons above. The evidence that would flip this: justpaint (or mtp-tg) on current,…

### ORI-I-57 — The repo is in changesets pre-release mode; cutting 1.0 requires an explicit `changeset pre exit` that the runbook mentions only in passing

`confirmed` · severity `should-fix` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (cli, missed-by-skeptic)

- **Where:** C:/Users/markg/WebstormProjects/vueinjar/.changeset/pre.json:2-3; RELEASING.md:13-14, :59
- **What:** `.changeset/pre.json` declares `"mode": "pre", "tag": "alpha"` and lists roughly 40 accumulated changesets — every one queued since alpha.1. This is the actual mechanical gate on the freeze the whole module discussion sits in front of, and the skeptic never opened it. RELEASING.md:13-14 explains that pre mode keeps versions at `1.0.0-alpha.N` and that `latest` "moves to the stable line when you exit pre mode", but…
- **Fix:** Add an explicit 'Cutting 1.0' section to RELEASING.md before the release: `changeset pre exit`, verify the collapsed 1.0.0 changelog reads coherently across all three packages, confirm the `fixed` lockstep group still bumps together, and state what happens to the stale `alpha` dist-tag. This is a half-hour of documentation that prevents the freeze itself going wrong.

### ORI-I-58 — `@oriui/css` exports `./components/*.css` as a wildcard, so at 1.0 every filename in that directory silently becomes a frozen public entry point

`confirmed` · severity `should-fix` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (cli, missed-by-skeptic)

- **Where:** packages/css/package.json:29; packages/css/src/styles.css:16; IDEAS.md:13-17
- **What:** The exports map declares `"./components/*.css": "./dist/components/*.css"`. After 1.0 that makes each file's _name_ a compatibility promise — renaming, splitting or merging any component stylesheet is a breaking change to a subpath nobody has enumerated. The set is not the 34-component catalog either: `styles.css:16` imports `components/anchored.css`, a shared placement primitive that appears nowhere in the…
- **Fix:** Decide it deliberately rather than by wildcard. Either keep the pattern and record in DECISIONS.md that component CSS filenames are public API from 1.0 (which constrains future refactors), or replace the wildcard with an enumerated list of the intended entries — cheap now, because tests/css.entries.test.ts:48-53 already reads the directory and can assert the enumeration stays complete.

### ORI-I-59 — llms.txt publishes 100+ absolute `/raw/**.md` URLs that no line of project config asks for

`confirmed` · severity `should-fix` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (cli, missed-by-skeptic)

- **Where:** docs/nuxt.config.js:10, :23-30; docs/.output/public/llms.txt:87-341
- **What:** The skeptic's finding 4 proposes closing shape 3 because `/raw/**.md` already ships — but neither they nor the project ever decided to ship it. docs/nuxt.config.js:10 enables `@nuxt/content` and `nuxt-llms`; the `llms` block at :23-30 configures `domain`, `title`, `description`, `full` and `sections`, and says nothing about raw markdown. The endpoint and the ~250 absolute `https://oriui.vercel.app/raw/...` links now…
- **Fix:** Before 1.0, make it a choice: opt into raw markdown explicitly in the `llms` config so the setting is visible in the repo, and add a short DECISIONS.md entry naming `/raw/**.md` as the public agent surface with its stability caveat. If the project is unwilling to promise those URLs, stop linking them absolutely from llms.txt. Either answer is fine; inheriting the commitment silently from node_modules is not.

## Unconfirmed — nobody has checked these

Raised by the completeness critic of the same review: areas no reviewer opened. Each needs a repro before
it earns a `confirmed` status — do not act on them as if they were findings.

### ORI-I-60 — Nobody opened OriToaster: the live region is created together with its content, so toasts may never be announced

`fixed` · kind `unexamined-area` · source: paired review 2026-09-18 (completeness critic)

- **Why it matters:** Six reviews discussed useToast three times (React action identities, the Svelte twin, the module-level queue) and never once asked whether a toast is announced. packages/vue/src/components/toast/ori-toaster.vue is 30 lines and no reviewer cites it. The container it renders is `<transition-group tag="div" :class="['ori-toaster', ...]">` — no `role`, no `aria-live`, no…
- **How to check:** Open packages/vue/src/components/toast/ori-toaster.vue and confirm no aria-live/role on the transition-group. Then verify empirically rather than by reasoning: run the e2e harness in real Chromium with a screen reader (or assert via Playwright that the `.ori-toaster` element exists in the DOM before the first `toast()` call). Compare against Radix Toast's Viewport and…
- **Outcome:** confirmed and fixed — `.ori-toaster` now carries the live semantics itself.

### ORI-I-61 — Two modules independently recommend ungating the toolbar's pressed rule — the edit strips the background from any non-text variant toggle

`unconfirmed` · kind `questionable-verdict` · source: paired review 2026-09-18 (completeness critic)

- **Why it matters:** The consumer module's opposed agent proposes 'one selector edit instead of the skeptic's two-part change: ungate toolbar.css:74-77 to `.ori-button[aria-pressed='true']`', to be done now. The vue module's opposed agent arrives at the same place independently ('move the toolbar's pressed rule into a component-layer `.ori-button[aria-pressed='true']` block as a LITERAL…
- **How to check:** Add `.ori-button[aria-pressed='true']` to a scratch stylesheet over the built packages/css/dist/styles.css, render one button per variant (fill/tonal/outline/text/plain) with aria-pressed=true in real Chromium, and read the computed background-color against the unpressed twin. If fill/tonal regress, the correct shape is a variant-aware pressed treatment (an inset ring plus a…

### ORI-I-62 — The headline 1.0 promise — three adapters, one identical surface — is asserted in the docs and verified by no test

`unconfirmed` · kind `cross-module-interaction` · source: paired review 2026-09-18 (completeness critic)

- **Why it matters:** docs/content/overview/installation.md:83 states 'The surface is identical across the three: same options, same prop bags, same ARIA', and README.md:55 repeats it ('same machines, same keyboard handling, same ARIA wiring; only the reactive wrapper differs'). That claim is what 1.0 freezes, and it spans the headless and packaging modules — so it fell between them. The headless…
- **How to check:** Write one table-driven test that drives each widget through all three adapters with identical options and diffs the normalized prop bags after case-folding React's casing — the same shape as the existing normalizeProps tests, one level up. Start with useTabs and useDisclosure, where the bags are pure data. Any key present in one adapter and absent in another is the finding;…

### ORI-I-63 — Nobody opened docs/app: the site's framework switcher knows only Vue and Svelte, four months after React shipped

`unconfirmed` · kind `unexamined-area` · source: paired review 2026-09-18 (completeness critic)

- **Why it matters:** The cli module reviewed docs/nuxt.config.js and llms.txt in detail and never opened docs/app/. docs/app/composables/useOriFramework.ts:1 declares `export type Framework = 'html' | 'js' | 'ts' | 'vue' | 'svelte'` and :8 `export const FRAMEWORKS: Framework[] = ['vue', 'svelte']`; Example.vue:14-15 mirrors it in LABELS and ORDER. So the one interactive affordance the site has for…
- **How to check:** Open docs/app/composables/useOriFramework.ts and docs/app/components/Example.vue, then run `grep -rn '#react' docs/content/`. Decide whether React joins FRAMEWORKS (which means auditing every `::example` on the 20 headless pages for a #react slot and choosing what a styled-component page shows a React reader) or whether the honest 1.0 answer is a single 'oriUI in React/Next'…

### ORI-I-64 — Performance under real data was examined by nobody — and the headless review's own fix would make the combobox O(n^2)

`unconfirmed` · kind `questionable-verdict` · source: paired review 2026-09-18 (completeness critic)

- **Why it matters:** The headless module's missed-item proposes dropping the `index` parameter from `getOptionProps(item, index)` and deriving it inside: 'derive `const index = collection.findIndex(i => i.value === item.value)` inside getOptionProps / getItemProps', rated should-fix with 'Cheapest now: after 1.0 ... narrowing it is a major'. The elegance argument is good and the cost analysis is…
- **How to check:** Benchmark before deciding: mount OriCombobox with 1k / 10k items, drive an arrow-key hold in the real-Chromium e2e harness and measure scripting time per keystroke, then repeat with the findIndex-inside variant. If the two-arg signature is kept for this reason, record it in DECISIONS.md so the next reviewer does not re-file it as ceremony; if it is dropped, pass a precomputed…

### ORI-I-65 — The tree-shaking promise is written into the review bar and a changeset and measured by nothing

`unconfirmed` · kind `unexamined-dimension` · source: paired review 2026-09-18 (completeness critic)

- **Why it matters:** REVIEW.md:88 requires 'tree-shakeable (importing one component doesn't pull the others)' and a shipped changeset asserts the same. The packaging skeptic noticed the gap and its opposed agent explicitly deferred it ('that needs a bundler and a second budget file, and it is a separate change'), so it ends the review cycle unexamined by anyone. The build shape looks right —…
- **How to check:** Add one size-limit entry with an `import` field — `{"import": "{ OriButton }", "path": "packages/vue/dist/index.js"}` — and a second for a component with no siblings, then compare against the 45 kB full-bundle number. If a single-component import lands anywhere near the full bundle, bisect with rollup's `--treeshake` output before the freeze rather than after.

### ORI-I-66 — RTL and i18n were examined by no reviewer, although the CSS shows RTL was an intended capability

`unconfirmed` · kind `unexamined-dimension` · source: paired review 2026-09-18 (completeness critic)

- **Why it matters:** Not one of the six reviews contains the word RTL, yet the code says the project meant to support it: packages/css/src/components/badge.css:72 carries an explicit `.ori-badge-anchor:dir(rtl)` rule, anchored.css:20 comments that its alignment is 'RTL- and writing-mode-aware', and the blocks are otherwise disciplined about logical properties (margin-inline, border-block). Against…
- **How to check:** Run `grep -rnE '(border|margin|padding)-(left|right)|^\s*(left|right)\s*:' packages/css/src/` for the full inventory, then load the e2e harness with `<html dir="rtl">` and screenshot vertical tabs, the vertical divider, the badge anchor and each toast corner. Decide and document one line: either RTL is supported (and these become inline properties) or it is explicitly out of…

## Found while fixing the Tier-0 batch

### ORI-I-67 — tests/token.test.ts — `observeTheme` fires-twice case is flaky under full-suite load

`confirmed` · severity `should-fix` · source: observed while gating the Tier-0 branch, 2026-09-18

- **Where:** tests/token.test.ts:128
- **What:** The MutationObserver case saw 1 of 2 expected callbacks once during a full `npm run test` (1075 ms), then passed on a re-run and passes every time in isolation. It is a timing flake, not a regression — but a flaky test in the gate erodes the meaning of a green run.
- **Fix:** Give the assertion a longer `vi.waitFor` window, or drive the observer deterministically (flush the microtask queue after each mutation) rather than racing a wall-clock wait.

### ORI-I-68 — The invalid-control border is the same failing contrast, one axis over

`confirmed` · severity `should-fix` · source: raised by the Tier-0 contrast fixer, 2026-09-18

- **Where:** packages/css/src/components/input.css:116, select.css:118, textarea.css:116
- **What:** `border-color: var(--ori-color-danger)` on `[aria-invalid="true"]` is the same #b91c1c on the same dark surface — about 2.4:1, under the 3:1 WCAG 1.4.11 minimum for a UI-component boundary. The text axis was fixed; this one was deliberately left, and NOTES.md:203 already records the non-text axis as knowingly deferred.
- **Fix:** Follow the precedent already set at `_themes-variant.css:37`, where the outline variant moved its border to `--ori-color-text` for exactly this reason. One token per declaration.

### ORI-I-69 — The real-engine contrast e2e never renders a form control

`confirmed` · severity `should-fix` · source: raised by the Tier-0 contrast fixer, 2026-09-18

- **Where:** e2e/text-contrast.spec.ts (markup builder, ~lines 32-47)
- **What:** The Chromium contrast guard builds its probe markup from button / link / tag / alert / tabs only. Every form block — field, input, select, textarea, combobox — is outside it, which is the second reason the danger-as-text defect survived a suite that advertises executable AA coverage.
- **Fix:** Add a form row to the probe markup so hint, error and required text are measured in the real engine across every skin and both themes.
