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

`fixed` · severity `blocker-for-1.0` · rebuttal `downgraded` · source: paired review 2026-09-18 (headless/opaque-prop-bags-hide-the-real-contract)

- **Where:** packages/headless/src/vue/contract.ts:11-18,42-51,70-90,105-118; packages/vue/src/components/menu/ori-menu.vue:37,47; packages/vue/src/components/combobox/ori-combobox.vue:120,122
- **What:** The swap tests spread the native adapter, so they prove the injection seam routes but never that the _published_ contract is sufficient to drive OriMenu/OriCombobox. Separately, three unchecked `as string` casts (ori-combobox.vue:120,122; ori-menu.vue:37) encode an assumption about bag contents that lives only in prose.
- **Fix:** Do the test, skip the type surgery. Write ONE from-scratch fake menu adapter that implements MenuControl without touching nativeMenu, mount OriMenu on it, and assert focus-return and roving still work; whatever the fake must invent to pass is the real contract, and it belongs in the MenuControl JSDoc as an explicit 'an adapter MUST emit `id` on triggerProps and `data-highlighted` on the highlighted item bag' clause.…

- **Outcome:** Closed by the Tier-1 batch: `tests/headless-contract-requirements.test.ts` drives OriMenu and OriCombobox from fakes written FROM SCRATCH (never spreading the native adapter), with one omission test per hidden requirement — drop `triggerProps.id` and focus is stranded in the closed menu; drop `data-highlighted` and roving focus never moves; drop `inputProps.id` and `aria-describedby` resolves to the literal string `undefined-hint`. The resulting MUST lists are now in the MenuControl / ComboboxControl JSDoc. Still open by explicit ruling: the three unchecked `as string` casts remain — they are now backed by tests rather than prose, but they still lie to the type system.

### ORI-I-02 — Vue's `useDisclosure` accepts a reactive getter it never re-reads; `disabled` can never change

`fixed` · severity `should-fix` · rebuttal `downgraded` · source: paired review 2026-09-18 (headless/vue-usedisclosure-fake-reactivity)

- **Where:** packages/headless/src/vue/use-disclosure.ts:10; packages/headless/src/vue/native.ts:20-28; packages/headless/src/core/disclosure/disclosure.types.ts:6; docs/content/headless/use-disclosure.md:23,28
- **What:** One docs sentence overstates: docs/content/headless/use-disclosure.md:23 says 'or a getter returning one, to keep it reactive' above a table whose `disabled` row (:28) reads as live behaviour. Options are init-only for this primitive in all three adapters.
- **Fix:** Fix the sentence, not the signature: 'Options seed the primitive and are read once; the getter form is accepted for call-site uniformity with the other composables.' Keep MaybeRefOrGetter. If live `disabled` is ever actually wanted, SET_DISABLED + a watch in the three native adapters is a purely additive minor at any time — it does not need to happen before 1.0.

- **Outcome:** Closed by the register sweep (2026-09-18). Behaviour, not a docs walk-back: `DisclosureEvent` gained `SET_DISABLED`, the reducer handles it, and all three native adapters re-sync it the way combobox/menu already did. The option is genuinely live now, and the docs say which options are live and which are seeds. Disclosure deliberately does NOT close on disable — see DECISIONS.md.

### ORI-I-03 — Svelte `useTheme` tears the controller down when the last store subscriber leaves, permanently breaking `auto`

`fixed` · severity `should-fix` · rebuttal `upheld` · source: paired review 2026-09-18 (headless/svelte-usetheme-destroys-on-last-unsubscribe)

- **Where:** packages/headless/src/svelte/use-theme.ts:37-43; packages/headless/src/core/theme.ts:169-177
- **What:** `useTheme` ties the controller's lifetime to Svelte's store subscriber count, not to the component's lifetime. A subscriber count that drops to 0 and back to 1 — an ordinary `{#if}` around markup that reads `$theme` — calls `controller.destroy()` and then re-subscribes to a controller whose `matchMedia` listener is gone, so `auto` silently stops following the OS scheme for the rest of the component's life.
- **Fix:** Their safeOnDestroy fix is right but incomplete: safeOnDestroy is a no-op when useTheme is called outside component init (module scope), which is exactly the case the current design was covering, so that path would leak the matchMedia listener forever. Ship both halves: (1) create the controller once per call and tear it down via safeOnDestroy, leaving the readable's stop() to only unsubscribe; (2) document that a…

- **Outcome:** Closed by the Tier-1 batch: teardown moved off the store subscriber count onto `onDestroy`, so the controller lives as long as the component. Because `onDestroy` does not exist outside component init, the store also exposes `destroy()` for module-scope callers — a deliberate framework deviation recorded in DECISIONS.md and documented on the use-theme page.

### ORI-I-04 — Five different "how do I pass options" idioms are about to be frozen into one package

`fixed` · severity `should-fix` · rebuttal `downgraded` · source: paired review 2026-09-18 (headless/five-reactive-option-idioms)

- **Where:** packages/headless/src/vue/use-combobox.ts:14; packages/headless/src/vue/use-tabs.ts:40; packages/headless/src/vue/use-color-picker.ts:52; packages/headless/src/vue/use-dismissable.ts:27;…
- **What:** Two signatures are genuinely inconsistent, not eight: UseToolbarToggleGroupOptions mixes both styles inside one interface (vue/use-toolbar.ts:157-159 — `type` is MaybeRefOrGetter, `value` a bare getter), and Svelte's pair disagrees with itself (svelte/use-toolbar.ts:67 useToolbar takes MaybeReactive, :185 useToolbarToggleGroup takes a plain object). And the rule behind the two families is written down nowhere, which…
- **Fix:** Align the two toolbar toggle-group signatures with their own root (~2 signatures, contained to the toolbar family), and add one paragraph to docs/content/headless/core.md stating the rule: 'options that SEED a primitive accept a value, a ref/store or a getter; options that are re-read live require the reactive form.' That makes the surface self-explanatory at a fraction of the churn, and it is the thing a senior…

- **Outcome:** Closed by the second register sweep (2026-09-18). Both genuinely inconsistent signatures aligned with their own root: Vue's toggle-group `value` widened to `MaybeRefOrGetter` (pure widening), and Svelte's took `MaybeReactive<Options>` with plain members like its seven siblings (breaking, taken now because pre-1.0 is when it is free). The seed-vs-live rule is written into the option interfaces' JSDoc: options that SEED a primitive are read once, options that are LIVE are re-read — `disabled` joined the live side in the previous batch.

### ORI-I-05 — `core/mergeProps` is unused, untested, and collides by name with Vue's — while being documented as core toolkit

`fixed` · severity `should-fix` · rebuttal `downgraded` · source: paired review 2026-09-18 (headless/dead-colliding-mergeprops)

- **Where:** packages/headless/src/core/merge-props.ts:25-47; packages/headless/src/core/index.ts:16; docs/content/headless/core.md:67; packages/vue/src/components/combobox/ori-combobox.vue:2
- **What:** Not dead code; an untested, under-documented export whose `class` branch assumes string values and whose docs row (docs/content/headless/core.md:67) does not tell a Vue reader to use Vue's own instead.
- **Fix:** Keep it, and spend three lines instead of a deletion: add 'Vue users should use Vue's own mergeProps; `class` values must be strings' to the core.md row and the JSDoc, and add one unit test covering handler chaining, class concat and style merge. That closes the honest half of the finding without removing the helper the non-Vue story needs.

- **Outcome:** Closed by the register sweep (2026-09-18). core/mergeProps kept, with the missing JSDoc (Vue users should use Vue's own; class values must be strings) and unit tests for handler chaining, class concat and style merge.

### ORI-I-06 — React `useToast` hands back new function identities on every render for a module-level singleton

`fixed` · severity `should-fix` · rebuttal `upheld` · source: paired review 2026-09-18 (headless/react-usetoast-unstable-action-identities)

- **Where:** packages/headless/src/react/use-toast.ts:40-47; packages/headless/src/core/toast/queue.ts:115-125
- **What:** `useToast()` calls `createToastActions(queue)` inside the hook body, so `toast` / `success` / `dismiss` / `clear` are fresh closures on every render even though the queue they close over is a module-level singleton that never changes. That is the standard React footgun: `useEffect(() => { toast('saved') }, [toast])` re-fires forever, and any memoised child taking `toast` as a prop re-renders on every parent render.
- **Fix:** Exactly their fix — hoist `const actions = createToastActions(queue)` to module scope beside the queue and return `{ toasts, ...actions }` — plus their identity assertion. While there, check the Svelte twin for the same shape, since it shares the createToastActions factory.

- **Outcome:** Closed by the Tier-1 batch: the actions are hoisted to module scope beside the singleton queue, so every caller gets the same seven functions for the life of the process; the hook JSDoc now says they are safe in a dependency array. Verified RED first.

### ORI-I-07 — The three adapters' option interfaces are copy-pasted, with nothing pinning them together

`fixed` · severity `should-fix` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (headless, missed-by-skeptic)

- **Where:** packages/headless/src/vue/contract.ts:4-8,26-33,55-67,94-102; packages/headless/src/react/contract.ts:7-10,30-36,59-70,98-105; packages/headless/src/svelte/contract.ts:10-13,32-38,61-72,100-107
- **What:** UseDisclosureOptions / UseDialogOptions / UseComboboxOptions / UseMenuOptions are declared three times, once per adapter, with identical members that are entirely framework-neutral (strings, booleans, ComboboxItem[], plain callbacks). Only the CONTROL shapes legitimately differ per framework (ComputedRef vs Readable vs plain). Today the copies agree — I diffed them member for member. Nothing enforces that tomorrow:…
- **Fix:** Hoist the four option interfaces into core (they import nothing framework-specific) and have each contract.ts re-export them: `export type { UseComboboxOptions } from '../core'`. One shared declaration, three re-exports, zero runtime change, and parity becomes a compile error instead of a review item. Do it before the freeze — afterwards, fixing a drift means adding an option to two adapters as a minor and…

- **Outcome:** Closed by the second register sweep (2026-09-18). The four behaviour option shapes and `UseTabsOptions` are declared once in core and re-exported by each adapter, and the toggle group's selection rules moved into a shared core helper that three adapters had hand-written. `tests/adapter-parity.test.ts` now pins every adapter's options to the core declaration bidirectionally, so drift is a `test:types` failure that names the adapter — verified by deliberately drifting a member type and an extra key.

### ORI-I-08 — Every item prop-getter freezes a redundant `index` the connect already has, and a wrong one silently mis-aims aria-activedescendant

`accepted` · severity `should-fix` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (headless, missed-by-skeptic)

- **Where:** packages/headless/src/core/combobox/combobox.connect.ts:29,42,51-53,204-206; packages/headless/src/core/menu/menu.connect.ts (getItemProps); docs/content/headless/use-combobox.md:72
- **What:** connect() already receives the full visible collection (combobox.connect.ts:42) and computes highlightedIndex from it itself (`collection.findIndex`, :52), yet getOptionProps(item, index) makes the CALLER re-supply that same index, and the option's DOM id is built from the caller's number (`optionId(index)`, :29 and :204). The two must agree or the input's aria-activedescendant points at an id no element carries — a…
- **Fix:** Drop the parameter: derive `const index = collection.findIndex(i => i.value === item.value)` inside getOptionProps / getItemProps and key the option id off that (or off the item's value, scoped by the anatomy). Misuse stops being expressible, three docs examples get shorter, and the item bag is what a senior reader expects — `getOptionProps(item)`. Cheapest now: after 1.0 the Control interfaces in three contract.ts…

- **Outcome:** REFUTED by measurement, and kept as a warning rather than deleted. The proposal was to drop the redundant index parameter and derive it inside the getter with a findIndex. e2e/perf-collections.spec.ts measured what that costs in real Chromium: the shipped two-argument getter is linear (3.0-3.8 ms per keystroke at 1k options, 36-39 ms at 10k), while the derive-inside variant is quadratic — x31-50 growth, 245 ms per keystroke at 10k. A guard now asserts the 10k/1k ratio stays under 24, so the library cannot drift into that shape by accident. The redundancy is real and it is the price of staying linear; the wrong half of the entry is the proposed fix, not the observation.

### ORI-I-09 — React's compound-event map is a hand-maintained allowlist whose failure mode is silence, with no test holding it to the core

`fixed` · severity `should-fix` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (headless, missed-by-skeptic)

- **Where:** packages/headless/src/react/normalize-props.ts:23-42,47-61; packages/headless/src/core/combobox/combobox.connect.ts:213-218; packages/headless/src/core/menu/menu.connect.ts:171
- **What:** The React normalizer renames compound handlers through a literal map and passes everything else through, and its own comment states the consequence: an unmapped onXxx 'would pass through mis-cased and React would drop it silently' (normalize-props.ts:26-29). I checked today's core against it — the connects emit only onClick, onKeydown and onPointermove, all covered, so nothing is broken right now. That is the point:…
- **Fix:** Ten lines of test, no design change: build each widget's api (disclosure / combobox / menu connect with a pass-through normalizer), walk every prop bag plus the item getters, and assert every key matching /^on[A-Z]/ is either single-word or present in eventMap. The invisible coupling becomes a red CI the day someone adds onFocusout, which is the only time it matters.

## @oriui/vue — styled components

- **Outcome:** Closed by the second register sweep (2026-09-18). The allowlist turned out to be complete — the defect was that nothing would have told us otherwise. A new test derives every handler key the core actually emits (walking the real connect apis, open and closed, item getters included), pushes each through the real React normalizer onto a real element, and dispatches the native event, so it asserts React CALLS the handler rather than that a key sits in a table. Verified by removing one mapping: the failure names the missing key and the file to edit.

### ORI-I-10 — A toggle button has two incompatible models: OriButton's `active` is a look with no accessible state, OriToolbarButton's `pressed` is state with no look outside a toolbar

`fixed` · severity `blocker-for-1.0` · rebuttal `downgraded` · source: paired review 2026-09-18 (vue/button-toggle-two-vocabularies)

- **Where:** packages/vue/src/components/button/ori-button.vue:14,50; packages/vue/src/components/toolbar/ori-toolbar-button.vue:36,73; packages/css/src/themes/_themes-variant.css:57,68,79,90,101; packages/css/src/components/toolbar.css:74,80;…
- **What:** One doc line is wrong and one look is over-scoped. accessibility.md:18 lists "`aria-pressed` / `data-active` for toggles" as if they were interchangeable a11y mechanisms; they are a state and a look. And the good pressed fill (tint + inset hairline) is scoped to `.ori-toolbar`, so a standalone toggle built on OriButton has no dedicated persistent-pressed appearance. Neither is frozen.
- **Fix:** Before 1.0, fix one sentence: accessibility.md:18 should read "`aria-pressed` for toggle state; `data-active` is a forced `:active` look, not an AT mechanism" — and the same distinction belongs in DECISIONS.md, since this is the second reviewer to misread it. After 1.0, whenever a standalone toggle is actually wanted: add `pressed?: boolean` with the `= undefined` coercion opt-out (ori-toolbar-button.vue:21-24) and…

- **Outcome:** Closed by the register sweep (2026-09-18). OriButton gained a `pressed` prop (aria-pressed + the affordance) distinct from `active` (the look), defaulting to `undefined` so a plain button never stamps `aria-pressed="false"`. The pressed treatment moved onto the button and out of the toolbar gate, split into a universal inset ring plus a tint that reaches only transparent-background variants — which is how it avoids the regression ORI-I-61 warns about. Recorded in DECISIONS.md.

### ORI-I-11 — `OriCard.image` is a declared prop that renders nothing, and 1.0 turns it into a compatibility promise

`fixed` · severity `blocker-for-1.0` · rebuttal `upheld` · source: paired review 2026-09-18 (vue/card-image-noop-prop)

- **Where:** packages/vue/src/components/card/ori-card.vue:16; docs/content/components/card.md:455; DECISIONS.md "Dropped silent no-op props (Avatar `shadow`, Card `icon`)"
- **What:** `image` is a silent no-op — declared, typed, documented, and never read by the template or by card.css. Freezing it means removing it later is a major bump, and keeping it means shipping 1.0 with a prop that lies. The DECISIONS entry that grandfathered it justified the exception with "Pre-1.0 alpha, so the removal is a free breaking change" — that rationale expires at the freeze.
- **Fix:** Delete it, don't implement it. Implementing a hero image properly is a design task, not a one-liner: it needs a `.ori-card__image` block with aspect-ratio handling, a defined position in `ori-card_row` mode (card.css:63 `.ori-card.ori-card_row { display: flex }`), and an `alt` story — a prop that renders an `<img>` with no way to set `alt` would trade a harmless no-op for an a11y failure. So delete `image` and its…

### ORI-I-12 — Disabled and selected are expressed as BEM classes in four components; under `<fieldset disabled>` the checkbox/switch/radio render as fully enabled

`fixed` · severity `should-fix` · rebuttal `downgraded` · source: paired review 2026-09-18 (vue/state-as-class-fieldset-bug)

- **Where:** packages/vue/src/components/checkbox/ori-checkbox.vue:37; packages/vue/src/components/switch/ori-switch.vue:34; packages/vue/src/components/radio/ori-radio-group.vue:75; packages/vue/src/components/combobox/ori-combobox.vue:244;…
- **What:** Two different-sized things. Small: checkbox/switch/radio style disabled only from the prop-driven class, so a fieldset- or attribute-disabled control is inert but not dimmed — cosmetic, additively fixable at any time. Freeze-relevant: combobox.md:88-90 hands CSS-layer consumers `class:ori-combobox__option_selected={$getOptionState(item).selected}` as the documented way to mark selection. That teaches non-Vue…
- **Fix:** Do the cheap correct thing, not the sweep. Change combobox.css:188 to `.ori-combobox__option[aria-selected='true']` and delete the `class:ori-combobox__option_selected` line from the combobox.md:88 example — it is redundant the moment the CSS keys off the attribute the getter already emits. Keep the class binding in the SFC for a cycle so nobody's override breaks. Leave checkbox/switch/radio for a post-1.0 patch…

- **Outcome:** Closed by the register sweep (2026-09-18). checkbox / switch / radio style `disabled` from the real attribute state, so a control disabled by a surrounding `<fieldset disabled>` renders disabled too.

### ORI-I-13 — A caller's `aria-describedby` is silently deleted by the four text controls, contradicting the documented "everything falls through" promise

`fixed` · severity `should-fix` · rebuttal `upheld` · source: paired review 2026-09-18 (vue/aria-describedby-silently-dropped)

- **Where:** packages/vue/src/components/input/ori-input.vue:91,100; select/ori-select.vue:97,104; textarea/ori-textarea.vue:93,102; combobox/ori-combobox.vue:191,199; docs/content/components/input.md:330,358-360
- **What:** `<OriInput aria-describedby="form-note" />` renders no `aria-describedby` at all. The template binds `v-bind="$attrs"` first and `:aria-describedby="describedBy"` second; when `describedBy` is `undefined`, Vue's `mergeProps` overwrites the caller's value with `undefined` and the attribute is dropped. The docs promise the opposite. The `describedby` prop exists as the workaround but is documented only as a way to add…
- **Fix:** Cheaper than five join-expressions: OriInput's `describedBy` computed (ori-input.vue:68-72) already builds and joins an id list, so add the caller's value to that array — `useAttrs()['aria-describedby']` reads reactively inside a computed — and the template needs no change, because mergeProps then overwrites with a value that already contains the caller's id. Mirror that in select/textarea/combobox. For OriSlider…

### ORI-I-14 — Four collection-item types are unexported, one is documented but missing from the barrel, and `TabItem` collides by name with an incompatible type in @oriui/headless

`fixed` · severity `should-fix` · rebuttal `downgraded` · source: paired review 2026-09-18 (vue/collection-item-types-unexported)

- **Where:** packages/vue/src/components/tabs/ori-tabs.vue:6-10; packages/headless/src/vue/use-tabs.ts:18-21; radio/ori-radio-group.vue:6-10; select/ori-select.vue:6-10; accordion/ori-accordion.vue:5-9; menu/ori-menu.vue:3,23; menu/index.ts;…
- **What:** Five item shapes are local interfaces where one sibling re-exports its own, and menu.md:319/:337 names a type the styled barrel does not forward. Worth doing before 1.0 because it is free, not because it freezes anything.
- **Fix:** Re-export from each component barrel, mirroring combobox/index.ts:2, rather than hoisting five shapes into types.ts — types.ts is 84 lines of cross-cutting token vocabulary (sizes, colors, variants, placements) and per-component item shapes do not belong in it. For Tabs, write `interface TabItem extends HeadlessTabItem { label: string }` and export that name: the inheritance documents the relationship and makes the…

- **Outcome:** Closed by the Tier-1 batch: four local interfaces exported and re-exported from their component barrels (`TabItem`, `SelectOption`, `RadioOption`, `AccordionItem` — Menu and Combobox turned out to re-use the headless types, not declare their own), and the menu barrel now forwards the type its docs already named. The cross-package `TabItem` collision is resolved by the styled one deriving from the headless one. `tests/item-types.test.ts` fails if an export is lost.

### ORI-I-15 — Ruling on (b): deferring `useControllable` is defensible (the retrofit is mostly additive), but three per-component policies freeze and cannot be fixed additively

`fixed` · severity `should-fix` · rebuttal `downgraded` · source: paired review 2026-09-18 (vue/controllability-ruling)

- **Where:** packages/vue/src/components/dialog/ori-dialog.vue:33,44-47,111; tabs/ori-tabs.vue:52-58; combobox/ori-combobox.vue:65,103-114; menu/ori-menu.vue:27,75; slider/ori-slider.vue:11,25-28; color-picker/ori-color-picker.vue:43-44;…
- **What:** The deferral of `useControllable` is sound and the retrofit stays additive. The genuine asymmetry is the one the skeptic listed second and understated: only Dialog has an uncontrolled seed (`defaultOpen`, ori-dialog.vue:28/33/55), so Combobox, Tabs, ToggleGroup and ColorPicker can only be initialised through a bound model. That is a real API-shape inconsistency across the catalog — and a `default*` prop is additive…
- **Fix:** Keep the deferral. Add `:open="m.open.value"` to ori-menu.vue:75 for symmetry with Dialog (one line, do it now because it is free). Document Tabs' reconciliation policy in tabs.md as a contract — do not add a prop to disable it. Leave OriSlider alone until the convergence pass actually happens; converting it in isolation pays the behaviour-change cost without retiring the mechanism split, since Dialog would still be…

- **Outcome:** Closed by the second register sweep (2026-09-18). The free part the rebuttal identified: OriMenu's `#trigger` slot now exposes `open`, restoring the symmetry Dialog already had. The Tabs reconciliation policy is documented as a contract on its page rather than turned into a prop. The `useControllable` deferral itself stands — the retrofit remains additive.

### ORI-I-16 — `loading` on a non-button OriButton is guarded only by `pointer-events: none` — the exact failure mode the project's own NOTES.md warns about

`fixed` · severity `nit` · rebuttal `upheld` · source: paired review 2026-09-18 (vue/button-loading-nonbutton)

- **Where:** packages/vue/src/components/button/ori-button.vue:47,51; packages/css/src/components/button.css:98-100; NOTES.md "Toolbar disabled = aria-disabled + STILL FOCUSABLE"
- **What:** `<OriButton as="a" href="/x" loading>` renders `aria-busy="true"` and nothing else: no `aria-disabled`, no `tabindex="-1"`, and the real `disabled` attribute is deliberately skipped for non-buttons. The only guard is CSS `pointer-events: none`, which does not stop keyboard activation — a focused link still navigates on Enter.
- **Fix:** Reuse the pattern the repo already owns instead of inventing a new one. Add to ori-button.vue the same capture-phase guard as ori-toolbar-button.vue:80-85, active when `(disabled || loading) && as !== 'button'`, and widen the ARIA to match: `:aria-disabled="disabled || (loading && as !== 'button') ? 'true' : undefined"`. Leave `:tabindex` exactly as it is — a loading control should stay focusable and simply refuse…

- **Outcome:** Closed by the register sweep (2026-09-18). The non-button loading/disabled guard reuses the capture-phase pattern OriToolbarButton already owned — and the orchestrator then found a real defect in it: bound unconditionally, the capture listener swallowed a caller-supplied fall-through `@click` on a REAL button. It is now bound only for non-button tags, pinned by a test, and the trap is recorded in NOTES.md.

### ORI-I-17 — `<OriCard disabled>` is mouse-blocked, keyboard-open and silent to assistive tech — a container that only looks disabled

`fixed` · severity `should-fix` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (vue, missed-by-skeptic)

- **Where:** packages/vue/src/components/card/ori-card.vue:14,17,44,45; packages/css/src/components/card.css:52-59; docs/content/components/card.md:280,429-431
- **What:** `disabled` renders `aria-disabled="true"` on a plain `<div class="ori-card">` with no role, and the only enforcement is `pointer-events: none`. Buttons and links inside the card stay tab-focusable and Enter-activatable, and because `aria-disabled` is not a global ARIA attribute (a role-less `<div>` is `role=generic`, which supports globals only) assistive tech is told nothing — not about the card, and certainly not…
- **Fix:** Use the platform primitive this library's own bar already reaches for. `inert` (Baseline 2024, the same tier as the native `<dialog>`, exclusive `<details>` and anchor positioning oriUI already depends on) blocks pointer AND keyboard AND removes the subtree from the accessibility tree — exactly the semantics the docs claim. Bind `:inert="disabled || undefined"` on ori-card.vue:44 and replace the `pointer-events:…

- **Outcome:** Closed by the register sweep (2026-09-18). OriCard `disabled` now expresses the state the a11y-correct way instead of only looking disabled.

### ORI-I-18 — The five collection-item shapes disagree on `label` vs `title` and on whether `value` may be a number — five near-identical contracts, all frozen at once

`fixed` · severity `should-fix` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (vue, missed-by-skeptic)

- **Where:** packages/vue/src/components/accordion/ori-accordion.vue:5-9; tabs/ori-tabs.vue:6-10; radio/ori-radio-group.vue:6-10; select/ori-select.vue:6-10; packages/headless/src/core/menu/menu.types.ts:2-6;…
- **What:** The skeptic argued about whether these types are exported; the more expensive question is that they do not agree. Four spell the display string `label` (TabItem:8, RadioOption:7, SelectOption:7, ComboboxItem:4) and `AccordionItem` spells it `title` (ori-accordion.vue:7) for the identical concept. Four accept `value: string | number` (accordion, tabs, radio, select) and two accept `value: string` only (MenuItem:3,…
- **Fix:** Pick one shape and converge before the freeze: `{ value: string | number; label: string; disabled?: boolean }`, with `label` optional only where a value is a legitimate display fallback (MenuItem, which already falls back at ori-menu.vue:89 `item.label ?? item.value`). Concretely: rename `AccordionItem.title` → `label` (the one breaking rename, and `ori-accordion.vue:7` is its only reader), and widen…

- **Outcome:** Closed by the second register sweep (2026-09-18). `AccordionItem.title` renamed to `label`, so all five collection item shapes now agree on the display key. Breaking for anyone passing `title` — typed callers get an error, untyped ones a dev warning rather than a silently blank summary. The docs payloads were migrated in the same commit (they would have rendered blank otherwise). Remaining, and recorded rather than done: `MenuItem.value` and `ComboboxItem.value` are still `string` where the other three take `string | number` — that lives in core and is a separate decision.

### ORI-I-19 — OriTabs renders panels into a dynamic slot namespace that collides with its own reserved `tab` slot

`fixed` · severity `nit` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (vue, missed-by-skeptic)

- **Where:** packages/vue/src/components/tabs/ori-tabs.vue:70,75-77
- **What:** Line 70 renders the tab button's label through `<slot name="tab" :tab="tab">`, and line 75 renders each panel through `<slot :name="String(tab.value)" :tab="tab">`. The per-value panel slots share one unnamespaced namespace with the component's reserved named slots, so a tab whose `value` is `"tab"` resolves its panel to the consumer's `#tab` template — the label renderer — and that content renders twice: once in…
- **Fix:** Either namespace the panel slots now — `<slot :name="'panel-' + String(tab.value)">`, a one-character-class change while the API is still free, and arguably clearer to read at the call site — or, if the bare `#<value>` ergonomics are worth keeping, document the reserved names explicitly in tabs.md (`tab`, `default`) and add a DEV-only warn in the SFC when a tab's value matches one, mirroring the dev-time a11y warns…

## @oriui/css — tokens, layers, class API

- **Outcome:** Closed by the second register sweep (2026-09-18). Per-value panel slots are now `#panel-<value>`, so a tab whose value is literally `tab` no longer shadows the reserved slot. Breaking for existing `<template #value>` usage; the docs samples were migrated in the same commit.

### ORI-I-20 — Every form block paints the raw `danger` role as body text — 2.4:1 in dark theme, in violation of the project's own role-as-text rule

`fixed` · severity `blocker-for-1.0` · rebuttal `upheld` · source: paired review 2026-09-18 (css/form-error-text-raw-role)

- **Where:** packages/css/src/components/field.css:42,58; input.css:76,144; select.css:76,169; textarea.css:76,145; combobox.css:73,219; contrast guard scope at e2e/text-contrast.spec.ts:33-46
- **What:** `.ori-*__error` and `.ori-*__required` set `color: var(--ori-color-danger)` — the fill-background role, not the AA-safe `--ori-color-danger-text` tone. Because status hues are theme-shared (`_themes-color-tokens.css:84`), the error message fails WCAG AA on every dark surface, and the e2e contrast guard cannot catch it because its probe markup contains no form controls.
- **Fix:** Their nine-line change is correct. Add the part that stops it reopening: the artifact that drifted is the closed list at NOTES.md:197, so (a) swap the nine declarations, (b) add one `<div class="ori-field"><p class="ori-field__error">` row (and one per other form block) to the e2e probe markup at text-contrast.spec.ts:32-48 so the guard covers the axis rather than a hand-listed sample, and (c) extend the NOTES…

### ORI-I-21 — Subtree theming (`.ori-theme_dark` / `.ori-theme_light` on a non-root element) is documented as working but is only half-implemented

`fixed` · severity `should-fix` · rebuttal `upheld` · source: paired review 2026-09-18 (css/subtree-theme-half-wired)

- **Where:** packages/css/src/themes/_themes-color-tokens.css:130 and 134-145 and 163-168; _themes-elevation.css:8-29; components/link.css:18; docs/content/guides/theming.md:111-118; docs/content/guides/customization.md:330-336
- **What:** The neutral `--ori-color-text` default is declared only in the plain `:root` rule, so its `var()` substitutes to the LIGHT ink and merely inherits into a `.ori-theme_dark` subtree; and `.ori-theme_light` re-declares neither the six role `-text` clamps nor the elevation shadows, so a light region inside a dark page keeps dark-theme text tones. Page-level theming is fine (same element), subtree theming is not — which…
- **Fix:** Do not duplicate ~20 lines into two blocks — that is exactly how this drifted the first time. Split the derived group out of the bare `:root` source-token rule and give it the selector `:root, :root.light, .ori-theme_light` (it holds the six `-text` clamps plus `--ori-color-text`), leave the `*-light` / `*-dark` source tokens in their own `:root` rule, and add the single missing `--ori-color-text:…

- **Outcome:** Closed by the register sweep (2026-09-18). The derived group was split out of the bare `:root` rule and given the selector `:root, :root.light, .ori-theme_light` — no duplicated blocks — and the same treatment reached the elevation tokens, which no proposed fix had covered. Measured: a `.ori-theme_dark` region on a light page rendered body text at 1.03:1 and a `.ori-theme_light` region on a dark page rendered ink at 1.13:1; after, 18/18 readings pass at 7.61–16.28:1 and shadows switch per region.

### ORI-I-22 — `ori.utilities` contains ten rules that name a component block (`.ori-button`) — the variant vocabulary's interactive half fires for exactly one component

`fixed` · severity `should-fix` · rebuttal `downgraded` · source: paired review 2026-09-18 (css/variant-states-hardcode-button)

- **Where:** packages/css/src/themes/_themes-variant.css:57-110; compare tag.css:107-111 and link.css:27-42
- **What:** The variant utilities correctly own their interactive tints; the only residue is that a consumer building their own block on the css layer (DECISIONS.md:246-247's stated audience) gets `[data-active]` but cannot opt into hover. That is a missing opt-in hook, not a defect, and adding `:where(.ori-button, [data-ori-interactive])` to the ten selectors later is purely additive — zero freeze cost, so it does not belong…
- **Fix:** Either (a) move the ten `:hover`/`:active` rules into button.css where `.ori-button` lives — honest about who owns them, and the utilities layer goes back to being pure token repointing; or (b) make them generic with an opt-in hook, e.g. `:where(.ori-button, [data-ori-interactive]).ori-variant_fill:hover`, so a consumer's own block can join. (a) is the smaller change and loses nothing today; (b) keeps the variant…

- **Outcome:** Closed by the second register sweep (2026-09-18). The ten `ori.utilities` rules that hard-coded `.ori-button` now key off an opt-in `data-ori-interactive` attribute, so the variant vocabulary's interactive half is available to any block instead of exactly one. The attribute is new public API and is recorded in DECISIONS.md.

### ORI-I-23 — Three blocks bake literal colours that no theme or skin can reach — the tooltip chip is 1.1:1 against the dark page

`fixed` · severity `should-fix` · rebuttal `downgraded` · source: paired review 2026-09-18 (css/theme-blind-literal-colors)

- **Where:** packages/css/src/components/tooltip.css:28-29; avatar.css:19; switch.css:72,74
- **What:** One clean rule violation (avatar.css:19 hardcodes `#00000018` where `color-mix(in srgb, currentcolor 10%, transparent)` is the library's own idiom), one measured non-text contrast miss (switch.css:72's white thumb at 2.14:1 on the dark-theme checked track, fixed by reading `var(--ori-color-surface)`), and one cosmetic nit (the tooltip chip does not invert in dark, contradicting its own comment at tooltip.css:23).…
- **Fix:** Avatar: `--ori-color: color-mix(in srgb, currentcolor 10%, transparent)` — one line, auto-inverting, no new token. Tooltip: add a `.ori-theme_dark`/`:root.dark` re-declaration swapping `--ori-tooltip-bg`/`-color` to `neutral-50`/`neutral-900` (keeps the "inverse of the page" intent in both modes; 6 lines). Switch thumb: read `var(--ori-color-surface)` like the slider thumb border already does (slider.css:88). All…

- **Outcome:** Closed by the register sweep (2026-09-18). Three literals removed. The tooltip chip went from 1.04–1.11:1 in dark on every skin to 13.89:1 by reading the page inverted (on-background over background) instead of a raw neutral step; the avatar tint became a `currentcolor` mix; the switch thumb became `currentcolor` / `--ori-color-on` with a token shadow — 160 readings across skins, themes and states, zero failures, worst 4.91:1.

### ORI-I-24 — The two-tier contract leaks: `.ori-card` pins its padding to a raw scale token while reading the alias four lines later

`fixed` · severity `should-fix` · rebuttal `downgraded` · source: paired review 2026-09-18 (css/raw-scale-token-reads)

- **Where:** packages/css/src/components/card.css:30 vs 67,75,96,106; sizes/_sizes-gap.css:13 vs 23-45; sizes/_sizes-action.css:16-22; toast.css:130-132
- **What:** `.ori-card` is missing the local-token escape hatch every other block uses: its outer padding is a real second dimension and should be `--ori-card-padding: var(--ori-size-gap_xl)` read at :30, matching the `--ori-tooltip-radius` / `--ori-toolbar-gap` idiom, so a consumer can retune the card's padding without moving the whole gap scale. The other two sub-claims are a documented token (gap_xxl) and a documented odd…
- **Fix:** Card: bake `--ori-card-padding: var(--ori-size-gap_xl)` (or read the `--ori-size-gap` alias with a multiplier, matching lines 67/75) so one knob drives the block. Gap: either ship `.ori-size-gap_xxl` + add it to `GapSize`, or delete the orphan token — shipping a public token with no way to select it is the worst of both. Action-space: make the scale monotonic or rename the values to what they are. All three are…

- **Outcome:** Closed by the register sweep (2026-09-18). Card gained the `--ori-card-padding` local-token knob it was missing, value unchanged.

### ORI-I-25 — The alpha slider reads tokens declared in another component's block, and three public token names are un-namespaced

`fixed` · severity `should-fix` · rebuttal `downgraded` · source: paired review 2026-09-18 (css/colorpicker-slider-token-seam)

- **Where:** packages/css/src/components/slider.css:180-206 vs color-picker.css:22-25; color-picker.css:45,132; packages/vue/src/components/color-picker/ori-color-picker.vue:126,153; docs/content/components/color-picker.md:24
- **What:** Two of the three token names are mis-namespaced and should be renamed before the class table becomes a promise: `--ori-hue` → `--ori-color-picker-hue`, `--ori-ink` → `--ori-color-picker-ink` (two inline styles in ori-color-picker.vue and one doc row). `--ori-checker-1/2` is correctly un-namespaced because two components share it, and correctly declared at block level because its value derives from theme tokens; the…
- **Fix:** Rename to `--ori-color-picker-hue` / `--ori-color-picker-ink` and move the checker pair to a shared, theme-derived declaration the slider owns (e.g. declare `--ori-checker-*` under `.ori-slider` too, or promote them to a `--ori-surface-checker-*` token in `ori.tokens` since two components already need them). Update the SFC's two inline styles and the class table. Renaming is free today and a breaking change once the…

- **Outcome:** Closed by the second register sweep (2026-09-18). The rename spans three packages, so the orchestrator did it in one commit: `--ori-hue` → `--ori-color-picker-hue` and `--ori-ink` → `--ori-color-picker-ink` across the stylesheet, all three headless adapters, the styled SFC, the tests and the docs. A partial rename would have left the area painting its red fallback, which is why it could not be split across agents. The alpha slider no longer reads a token declared in another block — that half was already closed in the first sweep.

### ORI-I-26 — `.ori-shadow` is a legacy hardcoded utility that breaks the axis naming convention and ignores the elevation tokens it predates

`fixed` · severity `should-fix` · rebuttal `upheld` · source: paired review 2026-09-18 (css/ori-shadow-off-axis)

- **Where:** packages/css/src/utils/utils.css:1-6; themes/_themes-elevation.css:8-29
- **What:** The only shadow class in the library is a bare `.ori-shadow` with two literal `rgb(0 0 0 / …)` layers — no theme awareness, no value suffix, and no `_sm`/`_md`/`_lg` siblings despite `--ori-shadow-{sm,md,lg,ring}` existing and being theme-aware. It appears in no component and no doc page, so 1.0 would freeze a public class nobody uses and nothing documents.
- **Fix:** Delete the bare class outright rather than keeping it as a deprecated alias — a class with zero uses and zero doc mentions has no compat story to preserve, and carrying the off-axis name into 1.0 permanently is the worse trade. Then frame the replacement by its actual value, which the finding undersells: the win is not tidiness, it is that a consumer building their own block on the css layer (DECISIONS.md:246-247's…

- **Outcome:** Closed by the register sweep (2026-09-18). The bare `.ori-shadow` class is deleted outright (zero uses, zero doc mentions, no compat story) with a comment pointing at the `--ori-shadow-{sm,md,lg,ring}` tokens that predate it.

### ORI-I-27 — `.ori-variant`, the legacy paired base class, is still shipped — and it does not no-op, it strips the block's fill

`fixed` · severity `blocker-for-1.0` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (css, missed-by-skeptic)

- **Where:** packages/css/src/themes/_themes-variant.css:10-15; layers.css:12; button.css:30-31; DECISIONS.md:265-267; docs/content/guides/theming.md:101-103
- **What:** `.ori-variant` sets `--ori-variant-bg-color: transparent` and `--ori-variant-text-color: currentColor` in `@layer ori.utilities`, which is declared last (layers.css:12) and therefore beats every block's baked variant cluster in `ori.components` by layer order, not specificity. So `class="ori-button ori-variant"` — the exact shape the pre-refactor docs taught — silently renders a transparent, black-on-page button. I…
- **Fix:** Delete the `.ori-variant` rule (_themes-variant.css:10-15) and sweep the 7 doc occurrences to the single-class form. Deleting a class that no component emits and no page needs is free today; after 1.0 it is a major-version event for a class whose only effect is to break the element it is applied to. If the owner wants belt-and-braces, keep the selector but drop every declaration from it, so a stale `ori-variant` in…

- **Outcome:** Already closed by the Tier-0 batch earlier the same day — the bare `.ori-variant` rule was deleted from `_themes-variant.css`, the file header now records WHY there must be no base rule (ori.utilities outranks ori.components, so a base zeroing the cluster strips a block fill), `tests/css.utilities.test.ts` fails if one reappears in the built CSS, and the two guides that still taught the paired form were rewritten. This entry was a duplicate view of the same defect, recorded from the rebuttal side.

### ORI-I-28 — 105 `.ori-x.ori-x_y` compound selectors contradict the project's own specificity bar, and specificity is override behaviour consumers will freeze against

`fixed` · severity `should-fix` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (css, missed-by-skeptic)

- **Where:** packages/css/src/components/*.css (105 matches across 22 files: button 12, avatar 12, input 8, select 8, textarea 8, spinner 8, icon 8, combobox 7, toast 6, tabs 4, surface 4 …); REVIEW.md:64; input.css:40-42
- **What:** REVIEW.md:64 sets the bar — 'Specificity stays flat — `:where()`, no `.a.a_b` stacking' — and the component layer breaks it 105 times. The cause is structural, not sloppy: each block declares its baked token defaults in the same `.ori-input { … }` rule (0,1,0) that carries its layout, so a single-class modifier could never win, and input.css:40-42 says so out loud ('Compound with the block so it beats the baked `md`…
- **Fix:** Split each block in two: `:where(.ori-x) { /* the baked token defaults */ }` at zero specificity and `.ori-x { /* layout */ }` as today. Then every modifier collapses to a single class — `.ori-input_lg`, `.ori-card_fluid` — the modifier vocabulary becomes uniform with the `.ori-size-action_*` utilities it was meant to mirror (DECISIONS.md:261-264), the 105 compounds go to near zero, and a consumer's plain…

- **Outcome:** Closed by the second register sweep (2026-09-18). 106 `.ori-x.ori-x_y` self-compounds flattened to single-class modifiers across 22 files, which is the bar the project set for itself and never met. Specificity drops from (0,2,0) to (0,1,0), so it is a real change for a consumer overriding from inside a layer — which is exactly why it had to happen before 1.0. Proved visually neutral by a computed-style diff in real Chromium over every component and every one of the 106 modifiers, both themes, before and after. For ten blocks the baked token defaults moved into a `:where()` rule so a single-class modifier still outranks them on specificity rather than on source order.

### ORI-I-29 — Fifteen `var(--ori-color, …)` fallbacks across seven components are provably dead, and three of them lie about what happens

`fixed` · severity `should-fix` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (css, missed-by-skeptic)

- **Where:** packages/css/src/components/color-picker.css:130,139,173; slider.css:182,196; accordion.css:59,64,91,100; menu.css:66,76; popover.css:42; tabs.css:77,110,127; _themes-color-tokens.css:121; tooltip.css:23-27
- **What:** `--ori-color: currentColor` is declared unconditionally at `:root` (_themes-color-tokens.css:121), so it is always defined on every element and the fallback arm of `var(--ori-color, X)` can never fire. The library already knows this and paid for the knowledge once: tooltip.css:23-27 explains that the tooltip needed dedicated `--ori-tooltip-bg/-color` tokens precisely because 'those aliases are globally defined…
- **Fix:** Drop the fifteen fallback arms so the code says what it does, and record the constraint where the next author will see it: one short DECISIONS.md entry stating that `--ori-color` / `--ori-color-on` are globally defined, that a `var()` fallback on them is unreachable, and that a component needing its own default must declare a dedicated block-local token — the rule tooltip.css:23-27 already discovered the hard way.…

## Packaging & release

- **Outcome:** Closed by the second register sweep (2026-09-18). The remaining 11 dead `var(--ori-color, …)` fallbacks are gone. The register said three of the fifteen lie about what would happen; measured, the honest figure is 11 — the arms could never be reached because the alias is always defined at `:root`.

### ORI-I-30 — Nothing in the repo ever imports the packages the way a consumer does — dist + the exports map are built, measured, and never run

`fixed` · severity `blocker-for-1.0` · rebuttal `downgraded` · source: paired review 2026-09-18 (packaging/dist-never-executed)

- **Where:** vitest.config.js:11-22; docs/nuxt.config.js:118-122; e2e/harness/vite.config.ts:12-20; packages/vue/vite.config.js:15-26; .github/workflows/ci.yml:52-77
- **What:** There is no artifact-level smoke test. Every code path in the repo that says `@oriui/vue` or `@oriui/headless` is aliased to `src/`, so `packages/vue/dist/index.js` and `packages/headless/dist/*/index.js` are produced by CI and then only weighed (size-limit) and statically parsed (publint, attw). No test, no doc page, and no e2e spec ever resolves those packages through their `exports` map or executes the built JS.…
- **Fix:** Keep the smoke job, shrink it: `npm pack --workspaces`, install the three tarballs plus vue into a scratch dir, and run one ESM script that imports `@oriui/vue`, `@oriui/headless`, `/vue`, `/svelte`, `/react` and asserts one export from each. Do not also bolt the tree-shaking gate onto it — that needs a bundler and a second budget file, and it is a separate change. Cheaper still and worth doing first: a 5-line CI…

- **Outcome:** Closed by the register sweep (2026-09-18). A pack-and-install smoke test imports the three packages the way a consumer does — through the published tarballs and the exports map, not the src alias.

### ORI-I-31 — release.yml's quality gate is a strict subset of ci.yml's, while its own comment claims parity — attw, size, docs:build and e2e do not gate the publish

`fixed` · severity `blocker-for-1.0` · rebuttal `downgraded` · source: paired review 2026-09-18 (packaging/release-gate-narrower-than-ci)

- **Where:** .github/workflows/release.yml:16-18, 49-59; .github/workflows/ci.yml:55-97; packages/vue/scripts/fix-dts.mjs:41-53
- **What:** release.yml's inline gate is narrower than ci.yml's, which is a defense-in-depth gap rather than an exposure (the full gate runs on the Version-Packages PR that produces every publish). The exposure is the supply-chain one: two `npx -y` tool trees execute in the OIDC-privileged job.
- **Fix:** Two changes, in this order. (1) Move publint and @arethetypeswrong/cli into root devDependencies installed by `npm ci`, and call them as local binaries in both workflows — this removes the OIDC-job code-execution hole and pins the whole tree via package-lock.json, at zero cost. (2) Instead of hand-syncing two command lists that have already drifted, extract the gate into one reusable workflow…

- **Outcome:** Closed by the register sweep (2026-09-18). publint and attw moved into root devDependencies and are called as local binaries in both workflows, closing the `npx -y` code-execution path inside the OIDC-privileged job; the release gate no longer claims a parity it did not have.

### ORI-I-32 — `alpha` is frozen at 1.0.0-alpha.3 while `latest` has been serving prereleases for fourteen releases — and both runbooks state the opposite as fact

`fixed` · severity `blocker-for-1.0` · rebuttal `upheld` · source: paired review 2026-09-18 (packaging/dist-tags-wrong-and-docs-say-otherwise)

- **Where:** RELEASING.md:12-14, 56, 74; CONTRIBUTING.md:50-54, 67; node_modules/@changesets/cli/dist/changesets-cli.cjs.js:1002-1008, 1086, 1110
- **What:** RELEASING.md and CONTRIBUTING.md both assert that pre mode publishes to the `alpha` dist-tag automatically. It does not, and cannot, for this repo — changesets deliberately routes to `latest` when every published version of a package is a prerelease. The result, verified live today for all three packages, is `{"alpha": "1.0.0-alpha.3", "latest": "1.0.0-alpha.17"}`. RELEASING.md:74's own smoke test (`npm i…
- **Fix:** Repoint, do not delete: `npm dist-tag add @oriui/{vue,headless,css}@1.0.0-alpha.17 alpha`. The reviewer offers deletion as an equal option — it is not, because removing the tag makes `npm i @oriui/vue@alpha` a hard 404 for anyone who took CONTRIBUTING.md's advice to pin it, which is the one audience the repair exists for. Then fix the three prose passages to say what actually happens, and add `npm dist-tag ls…

### ORI-I-33 — Exact internal pins survive past the reason recorded for them, and the public `Symbol()` injection keys turn a duplicate `@oriui/headless` into a silent no-op

`fixed` · severity `should-fix` · rebuttal `upheld` · source: paired review 2026-09-18 (packaging/exact-pins-and-module-scope-symbols)

- **Where:** packages/vue/package.json:47-48; CONTRIBUTING.md:50-54; DECISIONS.md:370; packages/headless/src/vue/contract.ts:135; packages/headless/src/vue/use-toolbar.ts:37, 60, 118
- **What:** The exact pins are a recorded decision, but the rationale recorded for them is prerelease-specific and expires at 1.0. CONTRIBUTING.md:51-53 gives the reason as "a `*` range cannot match a prerelease" — true of `1.0.0-alpha.N`, false of `1.0.0`. What remains after the freeze is only the cost: an exact pin defeats npm deduplication, and because the library's public cross-package seams are module-scope `Symbol()`…
- **Fix:** Do both, and say why in one DECISIONS entry: (1) `Symbol.for('ori-headless')` / `Symbol.for('ori-toolbar')` in the Vue and Svelte contracts and toolbars — four one-line edits, invisible to the type surface, makes duplicate copies interoperate; (2) switch the internal ranges to `^1.0.0` at the cutover, because it is the only thing that helps the React adapter, where `createContext` identity cannot be globalised. Also…

- **Outcome:** Closed by the register sweep (2026-09-18). The pins are documented as a prerelease-only mechanism with a one-line cutover, and the rationale that expires at 1.0 no longer reads as permanent.

### ORI-I-34 — `@oriui/vue` publishes a Node engine floor copied from the build toolchain; the other two packages publish none

`fixed` · severity `should-fix` · rebuttal `downgraded` · source: paired review 2026-09-18 (packaging/engines-floor-on-vue-only)

- **Where:** packages/vue/package.json:7-9; packages/headless/package.json:1-19; packages/css/package.json:1-21; package.json:8-10; CLAUDE.md (Node section)
- **What:** Cosmetic inconsistency, not an install hazard: three packages of one product answer the engines question three ways, and the one floor that exists is pinned to a build-toolchain patch version rather than a runtime requirement. Either drop it from `@oriui/vue` or relax it to `>=22` and record the choice. Nit.
- **Fix:** Relax `@oriui/vue` to `>=22` (drops the arbitrary `.18`, keeps the honest signal that this is the SSR-executed package), leave `@oriui/css` and `@oriui/headless` without one, and add one line to DECISIONS.md saying the floor tracks Node's supported line and not tsdown's build minimum. This is strictly cheaper than harmonising all three and does not invent a requirement for a CSS file.

- **Outcome:** Closed by the register sweep (2026-09-18). The engines floor is consistent across the three packages and no longer copies the build toolchain patch version.

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

`fixed` · severity `should-fix` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (packaging, missed-by-skeptic)

- **Where:** package.json:44 (lint:ci globs); packages/vue/scripts/fix-dts.mjs:10-12; packages/css/build.mjs:1-6
- **What:** `lint:ci` checks prettier over `**/*.{vue,js,ts,json,md,html,css}` and eslint over `packages/*/src/**/*.{vue,ts}`. Neither glob matches `.mjs`, and nothing type-checks these files. So `packages/vue/scripts/fix-dts.mjs` — which rewrites every shipped `.d.ts` specifier — and `packages/css/build.mjs` — which emits every shipped stylesheet — are the only two files in the pipeline with no static gate at all. The proof is…
- **Fix:** Add `mjs` to the prettier glob in package.json:44 and extend the eslint glob to cover `packages/*/{scripts,*.mjs}`, then run `lint:all` once to absorb the formatting delta. One line of config; it puts the two artifact-producing scripts under the same bar as everything else before their output becomes a compatibility promise.

- **Outcome:** Closed by the register sweep (2026-09-18). The two artifact-minting scripts are inside prettier, eslint and the lint-staged pre-commit path.

### ORI-I-38 — All three framework peers on @oriui/headless are optional, so no consumer ever gets a missing-peer warning — and the one-package-three-adapters shape is what freezes at 1.0

`accepted` · severity `should-fix` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (packaging, missed-by-skeptic)

- **Where:** packages/headless/package.json:47-62; DECISIONS.md:654-660 and :652
- **What:** `peerDependencies` declares react, svelte and vue, and `peerDependenciesMeta` marks all three optional. That is the standard escape from mutually-exclusive framework peers, but it means the warning channel is switched off for everyone: someone installing `@oriui/headless` and importing `/vue` without vue present gets no install signal at all, only a downstream resolution error. More significant for the freeze:…
- **Fix:** Do not split — the optional-peer technique genuinely solved the problem the 2024 decision was worried about, and the dist proves the isolation is real (I checked: dist/vue/index.js imports only `vue`, dist/svelte/index.js only `svelte`, dist/react/index.js only `react`, dist/core/index.js nothing). Instead rewrite the DECISIONS.md:654-660 entry to say so explicitly and mark the separate-packages rationale…

- **Outcome:** Closed by the register sweep (2026-09-18). Investigated and NOT fixable inside the one-package-three-adapters shape — npm cannot express "exactly one of these peers is required". Recorded rather than papered over.

### ORI-I-39 — dist is gitignored and no package has a prepack hook, so the documented manual publish path can ship an empty package

`fixed` · severity `nit` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (packaging, missed-by-skeptic)

- **Where:** .gitignore (dist); package.json:48 (release script); RELEASING.md:61-66; packages/*/package.json (no prepack/prepublishOnly)
- **What:** `dist` is gitignored and untracked (`git ls-files packages/vue/dist` is empty), `files` is `["dist","src"]`, and I grepped all four package.json files for `prepack` and `prepublishOnly` — there are none. The only thing that puts a build inside the publish is the root script at package.json:48, `npm run build && changeset publish`. CI always goes through it, so this has never bitten. But RELEASING.md:61-66 documents…
- **Fix:** Add `"prepack": "npm run build"` to each of the three package.json files. npm runs prepack for both `npm pack` and `npm publish`, so the build becomes structurally unskippable regardless of which command anyone types, the root `release` script keeps working unchanged, and the manual fallback in RELEASING.md stops being a foot-gun without needing a warning paragraph.

## Consumer-facing gaps (found via justpaint)

- **Outcome:** Closed by the register sweep (2026-09-18). All three packages carry a prepack hook, so the documented manual publish path cannot ship an empty package.

### ORI-I-40 — À-la-carte `@oriui/css/components/*.css` has no completeness guard — the only real consumer already ships two components unstyled

`fixed` · severity `blocker-for-1.0` · rebuttal `downgraded` · source: paired review 2026-09-18 (consumer/alacarte-css-no-completeness-guard)

- **Where:** justpaint apps/web/src/main.ts:3-24; justpaint views/LeaderboardView.vue:91-99,116; views/PlayView.vue:840; components/game/JudgingOverlay.vue:26,30; oriUI packages/css/package.json (exports "./components/*.css");…
- **What:** justpaint ships OriBadge and OriSkeleton unstyled because its hand-maintained à-la-carte list in main.ts:6-24 is missing badge.css and skeleton.css — an app bug, one line to fix. The oriUI-side residue is documentation, not packaging: grep of docs/content for 'oriui/css/components' returns ZERO hits, so the à-la-carte path exists only in packages/css/README.md:35-55 and is invisible on the docs site where a consumer…
- **Fix:** Fix justpaint's main.ts. In oriUI, do the free half: add the à-la-carte import line to each component docs page (the class table is already there) and a line to overview/get-started saying the full bundle is the default for styled Vue consumers. If a machine check is still wanted later, `@oriui/css/manifest.json` (component → required files) is additive and can ship in any 1.x — it does not need to precede the…

- **Update 2026-09-18 (from the consumer, after it built the guard):** the app-side half is fixed
  (justpaint `81474fe`), and building it surfaced a correction to the design above. A completeness check
  **cannot be filename-based**: `OriSpinner` looked like a third unstyled component because `spinner.css` is
  not imported, but `.ori-spinner` is inlined into `button.css` and `toolbar.css`, which are. The invariant
  is therefore about **selectors present in the concatenated sheets**, not about one import per component —
  which is a direct consequence of the self-contained-entry rule this package deliberately adopted (see
  `tests/css.entries.test.ts`, "per-component css inlines every block its vue component renders"). So if
  oriUI ever ships the `manifest.json` suggested above, it must map component → **required selectors**, or
  map component → the file that actually carries it, not component → its own filename. justpaint's
  `apps/web/scripts/check-styles.mjs` is a working reference implementation.
  Block-to-file divergences, inventoried so a manifest does not have to rediscover them: `.ori-toaster` →
  `toast.css`, `.ori-radio-group` → `radio.css`, `.ori-cluster` → `stack.css`, `.ori-badge-anchor` →
  `badge.css`; `toolbar.css` additionally carries a `.ori-button` rule, and `.ori-spinner` is inlined into
  both `button.css` and `toolbar.css` besides shipping as `spinner.css`.
- **Correction (same day, after the consumer checked its own guard):** file-name divergence turns out NOT to
  be the gap. A guard that never derives a filename — concatenate every stylesheet the package defines
  ("does oriUI define this class at all") versus only the stylesheets the app imports ("does the app load
  it") — is immune to it, which is how justpaint's script is built. The residual gap is narrower and
  real: a component whose **block name does not follow from its component name** is underivable, and the
  guard can only abstain. Today's instances are the toolbar sub-components — `OriToolbarButton` and
  `OriToolbarToggleItem` render no eponymous block at all (they compose `OriButton`), and
  `OriToolbarSeparator` renders `.ori-toolbar__separator`, a BEM element of the toolbar block (an earlier note here said `.ori-toolbar-item`; that string is the `data-ori-toolbar-item` marker ATTRIBUTE, not a class, and no such class exists). The consequence is muted because `toolbar.css` inlines
  `.ori-button`, but the derivation abstains, so an app that renders only toolbar buttons is unguarded. That
  — not the filenames — is the case a component → required-selectors manifest removes by construction.
- **Spec note for that manifest:** selector presence needs a **boundary rule**, not a substring test.
  `.ori-badge` matches inside `.ori-badge-anchor` (a different block), and naive shapes like `".ori-x "` /
  `".ori-x,"` miss both a minified `.ori-x{` and `.ori-x:hover`.

- **Outcome:** Closed by the register sweep (2026-09-18). The à-la-carte import line is on every component page and in get-started, with the warning that the entry set is not one file per component.

### ORI-I-41 — `OriButton active` announces nothing and paints the same pixels as hover — the toggle contract is incomplete in both dimensions

`fixed` · severity `blocker-for-1.0` · rebuttal `downgraded` · source: paired review 2026-09-18 (consumer/button-active-no-pressed-affordance)

- **Where:** oriUI packages/vue/src/components/button/ori-button.vue:14,50; packages/css/src/themes/_themes-variant.css:57-110; packages/css/src/components/toolbar.css:75-76; docs/content/components/button.md:223,328; justpaint…
- **What:** oriUI has exactly one correct pressed treatment — toolbar.css:74-77 keyed on `[aria-pressed='true']` — and it is gated behind a `.ori-toolbar` ancestor, so a correctly-authored toggle button anywhere else (justpaint IconButton.vue:53,56, which sets both `active` and `aria-pressed`) renders only the `data-active` look, which is byte-identical to `:hover`. Secondarily, `:active` == `:hover` in all five variants, so…
- **Fix:** One selector edit instead of the skeptic's two-part change: ungate toolbar.css:74-77 to `.ori-button[aria-pressed='true']` (keeping the literal `background-color`, whose layer rationale is documented in place at toolbar.css:66-73). That makes `aria-pressed` the one styled toggle idiom across the catalog, works for any consumer that already wires it, and touches no public API. Then give `[data-active]`/`:active` its…

- **Outcome:** Closed by the register sweep (2026-09-18). Same change as ORI-I-10: a toggle now announces its state AND paints differently from hover, outside a toolbar as well as inside one.

### ORI-I-42 — `@oriui/vue` pins its two siblings as exact `dependencies` — a coupling it cannot enforce and that silently duplicates the headless singleton

`fixed` · severity `blocker-for-1.0` · rebuttal `upheld` · source: paired review 2026-09-18 (consumer/exact-pin-deps-not-peers)

- **Where:** oriUI packages/vue/package.json ("dependencies": {"@oriui/css": "1.0.0-alpha.17", "@oriui/headless": "1.0.0-alpha.17"}, "sideEffects": false); packages/headless/src/vue/use-toast.ts:6-10; justpaint apps/web/package.json (all three pinned…
- **What:** `@oriui/vue` declares exact-version `dependencies` on `@oriui/css` and `@oriui/headless`, but it never imports `@oriui/css`, and the app imports both siblings directly. So the pin cannot enforce the CSS/component version match it appears to guarantee, and on any partial upgrade npm nests a second copy — giving new components on old CSS, plus a duplicated module graph around a documented module-level singleton. This…
- **Fix:** Do not treat the two the same — they are different relationships, and collapsing them is why the skeptic's version reads as boilerplate. `@oriui/headless` is a genuine runtime import AND holds process-wide singletons (contract.ts:135, use-toolbar.ts:37,153, vue/use-toast.ts:10) → move it to `peerDependencies` (plus `devDependencies` for the repo build) with `"^1.0.0"` post-freeze; npm 7+ auto-installs it so `npm i…

- **Outcome:** Closed by the register sweep (2026-09-18). `@oriui/vue` declares zero runtime dependencies — both siblings are peers, decided per relationship. Recorded in DECISIONS.md.

### ORI-I-43 — There is no neutral/structural colour token, so the library hardcodes ~40 ad-hoc `color-mix` percentages and the consumer squatted `--ori-color-outline` in oriUI's namespace

`fixed` · severity `blocker-for-1.0` · rebuttal `downgraded` · source: paired review 2026-09-18 (consumer/no-neutral-structural-token)

- **Where:** oriUI packages/css/src/themes/_themes-color-tokens.css:52-131; packages/css/src/components/surface.css:26, divider.css:16, input.css:12,37, accordion.css:25,30, menu.css:31, popover.css:31, checkbox.css:59, radio.css:80, kbd.css:22,26,…
- **What:** oriUI derives its neutral structure two different ways for the same job: `var(--ori-color-on-surface) 12%` at surface.css:26 versus `currentcolor 12%` at menu.css:31 and popover.css:31, which diverge inside a `.ori-color_*` region (a red hairline on a danger-coloured panel vs a neutral one). Pick one mechanism. The percentage spread is mostly deliberate WCAG duty, not disagreement, except 12 vs 14 and 20 vs 25.…
- **Fix:** Normalise the mechanism (one of `currentcolor` or `--ori-color-on-surface`, stated once in NOTES.md) and collapse 12/14 and 20/25 to single values. If a retunable handle is wanted later, add it as an opt-in default — `color-mix(in srgb, currentcolor var(--ori-outline-strength, 12%), transparent)` — which keeps the adaptive derivation, gives a consumer one knob, and ships in any 1.x without a name collision.

- **Outcome:** Closed by the register sweep (2026-09-18). Mechanism normalised to `currentcolor` (36 structural declarations already used it against 6 on `--ori-color-on-surface`), with the hairlines rendering byte-identically in all 16 skin-theme combinations — the evidence that this is a pure mechanism change. No new public token: that remains an API decision. Recorded in DECISIONS.md.

### ORI-I-44 — `OriPopover`'s `role?: string` leaks into the trigger slot as an untyped `aria-haspopup`, forcing consumers to cast away the slot's types

`fixed` · severity `should-fix` · rebuttal `upheld` · source: paired review 2026-09-18 (consumer/popover-role-untyped)

- **Where:** oriUI packages/vue/src/components/popover/ori-popover.vue:21-25,34-39,43; justpaint components/FloatingToolbar.vue:203-208
- **What:** `role` is typed as unconstrained `string`, so the `triggerProps` bag infers `'aria-haspopup': string`. Vue's `ButtonHTMLAttributes` types that attribute as a literal union, so `v-bind` of the bag does not type-check on a `<button>` — the documented, intended usage. The only real consumer works around it with `as Record<string, unknown>`, which discards type-checking on the whole bag.
- **Fix:** The skeptic's fix is wrong in kind. Narrowing `role` to the `aria-haspopup` union would FORBID legitimate panel roles — a popover holding `role="group"`, `role="region"` or no role at all is valid markup — because the panel's role and the trigger's `aria-haspopup` vocabulary are simply not the same set. The defect is the conflation at ori-popover.vue:36, not the width of the type. Keep `role?: string` for the panel…

- **Outcome:** Closed by the second register sweep (2026-09-18). The two concerns are split rather than the type narrowed (narrowing would have forbidden legitimate panel roles): the panel's `role` stays an unconstrained `string`, and the trigger's `aria-haspopup` hint is its own optional `haspopup` prop with the correct union. `<OriPopover role="group">` used to emit an invalid `aria-haspopup="group"`; now it does not, and the trigger bag type-checks against a real `<button>` — the old shape failed that assertion.

### ORI-I-45 — `--ori-size-action` follows a third, undocumented scoping rule — the alias is re-baked twice on the element, so a wrapper repoint is a silent no-op

`fixed` · severity `should-fix` · rebuttal `downgraded` · source: paired review 2026-09-18 (consumer/action-size-third-scoping-rule)

- **Where:** oriUI packages/css/src/sizes/_sizes-action.css:14; packages/css/src/components/button.css:20,146-148; docs/content/guides/customization.md:289-329; docs/content/guides/design-tokens.md:244; justpaint components/FloatingToolbar.vue:505-515
- **What:** customization.md:325 NAMES only "Radius and font-size" for a rule that equally governs the action-size family, and design-tokens.md:243-244 presents the `:root` default `--ori-size-action: var(--ori-size-action_text)` (packages/css/src/sizes/_sizes-action.css:14) as if a component read it, when no action component ever does — every block bakes over it (button.css:20). Cost: justpaint reached for `.bar__tool-wrap…
- **Fix:** Edit two sentences, change no CSS. In customization.md §5, rename the heading to "Size, radius and font-size" and add `--ori-size-action_<step>` to the raw-step example — with the caveat the skeptic omitted, that a wrapper repoint also retunes every other md action control in the subtree (inputs, selects), which is what you want for a tool cluster and wrong for a mixed panel. In design-tokens.md:243-244, say the…

- **Outcome:** Closed by the register sweep (2026-09-18). customization.md now names the action-size family in the scoping rule it always governed.

### ORI-I-46 — OriTooltip renders an `aria-describedby` it documents as non-functional, and the only consumer never wires the working path

`accepted` · severity `should-fix` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (consumer, missed-by-skeptic)

- **Where:** oriUI packages/vue/src/components/tooltip/ori-tooltip.vue:41-46; packages/vue/src/components/toolbar/ori-toolbar-toggle-item.vue:50 (`describedBy`); justpaint apps/web/src/components/ui/IconButton.vue:47-60
- **What:** ori-tooltip.vue:41 puts `:aria-describedby="bubbleId"` on `<span class="ori-tooltip__trigger">`, and the comment immediately below at :42-44 states why that cannot work: "aria-describedby only announces when the element bearing it is focused, and this wrapper span isn't focusable". So every OriTooltip ships a dead attribute in the DOM, and the relationship that actually announces is opt-in — the consumer must pull…
- **Fix:** Stop rendering the attribute where it cannot fire. Either drop `:aria-describedby` from the wrapper span (ori-tooltip.vue:41) and make the slot prop the single documented path, or — better — resolve it on mount: query the first focusable descendant of `.ori-tooltip__trigger` and set `aria-describedby` on it, falling back to the slot prop for full control. Do it before 1.0 because the `#default` slot's prop name…

- **Outcome:** Closed by the register sweep (2026-09-18). The register entry was wrong: the docs half was already correct — the page already says the wrapper `aria-describedby` does not announce. Nothing to fix.

### ORI-I-47 — 13 of the 20 types `@oriui/vue` exports are used by zero components, and the frozen ones are built with interface-then-`keyof` ceremony where a union would say it

`fixed` · severity `should-fix` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (consumer, missed-by-skeptic)

- **Where:** oriUI packages/vue/src/types.ts:3-42,44-56,60-75,83-84; packages/vue/src/index.ts:1 (`export * from './types'`); justpaint apps/web/src/components/ui/IconButton.vue:18
- **What:** `packages/vue/src/index.ts:1` re-exports the whole of types.ts, so all 20 exported names become public API at 1.0. Grepping packages/vue/src (excluding types.ts itself) for each one by word: `Sizes` 0, `BlockSize` 0, `ScreenSize` 0, `ActionSpaceSize` 0, `Size` 0, `CenterPosition` 0, `InlinePosition` 0, `BlockPosition` 0, `CustomPosition` 0, `Position` 0, `AnchoredSide` 0, `SeverityColor` 0, `DeepPartial` 0 —…
- **Fix:** Before the freeze, delete the 13 unreferenced exports (or, if any is wanted for consumer convenience, keep it deliberately and say so in the doc comment), and flatten the six size interfaces into plain string-literal unions — `ActionSize`, `RadiusSize`, `BlockSize` etc. read the same to a consumer and stop pretending to model a record. Cost now: one file, one type-check run, zero runtime. Cost after 1.0: removing…

- **Outcome:** Closed by the second register sweep (2026-09-18). 13 exported types that nothing in the library used are deleted (free pre-1.0), and the six size/colour types that stay are unions rather than interface-then-`keyof` ceremony.

### ORI-I-48 — `useToolbarToggleGroup` with `type: 'single'` is unconditionally deselectable, so a tool picker that must always have a selection is impossible — the only consumer guards it by hand

`fixed` · severity `should-fix` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (consumer, missed-by-skeptic)

- **Where:** oriUI packages/headless/src/vue/use-toolbar.ts:155-191 (options + `toggle`); justpaint apps/web/src/components/FloatingToolbar.vue:76-82, 110-113
- **What:** use-toolbar.ts:184 is `options.onChange(current === value ? undefined : value)` — clicking the pressed item in a single-select group always clears it, with no option to require a selection. `UseToolbarToggleGroupOptions` (use-toolbar.ts:155-162) exposes only `type`, `value` and `onChange`; the JSDoc at :156 states the intent ("'single' keeps one value (deselectable, like Radix)"), but a toolbar tool palette — the…
- **Fix:** Add `deselectable?: MaybeRefOrGetter<boolean>` (default `true`, preserving today's behaviour exactly) to `UseToolbarToggleGroupOptions` and gate use-toolbar.ts:184 on it, then surface it as a prop on `OriToolbarToggleGroup`. It is additive and therefore shippable in any 1.x — but the DEFAULT is what freezes, and `true` is the wrong default for the flagship use case: once 1.0 publishes, flipping it (or making…

## Docs generation & the CLI idea

- **Outcome:** Closed by the second register sweep (2026-09-18). `useToolbarToggleGroup` gained `deselectable` (default `true`, today's behaviour) in all three adapters. `false` guarantees a non-empty selection and means the same thing under `type: "multiple"` — the last remaining value cannot be removed — so it is never a silently ignored option, and a refused press fires no `onChange` at all rather than re-committing the value the group already holds.

### ORI-I-49 — The command the whole idea is named after cannot be published — the project already took a 403 on `oriui`

`fixed` · severity `blocker-for-1.0` · rebuttal `downgraded` · source: paired review 2026-09-18 (cli/npx-oriui-name-is-blocked)

- **Where:** IDEAS.md:232,236,240 vs DECISIONS.md:351-360; .changeset/config.json:5
- **What:** Three command strings in a parking-lot entry use an invocation form the npm registry will not serve (`npx oriui …`); the reachable published form is `npx @oriui/cli …`. Worth a one-line footnote cross-referencing DECISIONS.md:352 so the 403 is not rediscovered later. Nit, not a blocker; the lockstep argument should be dropped entirely.
- **Fix:** Correct the entry: the reachable forms are `npx @oriui/cli …` (published, joins or breaks the lockstep group) or an in-repo `node scripts/…` (neither). Cost of the correction: one edit. Cost of not making it: the idea gets picked up later and the name problem is discovered after the design is committed, since the 403 is recorded 120 lines away in a different file.

- **Outcome:** The IDEAS.md entry was rewritten against what the review proved, so the correction now lives where the idea does: the reachable command is `npx @oriui/cli …` or an in-repo script, never `npx oriui` (npm 403 on the unscoped name), cross-referenced to DECISIONS.md and ISSUES-OUTER.md ORI-O-04.

### ORI-I-50 — The shadcn copy-in model is architecturally incompatible with oriUI's own CSS extraction

`fixed` · severity `blocker-for-1.0` · rebuttal `upheld` · source: paired review 2026-09-18 (cli/copy-in-registry-incompatible-with-layer-split)

- **Where:** packages/vue/src/components/dialog/ori-dialog.vue:1-3 (128 lines, no `<style>`); packages/css/src/components/dialog.css:1; packages/css/src/layers.css:12; DECISIONS.md:330-349
- **What:** shadcn's registry works because a copied file is self-contained — the Tailwind classes travel inside it. oriUI deliberately made the opposite choice: DECISIONS.md:330 moved every component's CSS out of the SFC into `@oriui/css`. So `oriui add dialog` cannot produce a self-contained artefact. It produces a fork that still depends on two of the three packages, which is strictly worse than the import it replaces.
- **Fix:** Do not delete the shape — record why it is closed, in one sentence, with the citation: the SFC deliberately carries no styles (DECISIONS.md:330), so `add` cannot produce a self-contained file the way shadcn's Tailwind-inline components can. Then note the honest substitute that already exists and costs nothing: `@oriui/css` already exports `./components/*.css` per component (packages/css/package.json:29) and the…

- **Outcome:** The IDEAS.md entry was rewritten against what the review proved, so the correction now lives where the idea does: shape 1 is marked CLOSED architecturally — a copied SFC arrives with no styles, because component CSS deliberately lives in @oriui/css.

### ORI-I-51 — "Get the code in your own tree" already ships in the npm tarball

`fixed` · severity `should-fix` · rebuttal `downgraded` · source: paired review 2026-09-18 (cli/registry-value-already-shipped-via-files-src)

- **Where:** packages/vue/package.json:24-27; packages/css/package.json:15-18; packages/headless/package.json:13-16; .changeset/ship-sources.md
- **What:** A crude copy-out path exists (the published `src` tree in `node_modules`, explicitly inert and wiped by `npm ci`), which lowers the marginal value of a registry `add` command. It does not eliminate it, and it is not a documented consumer story.
- **Fix:** Record this in the IDEAS entry as the reason shape 1 is closed, not merely weighed. The honest framing is: oriUI already has a copy-out story (it costs one `cp` and is documented nowhere), and the cheap improvement — if anyone ever asks — is a docs paragraph titled "forking a component", not a second publish pipeline.

- **Outcome:** The IDEAS.md entry was rewritten against what the review proved, so the correction now lives where the idea does: the entry now states that a crude copy-out path already ships (the tarball publishes src), which is what lowered the marginal value of a registry command.

### ORI-I-52 — The "queryable agent surface" already ships — `/raw/**.md` is generated for every page and the project hasn't noticed

`fixed` · severity `should-fix` · rebuttal `upheld` · source: paired review 2026-09-18 (cli/raw-md-agent-surface-already-ships)

- **Where:** node_modules/@nuxt/content/dist/features/llms/module.js:11-14; docs/.output/public/raw/components/button.md (16 KB, generated 2026-09-18 12:45); docs/.output/public/llms.txt:103; IDEAS.md:244-247
- **What:** Shape 3's distinguishing promise over the static files — "a CLI makes it queryable" (IDEAS.md:247) — is already true today via plain HTTP. `@nuxt/content` auto-mounts a per-page raw-markdown endpoint, the static build emits one `.md` per page, and llms.txt already links them absolutely with descriptions. An agent that wants only the Button contract issues one GET for ~16 KB. It needs no binary, no MCP server, and no…
- **Fix:** Same conclusion, cheaper execution. `llms-full.txt` is already generated at build time and already contains exactly the per-component payload (props table, class table, a11y section). Rather than adding a `docs` copy step, emit the per-page markdown into the tarball from the artefact that already exists, and — the part their fix misses — make `/raw/` an explicit, recorded decision: an `llms` config opt-in plus a…

- **Outcome:** The IDEAS.md entry was rewritten against what the review proved, so the correction now lives where the idea does: shape 3 is marked as ALREADY SHIPPING via /raw/**.md and llms-full.txt — so the work is fixing that generator (ORI-I-53 / ORI-I-59), not building a second surface on top of a broken one.

### ORI-I-53 — The shipped agent surface is duplicated and entity-mangled — fix it before building a second one

`fixed` · severity `should-fix` · rebuttal `upheld` · source: paired review 2026-09-18 (cli/existing-llms-surface-is-broken-and-duplicated)

- **Where:** docs/nuxt.config.js:29-116 (the hand-authored `sections`, components list at :58-95); docs/.output/public/llms.txt:39 vs :103; docs/.output/public/llms-full.txt
- **What:** The artefact IDEAS.md:246 calls "the static prototype of exactly this" is materially defective in three ways, all cheap to fix and none of them fixed. Building a queryable CLI on top of a generator you have not yet debugged routes around the bug instead of fixing it — and adds a third hand-maintained copy to a set that already cannot keep two in sync.
- **Fix:** Their fix is right and I would add one thing they missed: deleting the hand-authored `sections` block does double duty. It removes the duplication _and_ eliminates one of the five per-component registries from their own finding 7 — the two findings share a single edit, which changes the cost/benefit of the scaffolder they went on to recommend. On the entities: `&#x2A;`/`&#x29;` is an MDC-to-markdown serialization…

- **Outcome:** Closed by the register sweep (2026-09-18). The hand-authored `sections` block is gone; each group is a query over the content collection, which is what actually removed the duplication (every page was listed twice) and also deleted a 34-entry component registry — the new RTL guide appeared in llms.txt with zero config edits.

### ORI-I-54 — "tests/tokens.contrast.test.ts is already that engine" is not true — it is a hardcoded vitest file

`fixed` · severity `should-fix` · rebuttal `downgraded` · source: paired review 2026-09-18 (cli/contrast-test-is-not-an-engine)

- **Where:** IDEAS.md:241 vs tests/tokens.contrast.test.ts:23-25, :45-58, :64-67
- **What:** A four-word accuracy fix: 'is already that engine' should read 'is the prototype of that check'. The reusable-module cost is real but only materialises if shape 2 is ever built.
- **Fix:** Either strike the claim or state the real cost: extracting a `checkSkinContrast(css)` into a published package means a real CSS parser (postcss is already a dependency of the css build), a test suite of its own, and — the freeze-relevant part — a _public input format_ for consumer skin files, frozen at 1.0. That is a package, not a weekend. If contrast-checking a custom skin is the actual user need, the cheapest…

- **Outcome:** The IDEAS.md entry was rewritten against what the review proved, so the correction now lives where the idea does: the claim that the contrast test is "already that engine" is struck; it is a vitest file with hardcoded paths and no exports, and the real extraction cost (a CSS parser plus its own suite) is stated.

### ORI-I-55 — The conventions a scaffolder would encode are inconsistent in the repo right now — and the real pain is five registries, not the file template

`fixed` · severity `should-fix` · rebuttal `downgraded` · source: paired review 2026-09-18 (cli/scaffolder-would-freeze-conventions-the-repo-contradicts)

- **Where:** REVIEW.md:67 and :84 vs CLAUDE.md "no `<style>` block"; packages/vue/src/components/index.ts; packages/css/src/styles.css:14-48; docs/app/plugins/oriui.ts:44; docs/app/layouts/default.vue:49-63; docs/nuxt.config.js:58-95
- **What:** REVIEW.md:67 is stale and REVIEW.md:84 undercounts the docs registries — both real, both cheap. The 'five hand-edited registries' pain is actually one silent list once existing CI gates and finding 5's own edit are accounted for, which is not enough to justify a scaffolder in any form, in-repo or published.
- **Fix:** Drop the scaffolder entirely and do three edits instead. (1) Fix REVIEW.md:67 to reference `packages/css/src/components/<name>.css` rather than a `<style>` block, and extend :84 to name the docs plugin, the sidebar and the content page. (2) Delete the hand-authored `sections` block in docs/nuxt.config.js (finding 5's edit, which removes a registry as a side effect). (3) Add `tests/docs.parity.test.ts` in the exact…

- **Outcome:** Fixed at the source rather than by scaffolding: REVIEW.md no longer describes an unscoped <style> block (SFCs ship none), and its docs checklist now names every registry a new component must appear in — the MDC registration, the sidebar and the nuxt-llms config — instead of only the first. The IDEAS entry records that a scaffolder should wait until the conventions settle, and belongs under Project improvements when it comes.

### ORI-I-56 — The "one consumer" premise is weaker than the entry states, and the ⭐ tag contradicts the legend

`fixed` · severity `should-fix` · rebuttal `downgraded` · source: paired review 2026-09-18 (cli/premise-check-the-one-consumer-is-four-releases-behind)

- **Where:** IDEAS.md:9, :39, :232, :249-251; C:/Users/markg/WebstormProjects/justpaint/apps/web/package.json:21-23
- **What:** The ⭐ on IDEAS.md:232 asserts a priority the entry's own closing paragraph refuses to assert; demote it to 🧪 until IDEAS.md:39 (the real composed screen) produces evidence. The version-lag observation should be dropped — it does not support the conclusion it is attached to.
- **Fix:** Demote the entry to 🧪 ("niche / experimental") until a real screen asks, or split it: keep the in-repo contributor scaffolder as a ◽ under "Project improvements" where it belongs (it serves contributors, not consumers, and so does not belong in a consumer-facing distribution discussion at all), and strike shapes 1 and 3 with the reasons above. The evidence that would flip this: justpaint (or mtp-tg) on current,…

- **Outcome:** The entry is demoted from ⭐ to 🧪 and its closing paragraph now matches its own verdict: the consumer story is served by the docs, llms-full.txt and @oriui/css, and the only piece still worth building is a contributor scaffolder.

### ORI-I-57 — The repo is in changesets pre-release mode; cutting 1.0 requires an explicit `changeset pre exit` that the runbook mentions only in passing

`fixed` · severity `should-fix` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (cli, missed-by-skeptic)

- **Where:** C:/Users/markg/WebstormProjects/vueinjar/.changeset/pre.json:2-3; RELEASING.md:13-14, :59
- **What:** `.changeset/pre.json` declares `"mode": "pre", "tag": "alpha"` and lists roughly 40 accumulated changesets — every one queued since alpha.1. This is the actual mechanical gate on the freeze the whole module discussion sits in front of, and the skeptic never opened it. RELEASING.md:13-14 explains that pre mode keeps versions at `1.0.0-alpha.N` and that `latest` "moves to the stable line when you exit pre mode", but…
- **Fix:** Add an explicit 'Cutting 1.0' section to RELEASING.md before the release: `changeset pre exit`, verify the collapsed 1.0.0 changelog reads coherently across all three packages, confirm the `fixed` lockstep group still bumps together, and state what happens to the stale `alpha` dist-tag. This is a half-hour of documentation that prevents the freeze itself going wrong.

- **Outcome:** Closed by the Tier-0 packaging work: RELEASING.md now carries the real cutover procedure — `changeset pre exit` as its own commit with nothing else in it, a curated 1.0.0 CHANGELOG (the accumulated alpha changesets are otherwise restated verbatim), and repointing the stale `alpha` dist-tag afterwards rather than deleting it. CONTRIBUTING.md no longer claims pre-mode publishes to the `alpha` tag.

### ORI-I-58 — `@oriui/css` exports `./components/*.css` as a wildcard, so at 1.0 every filename in that directory silently becomes a frozen public entry point

`fixed` · severity `should-fix` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (cli, missed-by-skeptic)

- **Where:** packages/css/package.json:29; packages/css/src/styles.css:16; IDEAS.md:13-17
- **What:** The exports map declares `"./components/*.css": "./dist/components/*.css"`. After 1.0 that makes each file's _name_ a compatibility promise — renaming, splitting or merging any component stylesheet is a breaking change to a subpath nobody has enumerated. The set is not the 34-component catalog either: `styles.css:16` imports `components/anchored.css`, a shared placement primitive that appears nowhere in the…
- **Fix:** Decide it deliberately rather than by wildcard. Either keep the pattern and record in DECISIONS.md that component CSS filenames are public API from 1.0 (which constrains future refactors), or replace the wildcard with an enumerated list of the intended entries — cheap now, because tests/css.entries.test.ts:48-53 already reads the directory and can assert the enumeration stays complete.

- **Outcome:** Closed by a decision plus a guard rather than by code: the wildcard stays (35 explicit export entries would buy the same guarantee at the cost of a hand-kept registry, which is the failure mode this repo keeps hitting), and `tests/css.entries.test.ts` now pins the exact set of public per-component entry names, so adding or renaming one is a visible public-API change in the diff. DECISIONS.md records the reasoning and the consequence that any partial emitted into `dist/components/` becomes public too.

### ORI-I-59 — llms.txt publishes 100+ absolute `/raw/**.md` URLs that no line of project config asks for

`fixed` · severity `should-fix` · rebuttal `raised in rebuttal` · source: paired review 2026-09-18 (cli, missed-by-skeptic)

- **Where:** docs/nuxt.config.js:10, :23-30; docs/.output/public/llms.txt:87-341
- **What:** The skeptic's finding 4 proposes closing shape 3 because `/raw/**.md` already ships — but neither they nor the project ever decided to ship it. docs/nuxt.config.js:10 enables `@nuxt/content` and `nuxt-llms`; the `llms` block at :23-30 configures `domain`, `title`, `description`, `full` and `sections`, and says nothing about raw markdown. The endpoint and the ~250 absolute `https://oriui.vercel.app/raw/...` links now…
- **Fix:** Before 1.0, make it a choice: opt into raw markdown explicitly in the `llms` config so the setting is visible in the repo, and add a short DECISIONS.md entry naming `/raw/**.md` as the public agent surface with its stability caveat. If the project is unwilling to promise those URLs, stop linking them absolutely from llms.txt. Either answer is fine; inheriting the commitment silently from node_modules is not.

## Unconfirmed — nobody has checked these

Raised by the completeness critic of the same review: areas no reviewer opened. Each needs a repro before
it earns a `confirmed` status — do not act on them as if they were findings.

- **Outcome:** Closed by the register sweep (2026-09-18). `/raw/**.md` is an explicit, commented line of config instead of an accident, and the link count went from 118 to 59 — one per page.

### ORI-I-60 — Nobody opened OriToaster: the live region is created together with its content, so toasts may never be announced

`fixed` · kind `unexamined-area` · source: paired review 2026-09-18 (completeness critic)

- **Why it matters:** Six reviews discussed useToast three times (React action identities, the Svelte twin, the module-level queue) and never once asked whether a toast is announced. packages/vue/src/components/toast/ori-toaster.vue is 30 lines and no reviewer cites it. The container it renders is `<transition-group tag="div" :class="['ori-toaster', ...]">` — no `role`, no `aria-live`, no…
- **How to check:** Open packages/vue/src/components/toast/ori-toaster.vue and confirm no aria-live/role on the transition-group. Then verify empirically rather than by reasoning: run the e2e harness in real Chromium with a screen reader (or assert via Playwright that the `.ori-toaster` element exists in the DOM before the first `toast()` call). Compare against Radix Toast's Viewport and…
- **Outcome:** confirmed and fixed — `.ori-toaster` now carries the live semantics itself.

### ORI-I-61 — Two modules independently recommend ungating the toolbar's pressed rule — the edit strips the background from any non-text variant toggle

`accepted` · kind `questionable-verdict` · source: paired review 2026-09-18 (completeness critic)

- **Why it matters:** The consumer module's opposed agent proposes 'one selector edit instead of the skeptic's two-part change: ungate toolbar.css:74-77 to `.ori-button[aria-pressed='true']`', to be done now. The vue module's opposed agent arrives at the same place independently ('move the toolbar's pressed rule into a component-layer `.ori-button[aria-pressed='true']` block as a LITERAL…
- **How to check:** Add `.ori-button[aria-pressed='true']` to a scratch stylesheet over the built packages/css/dist/styles.css, render one button per variant (fill/tonal/outline/text/plain) with aria-pressed=true in real Chromium, and read the computed background-color against the unpressed twin. If fill/tonal regress, the correct shape is a variant-aware pressed treatment (an inset ring plus a…

- **Outcome:** Not a defect to fix — a standing caution, kept deliberately. Two independent reviewers converged on ungating `toolbar.css`'s pressed rule to `.ori-button[aria-pressed='true']`; the rule was authored for the toolbar's `variant="text"` default, so ungating it as-is strips the background from every fill / tonal / outline toggle. Any future work on the toggle contract must measure computed `background-color` across all five variants in a real browser before touching that rule. This entry exists to make that trap cost one read instead of one regression.

### ORI-I-62 — The headline 1.0 promise — three adapters, one identical surface — is asserted in the docs and verified by no test

`fixed` · kind `cross-module-interaction` · source: paired review 2026-09-18 (completeness critic)

- **Why it matters:** docs/content/overview/installation.md:83 states 'The surface is identical across the three: same options, same prop bags, same ARIA', and README.md:55 repeats it ('same machines, same keyboard handling, same ARIA wiring; only the reactive wrapper differs'). That claim is what 1.0 freezes, and it spans the headless and packaging modules — so it fell between them. The headless…
- **How to check:** Write one table-driven test that drives each widget through all three adapters with identical options and diffs the normalized prop bags after case-folding React's casing — the same shape as the existing normalizeProps tests, one level up. Start with useTabs and useDisclosure, where the bags are pure data. Any key present in one adapter and absent in another is the finding;…

- **Outcome:** Closed by the Tier-1 batch: `tests/adapter-parity.test.ts` drives the same options through all three adapters for the five widgets behind the `HeadlessAdapters` contract and diffs the normalised prop bags, plus a compile-time block that makes option-interface drift a `test:types` failure. Coverage boundary stated in the file header: useToolbar / useColorPicker / useToast / useTheme / useToken are outside the contract and outside this test.

### ORI-I-63 — Nobody opened docs/app: the site's framework switcher knows only Vue and Svelte, four months after React shipped

`fixed` · kind `unexamined-area` · source: paired review 2026-09-18 (completeness critic)

- **Why it matters:** The cli module reviewed docs/nuxt.config.js and llms.txt in detail and never opened docs/app/. docs/app/composables/useOriFramework.ts:1 declares `export type Framework = 'html' | 'js' | 'ts' | 'vue' | 'svelte'` and :8 `export const FRAMEWORKS: Framework[] = ['vue', 'svelte']`; Example.vue:14-15 mirrors it in LABELS and ORDER. So the one interactive affordance the site has for…
- **How to check:** Open docs/app/composables/useOriFramework.ts and docs/app/components/Example.vue, then run `grep -rn '#react' docs/content/`. Decide whether React joins FRAMEWORKS (which means auditing every `::example` on the 20 headless pages for a #react slot and choosing what a styled-component page shows a React reader) or whether the honest 1.0 answer is a single 'oriUI in React/Next'…

- **Outcome:** Closed by the register sweep (2026-09-18). React joined the docs framework switcher, so the headless pages' React snippets are reachable tabs rather than dead prose.

### ORI-I-64 — Performance under real data was examined by nobody — and the headless review's own fix would make the combobox O(n^2)

`fixed` · kind `questionable-verdict` · source: paired review 2026-09-18 (completeness critic)

- **Why it matters:** The headless module's missed-item proposes dropping the `index` parameter from `getOptionProps(item, index)` and deriving it inside: 'derive `const index = collection.findIndex(i => i.value === item.value)` inside getOptionProps / getItemProps', rated should-fix with 'Cheapest now: after 1.0 ... narrowing it is a major'. The elegance argument is good and the cost analysis is…
- **How to check:** Benchmark before deciding: mount OriCombobox with 1k / 10k items, drive an arrow-key hold in the real-Chromium e2e harness and measure scripting time per keystroke, then repeat with the findIndex-inside variant. If the two-arg signature is kept for this reason, record it in DECISIONS.md so the next reviewer does not re-file it as ceremony; if it is dropped, pass a precomputed…

- **Outcome:** Closed by the verification batch: measured in real Chromium (`e2e/perf-collections.spec.ts`). The shipped two-arg getter is LINEAR — per-ArrowDown 3.0-3.8 ms at 1k and 36-39 ms at 10k (x11.4-12.2); mount 9-12 ms / 76-89 ms; filtering 1.7-2.5 ms / 16.4-21.8 ms. The deriving-the-index-inside-the-getter variant that ORI-I-08 proposes measures x31-50 at 10k (245 ms per keystroke in the CI run) — so that proposal is now refuted with numbers, not with an opinion. The guard asserts the 10k/1k ratio stays under 24, a threshold placed off CDP CPU-throttled runs (x4, x8) rather than guessed, and the quadratic variant is mounted through the library own `provideHeadless` swap seam so the counter-example stays honest.

### ORI-I-65 — The tree-shaking promise is written into the review bar and a changeset and measured by nothing

`fixed` · kind `unexamined-dimension` · source: paired review 2026-09-18 (completeness critic)

- **Why it matters:** REVIEW.md:88 requires 'tree-shakeable (importing one component doesn't pull the others)' and a shipped changeset asserts the same. The packaging skeptic noticed the gap and its opposed agent explicitly deferred it ('that needs a bundler and a second budget file, and it is a separate change'), so it ends the review cycle unexamined by anyone. The build shape looks right —…
- **How to check:** Add one size-limit entry with an `import` field — `{"import": "{ OriButton }", "path": "packages/vue/dist/index.js"}` — and a second for a component with no siblings, then compare against the 45 kB full-bundle number. If a single-component import lands anywhere near the full bundle, bisect with rollup's `--treeshake` output before the freeze rather than after.

- **Outcome:** Closed by the verification batch: tree-shaking is not broken — it is excellent, and now measured. Against a 13.79 kB ceiling (every export bundled), OriKbd is 215 B (1.6%), OriSkeleton 205 B, OriButton 968 B (pulls only the Icon and Spinner it renders), OriColorPicker 3.76 kB (5 siblings). Four `import`-based `size-limit` entries hold those numbers in CI, each carrying a `message` that says what broke if it fails.

### ORI-I-66 — RTL and i18n were examined by no reviewer, although the CSS shows RTL was an intended capability

`fixed` · kind `unexamined-dimension` · source: paired review 2026-09-18 (completeness critic)

- **Why it matters:** Not one of the six reviews contains the word RTL, yet the code says the project meant to support it: packages/css/src/components/badge.css:72 carries an explicit `.ori-badge-anchor:dir(rtl)` rule, anchored.css:20 comments that its alignment is 'RTL- and writing-mode-aware', and the blocks are otherwise disciplined about logical properties (margin-inline, border-block). Against…
- **How to check:** Run `grep -rnE '(border|margin|padding)-(left|right)|^\s*(left|right)\s*:' packages/css/src/` for the full inventory, then load the e2e harness with `<html dir="rtl">` and screenshot vertical tabs, the vertical divider, the badge anchor and each toast corner. Decide and document one line: either RTL is supported (and these become inline properties) or it is explicitly out of…

## Found while fixing the Tier-0 batch

- **Outcome:** Closed by the verification batch: `e2e/rtl.spec.ts` (39 assertions, real Chromium) renders the same markup under `dir=ltr` and `dir=rtl` and asserts real geometry. It found THREE defects, two of them fixed here — the switch thumb escaped its track under RTL by 13px (~37% of the track width) because `translateX(1em)` pushed it further along an already-reversed axis, and the vertical tabs rule sat on the outer edge while the selected indicator sat on the panel-facing edge. The divider was hygiene only (zero visual delta). The inventory is small because the package was already ~90% logical: 6 physical box properties, 4 of which (safe-area insets) are correctly physical. The third defect is the slider fill, now ORI-I-75.

### ORI-I-67 — tests/token.test.ts — `observeTheme` fires-twice case is flaky under full-suite load

`fixed` · severity `should-fix` · source: observed while gating the Tier-0 branch, 2026-09-18

- **Where:** tests/token.test.ts:128
- **What:** The MutationObserver case saw 1 of 2 expected callbacks once during a full `npm run test` (1075 ms), then passed on a re-run and passes every time in isolation. It is a timing flake, not a regression — but a flaky test in the gate erodes the meaning of a green run.
- **Fix:** Give the assertion a longer `vi.waitFor` window, or drive the observer deterministically (flush the microtask queue after each mutation) rather than racing a wall-clock wait.

- **Outcome:** fixed before the rc — a flaky gate makes a green run meaningless, and this one failed twice during release prep. Cause: a MutationObserver delivery is a macrotask in happy-dom, so on a loaded full-suite run (60 files, parallel workers) the default 1s `vi.waitFor` window was a wall-clock race, not a statement about behaviour. The four waits in tests/token.test.ts now share a 5s/20ms window; the assertions are unchanged, so the test still fails if the observer never fires. Three consecutive full-suite runs are clean.

### ORI-I-68 — The invalid-control border is the same failing contrast, one axis over

`fixed` · severity `should-fix` · source: raised by the Tier-0 contrast fixer, 2026-09-18

- **Where:** packages/css/src/components/input.css:116, select.css:118, textarea.css:116
- **What:** `border-color: var(--ori-color-danger)` on `[aria-invalid="true"]` is the same #b91c1c on the same dark surface — about 2.4:1, under the 3:1 WCAG 1.4.11 minimum for a UI-component boundary. The text axis was fixed; this one was deliberately left, and NOTES.md:203 already records the non-text axis as knowingly deferred.
- **Fix:** Follow the precedent already set at `_themes-variant.css:37`, where the outline variant moved its border to `--ori-color-text` for exactly this reason. One token per declaration.

- **Outcome:** Closed by the register sweep (2026-09-18). Both the invalid border and its focus ring moved from the raw role to `--ori-color-danger-text`, following the outline-variant precedent: 2.08–2.85:1 on every dark skin before, worst 6.53:1 after.

### ORI-I-69 — The real-engine contrast e2e never renders a form control

`fixed` · severity `should-fix` · source: raised by the Tier-0 contrast fixer, 2026-09-18

- **Where:** e2e/text-contrast.spec.ts (markup builder, ~lines 32-47)
- **What:** The Chromium contrast guard builds its probe markup from button / link / tag / alert / tabs only. Every form block — field, input, select, textarea, combobox — is outside it, which is the second reason the danger-as-text defect survived a suite that advertises executable AA coverage.
- **Fix:** Add a form row to the probe markup so hint, error and required text are measured in the real engine across every skin and both themes.

## Opened by the Tier-1 batch (2026-09-18)

- **Outcome:** Closed by the verification batch: the probe now renders field / input / select / textarea / combobox — label, required marker, hint, error and the control value — plus the open listbox (option, highlighted, selected, selected+highlighted), across every skin and both themes. 1760 readings per run against 880. Worst guarded form reading is 6.53:1 (error/required, sumi dark); the hint is the tightest at 4.87:1. A second test is a NEGATIVE control: it paints the pre-fix raw role and asserts every dark skin reads below AA, so the guard cannot rot into a green-but-blind state. Also corrected the probe itself, which had never declared a text colour on its surface and so measured inherited text against the UA default foreground — the most flattering value available.

### ORI-I-70 — Vue `useTheme` has the mirror-image teardown hole and no escape hatch

`fixed` · severity `should-fix` · source: Tier-1 svelte-theme agent, 2026-09-18

- **Where:** packages/headless/src/vue/use-theme.ts:41
- **What:** The Svelte twin was fixed to tie teardown to the component and to expose `destroy()` for module-scope callers. Vue relies on `onScopeDispose`, which also no-ops outside an effect scope — so a `useTheme()` called at module scope leaks its MutationObserver and matchMedia listener for the life of the page, and unlike Svelte there is no documented way to dispose it.
- **Fix:** Mirror the Svelte shape: keep `onScopeDispose` when there is a scope, return a `destroy()` for when there is not, and say so on the use-theme page. Additive, so it can land in any 1.x — but the asymmetry between two adapters of the same composable is exactly the kind of thing a parity test should eventually assert.

- **Outcome:** Closed by the register sweep (2026-09-18). Vue `useTheme` registers `onScopeDispose(destroy, true)` and returns `destroy()`, mirroring the Svelte twin. Recorded in DECISIONS.md.

### ORI-I-71 — Vue's `useTabs` takes a getter only, while every sibling takes `MaybeRefOrGetter`

`fixed` · severity `should-fix` · source: Tier-1 parity agent, 2026-09-18

- **Where:** packages/headless/src/vue/use-tabs.ts:40 against use-disclosure.ts:10, use-combobox.ts:14, use-menu.ts
- **What:** One composable in the Vue adapter demands `() => UseTabsOptions` where the others accept a plain object, a ref or a getter. A consumer who passes an object gets a type error with no hint that this one composable is different. This is the concrete, defensible half of the "five idioms" finding (ORI-I-04).
- **Fix:** Widen to `MaybeRefOrGetter<UseTabsOptions>` — widening a parameter type is not a breaking change, so it can land after 1.0, but the inconsistency is cheapest to erase before anyone writes code against it.

- **Outcome:** Closed by the register sweep (2026-09-18). `useTabs` widened to `MaybeRefOrGetter`, matching every sibling.

### ORI-I-72 — Svelte's `nativeDialog` publishes `dialogProps` as a static store

`fixed` · severity `should-fix` · source: Tier-1 parity agent, 2026-09-18

- **Where:** packages/headless/src/svelte/native.ts:73 against vue/native.ts:82
- **What:** Vue exposes `dialogProps` as a `computed` and React re-projects it on every render, so both track changing options; the Svelte adapter publishes a `readable({...})` built once. The parity test caught it as a shape difference, not as a wrong value, so nothing is currently broken — but a future option that must reach `dialogProps` reactively would silently not.
- **Fix:** Derive it from the same store the other members derive from. Verify against the parity test, which will then compare equal on structure as well as content.

- **Outcome:** Closed by the register sweep (2026-09-18). Svelte `nativeDialog` derives `dialogProps` like its siblings instead of publishing a static readable.

### ORI-I-73 — The headless `TabItem` is declared three times, once per adapter

`fixed` · severity `should-fix` · source: Tier-1 item-types agent, 2026-09-18

- **Where:** packages/headless/src/vue/use-tabs.ts:18, svelte/use-tabs.ts:15, react/use-tabs.ts:13
- **What:** The styled `TabItem` collision was resolved by deriving from the headless type — but the headless type itself exists in triplicate with no shared declaration, so the three adapters can drift apart silently. Same class of problem as ORI-I-07 (triplicated option interfaces), one level down.
- **Fix:** Declare it once in `core` and re-export from each adapter, the way the item types for combobox and menu already work. The new compile-time block in the parity test turns any future drift into a `test:types` failure, so this is now visible rather than silent — fixing it is cleanup, not urgency.

- **Outcome:** Closed by the register sweep (2026-09-18). `TabItem` is declared once in core and re-exported by each adapter.

### ORI-I-74 — Docs describe the collection item shapes inline instead of naming the exported types

`fixed` · severity `nit` · source: Tier-1 item-types agent, 2026-09-18

- **Where:** docs/content/components/tabs.md:377, select.md:430, accordion.md:315
- **What:** The four item types are exported from their barrels now, but the docs still inline the shape as `Array<{ … }>` and never say the type has a name or where to import it from — so a consumer still hand-writes the shape.
- **Fix:** Name the type in the props table and show the import line once per page. Pure docs, additive.

## Opened by the verification batch (2026-09-18)

- **Outcome:** Closed by the register sweep (2026-09-18). The four exported item types are named in the docs with their import line.

### ORI-I-75 — The slider fill is painted opposite its thumb under RTL

`fixed` · severity `should-fix` · source: RTL verification, 2026-09-18

- **Where:** packages/css/src/components/slider.css (the author-drawn fill), measured in e2e/rtl.spec.ts
- **What:** Chromium reverses a native `<input type=range>` under `dir=rtl` — a click 25% in from the physical left returns a value >= 50, so the engine treats the RIGHT edge as the minimum. The fill oriUI paints does not follow: sampling the painted pixels at 12% and 88% of the control width shows the accent on the left and the groove on the right in BOTH directions, so in RTL the fill sits on the opposite side from the thumb. ColorPicker inherits the same question through its two range inputs.
- **Fix:** Needs a decision, not a swap, which is why the RTL agent stopped: either mirror the fill under `:dir(rtl)` (matching the engine, so fill and thumb agree) or pin the whole control as physical and document it. The e2e spec already carries the measurement as a deliberate `test.fail`, so whichever way it is resolved, the test is the thing to flip.

- **Outcome:** Closed by the register sweep (2026-09-18). The owner chose to follow the engine: a `--ori-slider-axis` knob repointed by `.ori-slider:dir(rtl)` mirrors all three author-drawn tracks, so fill and thumb agree under RTL. The e2e `test.fail` became a real assertion.

### ORI-I-76 — Toast enter/leave animation is direction-blind and corner-blind

`fixed` · severity `nit` · source: RTL verification, 2026-09-18

- **Where:** packages/css/src/components/toast.css:169
- **What:** `transform: translateX(20px)` slides every toast in from the right, regardless of writing direction and regardless of which corner the toaster is pinned to — so a left-corner toaster in an LTR page, and every toaster in an RTL page, animates from the wrong side.
- **Fix:** Drive the offset from a custom property the corner modifiers set, and flip its sign under `:dir(rtl)`. Purely cosmetic and additive.

- **Outcome:** Closed by the register sweep (2026-09-18). The toast offset is a custom property the corner modifiers set, sign-flipped under `:dir(rtl)` — 14 new assertions cover the six corners in both directions.

### ORI-I-77 — The library ships no RTL story: nothing sets or reads `dir`, and no page mentions it

`fixed` · severity `should-fix` · source: RTL verification, 2026-09-18

- **Where:** docs/content (no page mentions RTL), packages/vue/src (no component reads `dir`)
- **What:** The CSS layer is now VERIFIED direction-aware in a real browser, and two of its parts are deliberately physical (the six toaster corners, the colour-picker value plane) while the rest mirrors. A consumer has no way to learn any of that: there is no RTL guide, no example, and the placement class names read physical while behaving logically (`.ori-anchored_left` resolves to `position-area: inline-start`, so it places to the physical right under RTL).
- **Fix:** One docs section: what mirrors, what stays physical and why, the logical meaning of the placement names, and the open slider question. The behaviour is already pinned by `e2e/rtl.spec.ts`, so the page is describing tested truth rather than intent.

- **Outcome:** Closed by the register sweep (2026-09-18). A guide section describes the RTL behaviour that `e2e/rtl.spec.ts` actually pins: what mirrors, what stays physical on purpose, the logical meaning of the physical-sounding placement names, and the slider fill following the engine.

### ORI-I-78 — The combobox "no results" message was 3.69:1

`fixed` · severity `should-fix` · source: found by the new form-contrast guard on its first run, 2026-09-18

- **Where:** packages/css/src/components/combobox.css (`.ori-combobox__empty`)
- **What:** `opacity: 0.6` on on-surface text measured 3.69:1 at worst (sumi light). Unlike a placeholder or a disabled option, the empty message is real informational content, so WCAG 1.4.3 applies to it.
- **Outcome:** faded to 0.7 — the same treatment a field hint carries — which measures 4.87:1 at worst, and the cell was promoted from the printed-but-not-asserted set into the guarded matrix. The guard found this on the first run it could see the element at all, which is the argument for the muted cells being printed rather than hidden in a comment.

## Accepted from the consumer inbound queue (2026-09-18)

Entries that arrived through justpaint's `docs/ISSUES-OUTER.md` — the first two the library took from that
queue rather than from its own review, which is the path working as designed.

### ORI-I-79 — The toast queue forces a close button the component itself defaults off

`fixed` · severity `should-fix` · source: justpaint JP-O-07, 2026-09-18

- **Where:** packages/headless/src/core/toast/queue.ts:83 against packages/vue/src/components/toast/ori-toast.vue:5
- **What:** `OriToast` declares `closable = false` and renders the × behind a `v-if`, which is right — but the queue stamped `closable: true` onto every item it enqueued, so the component default was unreachable and a caller who said nothing got a dismiss button anyway. Two defaults disagreed and the queue won silently.
- **Outcome:** the queue no longer stamps it, so the renderer's own default applies. One exception is kept deliberately: a toast with `duration: 0` never auto-dismisses, so it opts itself into a close button rather than becoming impossible to remove. The docs rows that documented the old behaviour are corrected, and both the core and the Vue tests now pin the new contract (they pinned the old one, which is why it survived).

### ORI-I-80 — A toast has no way to centre its text, and centring it naively lands off-centre

`fixed` · severity `should-fix` · source: justpaint JP-O-08 + the owner noticing it on screen, 2026-09-18

- **Where:** packages/css/src/components/toast.css, packages/vue/src/components/toast/{ori-toast,ori-toaster}.vue
- **What:** `.ori-toast__text` was `text-align: start` with no prop or token to change it. In a `top-center` stack carrying one-line status messages the text hugs the start edge of a fixed-width card and reads as misaligned. The naive fix is worse than none: `text-align: center` on a flex child centres the text on the space the dismiss button leaves behind, so it lands visibly off-centre — which is exactly what the owner saw.
- **Outcome:** `align` (`start` | `center`) on both `OriToast` and `OriToaster`, the latter forwarding to the whole stack because alignment is a stack-level look like `position`. Centred alignment takes the dismiss button out of the flex flow and reserves equal inline room on both sides, so the body centres on the CARD. `e2e/toast-align.spec.ts` measures the rendered centres in real Chromium in both writing directions, and carries a counter-example test that fails if the compensation is ever removed. A leading icon deliberately stays in flow — that is a different composition, and it is documented. Residual offset is 1.5px, which is the card's own 4px accent stripe, not the button.

### ORI-I-81 — Structural neutrals had no public handle

`fixed` · severity `should-fix` · source: justpaint JP-O-06 (the half the mechanism fix left open), 2026-09-18

- **Where:** packages/css/src/themes/_themes-color-tokens.css, and the twelve component stylesheets that hand-rolled a border mix
- **What:** the earlier sweep normalised the MECHANISM (everything derives from currentcolor) but left the numbers scattered — forty-odd ad-hoc percentages — so a consumer still had nothing to repoint and had to guess.
- **Outcome:** two tokens, `--ori-color-outline` (12%, the resting hairline) and `--ori-color-outline-strong` (28%, the interactive control edge), chosen from the measured distribution rather than invented: 12/14% and 28% were the two real clusters, and the 4-10% uses turned out to be background tinting, a different axis that would have made a single token lie. Documented on the design-tokens page with the repointing recipe, and guarded at source so a component cannot hand-roll one again. Writing the guard found four files the percentage sweep had missed.

### ORI-I-82 — The checkbox and radio box edge may not clear the 3:1 non-text bar

`unconfirmed` · severity `should-fix` · source: surfaced while introducing the outline tokens, 2026-09-18

- **Where:** packages/css/src/components/checkbox.css:66, radio.css:84 — `color-mix(in srgb, currentcolor 40%, transparent)`
- **What:** the unchecked box edge is the heaviest structural weight in the library and is deliberately excluded from the outline tokens, because dropping it to 28% would visibly weaken the affordance. But 40% of the ink on a white surface is roughly #999, which back-of-envelope lands near 2.8:1 — under the WCAG 1.4.11 3:1 minimum for a UI-component boundary. That is reasoning, not a measurement, which is exactly why it is filed as unconfirmed.
- **How to check:** add the unchecked checkbox and radio boundary to the e2e non-text contrast probe (the same harness that now measures the invalid-field border), across all eight skins and both themes. If it fails, the fix is a heavier edge or a dedicated token — not folding it into the existing two.

## Opened by the rc.18 publish (2026-09-18)

### ORI-I-83 — `changeset publish` packs the three packages in parallel, and their prepack builds fight over one dist

`fixed` · severity `blocker-for-1.0` · source: the 1.0.0-rc.18 release run (35370933866) half-publishing

- **Where:** package.json (the `release` script); packages/*/package.json (`prepack`, added by ORI-I-39); packages/headless/tsdown.config.js (`clean: true`); packages/vue/tsconfig.build.json (`"paths": {}`)
- **What:** ORI-I-39 gave every package a `prepack` hook that rebuilds it, so no command can ship a stale `dist`. The first release after that hook landed published `@oriui/css` and `@oriui/headless` at 1.0.0-rc.18 and **failed on `@oriui/vue`**, leaving the fixed lockstep group split across npm. `changeset publish` packs all three workspaces at once — the three `Publishing "…"` lines share a millisecond in the run log — and the builds those packs trigger are not independent: `@oriui/headless` builds with tsdown's `clean: true`, emptying `packages/headless/dist`, which is precisely where `@oriui/vue`'s declaration emit resolves `@oriui/headless` from (`tsconfig.build.json` sets `"paths": {}` on purpose, so the emitted `.d.ts` reference the published entry points rather than sibling sources). Overlapping packs therefore hand vue-tsc a directory being deleted underneath it. The failure is invisible twice over: npm runs lifecycle scripts non-foreground, so the actual TS2307 list went to `~/.npm/_logs/*-debug-0.log` and the workflow log carries only `npm error code 2`; and it is a race, so it reproduces on nothing local — `npm pack -w @oriui/vue` on its own always passes.
- **Repro:** `mv packages/headless/dist aside && (cd packages/vue && npx vue-tsc -p tsconfig.build.json)` → `error TS2307: Cannot find module '@oriui/headless/vue'` on every consumer file and **exit code 2** — the same code the runner reported.
- **Outcome:** The release path now publishes what it built instead of rebuilding while packing. `npm run release` still runs the full ordered build (`css → headless → vue`), then goes through `scripts/publish.mjs`, which runs `changeset publish` with `npm_config_ignore_scripts=true`; the parallel packs take the tarball off disk and never re-enter a build. That also makes the published artifact the exact one the gate built, weighed with size-limit, checked with publint/attw and smoke-installed — previously prepack rebuilt it _after_ all of those ran. `prepack` stays for RELEASING.md's manual fallback, where packages are packed one at a time and nothing races, which keeps ORI-I-39 closed. `tests/packaging.test.ts` pins both halves and fails if `changeset publish` is wired back in directly.

### ORI-I-84 — `<OriTabs>`'s fallback panel slot is cloned into every panel, duplicating `id`s into a hidden copy

`confirmed` · severity `should-fix` · source: justpaint JP-I-04 (they filed it against themselves; the API question is ours), 2026-09-18

- **Where:** packages/vue/src/components/tabs/ori-tabs.vue:104-107 — `v-for` over `tabs`, each panel rendering `<slot :name="panel-${tab.value}"><slot :tab="tab" /></slot>`
- **What:** the `#default` slot is a per-panel fallback, scoped with that panel's tab — documented, and right for a template that reads `{ tab }`. A template that ignores the scope is silently multiplied instead. Measured with two tabs and a login form in `#default`: **2 panels, 4 inputs, ids `email,password,email,password`, 2 distinct**. The sharp edge is not the extra DOM: `getElementById` (and therefore `<label for>`) resolves to the first copy in document order, which is the **hidden** panel whenever the active tab is not the first — measured `getElementById-lands-in-hidden-panel=true`. So the visible form's labels point at inputs nobody can reach, while `hidden` keeps the duplicates out of the a11y tree, which is exactly why it stays invisible until someone opens the inspector.
- **Done:** the docs stopped implying the fallback is free — the panel-slots section and the slots table now state that it renders into every panel, what that does to `id`s, and where genuinely shared content belongs. Two stale references to the pre-rename `#<value>` slot name were fixed in the same pass (component page prose + slots table), and the `useTabs` examples now prefix their own data-derived slot names rather than teaching the collision the rename fixed.
- **Open — the owner's call, because it changes public slot semantics:** (a) leave it, documented, and let `#panel-<value>` be the answer for anything with ids; (b) render the fallback only into the ACTIVE panel — one instance, no duplicate ids, no wasted mounts, and the scope is then always the active tab; costs the inactive panels their pre-rendered content, and costs uncontrolled per-panel DOM state (an unsent draft in a shared template) its survival across a tab switch. **Correction to an earlier claim here: this does NOT make the fallback inconsistent with named panel slots.** A `#panel-<value>` slot renders into exactly one panel — its own — so under (b) every slot in the component obeys one rule, one panel one content, where today the fallback alone is the exception that fans out; (c) warn in DEV when a non-empty `#default` meets more than one tab — cheap, but it cannot tell the documented use from the misuse, so it would cry on correct code. Recommendation: **(b)**, and it is free only while the line is rc. A shared template whose per-panel instances hold independent state is not a use worth protecting — that is what `#panel-<value>` is for.

### ORI-I-85 — `.ori-dialog__body` faded every dialog's contents below AA, controls included

`fixed` · severity `blocker-for-1.0` · source: justpaint JP-O-09 (measured on their login modal), 2026-09-18

- **Where:** packages/css/src/components/dialog.css — `.ori-dialog__body { opacity: 0.85 }`, over `packages/vue/src/components/dialog/ori-dialog.vue:123-124` (the element wraps the default slot)
- **What:** the fade was meant for explanatory body text but sits on the element that wraps the caller's ENTIRE slot, so it applied to buttons, inputs and links too — and multiplied with any fade a child carried of its own (`.ori-field__hint`'s 0.7 → 0.595). Reproduced independently in real Chromium across all eight skins and both themes: worst readings **3.35:1** (primary fill button label, luxury light), **3.95:1** (field hint, neutral light — the consumer's own number to two decimals), **4.14:1** (danger fill button). Dark themes passed, which is how it reached rc.
- **Why both guards missed it:** `tests/tokens.contrast.test.ts` walks token PAIRS and never renders, so a pair that is honestly AA (5.43:1 for that button) reads as fine; axe reads declared colours, not composited pixels; and every probe in `e2e/text-contrast.spec.ts` carried at most its own opacity — the comment above `readState` said as much ("the probes never put an opacity group around a painted background"). A container fade is a third kind of defect: the colours are right and the contrast is lost on the way to the screen.
- **Outcome:** the fade is gone. Hierarchy inside a dialog now comes from the title's size and weight, matching how the rest of the library expresses secondary text — a leaf class with its own tone (`__subtitle`, `__hint`), never a group fade over content someone else wrote. Worst reading inside a dialog is now 4.87:1 (sumi light, field hint). `e2e/text-contrast.spec.ts` gained a third test that measures a composited dialog body — 128 readings across skin × theme — so an ancestor fade cannot come back unseen. Audited the siblings while there: every other `opacity` in the component styles sits on a leaf (`__subtitle`, `__hint`, `__close`) or a disabled state, so this was the only ambient fade over a caller's slot.
