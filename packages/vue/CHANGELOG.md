# @oriui/vue

## 1.0.0-rc.19

### Minor Changes

- c769e57: **The public vocabulary now follows the industry plurality — every prop VALUE and the content prop
  are renamed.** This is the vocabulary pass the 1.0 freeze makes permanent; each item was measured
  against the API of thirteen libraries, and only the outliers moved. Ten concepts already matched
  (`variant`, `color`, `size`, `loading`, `disabled`, `open` / `defaultOpen`, `modelValue`, `as`,
  `outline`) and were deliberately left alone.

    **Migration — values.** Every one of these is interpolated into a class name, so each is also a
    `@oriui/css` class rename, and the colour is a public TOKEN rename:

    | Before                       | After             | Also renamed                                                                                                            |
    | ---------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
    | `color="warn"`               | `color="warning"` | `--ori-color-warn` / `-on-warn` / `-warn-text`, `.ori-color_warn`, `ToastColor`, `useToast().warn()` → `.warning()`     |
    | `variant="fill"`             | `variant="solid"` | `.ori-variant_fill`, `.ori-input_fill`, `.ori-textarea_fill`                                                            |
    | `variant="tonal"`            | `variant="soft"`  | `.ori-variant_tonal`                                                                                                    |
    | `radius="zero"`              | `radius="none"`   | `.ori-size-radius_zero`, `--ori-size-radius_zero`                                                                       |
    | `radius="rounded"`           | `radius="full"`   | `.ori-size-radius_rounded`, `--ori-size-radius_rounded`                                                                 |
    | `gap="zero"`                 | `gap="none"`      | `.ori-size-gap_zero`, `--ori-size-gap_zero`                                                                             |
    | `size="text"` (`ActionSize`) | `size="inherit"`  | `--ori-size-action_text`, `--ori-size-action-space_text`, `--ori-font-size_text`, `.ori-icon_text`, `.ori-spinner_text` |

    `warn` was the smallest-weight spelling in the whole audit (PrimeVue alone); `fill` exists in no
    library while `solid` is AntD + Chakra v3 + Radix Themes + Nuxt UI + Park UI; `tonal` is Material-3
    jargon only Vuetify exposes; `zero` is ours alone where `none` is the CSS keyword, and
    `radius="rounded"` read as "radius=radius" because `rounded` is the PROP name in Vuetify, PrimeVue
    and Chakra. The action-size step is `inherit` (MUI's word for the same step) rather than `inline`,
    because `OriIcon`, `OriSpinner` and `OriAvatar` each already ship an `inline` BOOLEAN whose class is
    `.ori-<block>_inline` — `size="inline"` would have silently switched them to `display: inline-flex`
    with a margin.

    **Migration — the content prop.** `text` becomes `label` on the components whose text names the
    control, which is what PrimeVue, Quasar and Nuxt UI all call it, and what oriUI's own collection
    items (`OriTabs`, `OriAccordion`, `OriSelect`) have always called it:

    | Component                                     | Before  | After       |
    | --------------------------------------------- | ------- | ----------- |
    | `OriButton`, `OriTag`, `OriKbd`, `OriDivider` | `text`  | `label`     |
    | `OriToolbarButton`, `OriToolbarToggleItem`    | `text`  | `label`     |
    | `OriToolbarButton`, `OriToolbarToggleItem`    | `label` | `ariaLabel` |
    | `OriAvatar`                                   | `text`  | `name`      |

    `OriAlert`, `OriCard` and `OriToast` keep `text`: there it is a message body paired with `title`,
    not a label — which is also how Vuetify names it. `OriAvatar.name` is the person the avatar stands
    for: it was never rendered verbatim, it drives the initials and the image `alt` (Chakra's word for
    the same prop).

    On the two toolbar components the old `label` was the accessible name of an icon-only button and is
    now `ariaLabel`, so the visible-text prop can be `label` like everywhere else. Under the old split
    `<OriToolbarButton label="New" />` with no icon and no tooltip rendered an **empty** button carrying
    only `aria-label` — a shape nothing would have caught, since an empty button with an accessible name
    passes axe. With `label` as the visible text it cannot happen.

    `aria-label` now falls back to `tooltip` only when nothing visible names the button: overriding a
    rendered label with the tooltip text would fail WCAG 2.5.3 Label in Name, and that collision became
    reachable for the first time with this rename.

    No aliases ship. One set of names, because a pair of spellings that reaches 1.0 never gets removed.

- 80a7bc2: **`OriMenu` renders separators — the grouping rule the headless tier already exported.** The menu
  machine has always declared `separator` in its anatomy, exported `separatorProps`
  (`role="separator"`, `aria-orientation="horizontal"`) and documented it on the `useMenu` page, while
  the styled `OriMenu` rendered it zero times and `menu.css` carried no separator class. The styled
  tier was poorer than the tier it sits on.

    Mark an entry in the `items` array:

    ```vue
    <OriMenu
        :items="[
            { value: 'new', label: 'New file' },
            { value: 'sep-1', separator: true },
            { value: 'delete', label: 'Delete' }
        ]"
    />
    ```

    The array is the model for this component, so a separator is an entry in it (PrimeVue's shape) rather
    than a slotted child. `MenuItem` gains `separator?: boolean`; a separator is not navigable and not
    selectable — the machine drops it from the roving set with the same predicate that drops a disabled
    item, so `ArrowDown` steps over it and `End` lands on the last real item even when a separator is
    last in the array. `label` on a separator is ignored; `value` is still the list key. New part class:
    `.ori-menu__separator`.

- e97161f: **A shared panel template is no longer duplicated into every panel — and `OriAccordion` gained
  per-section slots.** Two entries of the same defect, fixed in the shapes their components allow.

    **`OriTabs`** — the scoped `#default="{ tab }"` fallback used to render into every panel, so a
    template that ignored its scope was multiplied, `id` attributes included. With two tabs and a login
    form in `#default` the form existed twice, and `document.getElementById('email')` — therefore
    `<label for>` — resolved to the copy in the **hidden** panel whenever the active tab was not the
    first one, pointing the visible form's labels at inputs nobody could reach.

    The fallback now renders into the **active panel only**: one instance, always visible, and the
    `{ tab }` it hands out is always the selected tab. One panel, one content is now the rule for every
    slot in the component. What it costs: uncontrolled DOM state inside the shared template (an unsent
    draft, a scroll position) does not survive a tab switch — use `#panel-<value>` for that, which
    renders into its own panel whether or not that tab is selected.

    **`OriAccordion`** — gained `#panel-<value>` slots, the same vocabulary and the same `panel-` prefix
    rationale as `OriTabs`:

    ```vue
    <OriAccordion :items="items">
        <template #panel-returns>
            <OriField label="Order number"><OriInput v-model="order" /></OriField>
        </template>
    </OriAccordion>
    ```

    Until now `#default` was the only panel mechanism, so distinct content per section meant branching on
    `item.value` inside one shared template, and anything carrying an `id` was duplicated once per
    section. Worse than in Tabs: `multiple` keeps two sections open at once, where `<label for>` focuses
    the **visible** input of the wrong section. Tabs' remedy has no analogue — an accordion has no single
    active item — so the answer is the escape hatch. The fallback still fills the sections that have no
    named slot, and content is deliberately not gated on the open state: a closed `<details>` keeps its
    content in the DOM, which is what makes find-in-page expand it.

    **Both** now warn in DEV when a `#panel-<value>` slot matches no item — a typo, or an item that was
    removed. Vue never warns about an unconsumed slot, so that section silently fell back or rendered
    empty. The check is an exact match against the item values, so it cannot fire on correct code.

- 93eaf82: **The pre-1.0 accessibility queue, closed.** Seven recorded defects, one of them the only
  WCAG-normative failure in the register.

    **`OriTooltip` now meets WCAG 1.4.13 Content on Hover or Focus (Level AA).** It failed two of the
    three bullets. _Hoverable_ — the bubble was `pointer-events: none` with a gap to cross, so the pointer
    could never reach it (failure technique F95) and the text could not be selected, copied, or read by
    someone panning with screen magnification. It now takes pointer events while shown, and a transparent
    bridge covers the gap. _Dismissible_ — there was no Escape, because the component had no JavaScript at
    all. **It now has exactly one document listener for the whole page**, shared by every instance: on
    Escape, each tooltip asks the DOM whether it is the one showing and sets `data-ori-dismissed` on
    itself, which both show rules are gated on and which clears on `pointerleave` / `focusout`. The
    show/hide mechanism is still pure CSS. A standalone `@oriui/css` consumer gets Hoverable for free and
    wires the one listener themselves — the surface is that attribute.

    **A busy button is no longer dimmed like a disabled one.** `loading` renders the native `disabled`
    attribute, so the `opacity: .45` disabled dim applied to a button that is _working_, not inactive —
    reported by justpaint (JP-O-10) at **1.68:1** on a solid primary. WCAG's contrast exemption covers
    inactive components, not waiting ones. The dim now skips `[aria-busy='true']`; the pointer and
    keyboard blocking are unchanged. Measured after the fix at a worst of **4.91:1** across every role,
    skin and theme, and pinned by a new probe in the contrast guard.

    **A mixed checkbox looks mixed.** `:indeterminate` is a DOM property, so it reached the real input and
    assistive tech announced "mixed" — while the stylesheet drew the box from `:checked` alone and painted
    it empty. Sighted and non-sighted users were told different things. The mixed state now paints the
    checked fill with a horizontal bar.

    **`OriCombobox` no longer submits the form on Enter with the listbox open.** Enter was prevented only
    when an option was highlighted, and the machine clears the highlight on every keystroke — so after
    typing, Enter fell through to the real `<input>`. It is now prevented whenever the list is open; the
    list deliberately stays open, so "ArrowDown then Enter commits" is unchanged.

    **`OriDialog` announces its body as the dialog's description.** The headless layer has always
    published `descriptionProps`; the styled tier never bound it. Both halves now ship, and the
    `aria-describedby` appears only when there is body content to point at.

    Docs and comments: `field.md` named the two controls that are deliberately NOT field-integrated
    (`OriCheckbox`, `OriSwitch`) and what happens if you ignore that; a fabricated "APG ColorArea
    requirement" citation was replaced with what it actually is in both colour-picker adapters; and
    `OriMenu`'s deliberate divergence from APG's Menubar text on disabled items is now written down
    beside the code that does it.

- eea7717: **`variant="plain"` is now `variant="quiet"`, and its fade is the one that measures AA.**

    The name moved because `plain` means two different things in the libraries that ship it — "unstyled"
    in Chakra v3, "tinted" in Element Plus — while Adobe Spectrum's `isQuiet` names exactly this
    treatment: the quietest step, minimal chrome. `.ori-variant_plain` → `.ori-variant_quiet`.

    The fade moved because 0.5 was a guess and it failed WCAG AA on an **enabled** control (ORI-I-91,
    worst reading 2.33:1). The exemption the code leaned on covers INACTIVE controls; a `quiet` button is
    clickable. The replacement was solved rather than picked: for every role × skin × theme, the minimum
    alpha that keeps 4.5:1 was computed from the composite the browser actually performs
    (`fg*a + bg*(1-a)` in sRGB). 0.5 left **95 of 96** readings below AA, 0.75 left 23, **0.81 is the
    exact edge**, and **0.85** clears every reading with a worst of 4.95 — confirmed against the real
    rasteriser in `e2e/text-contrast.spec.ts`, which now **asserts** the quiet probe instead of excluding
    it as "intentionally muted".

    What the variant is for is unchanged, and is what separates it from `text`: the `quiet` mapping
    paints **no background of its own in any state**, where `text` paints a 10% role tint on hover and
    active. (A pressed toggle still gets a background — that is a cross-variant STATE rule, not part of
    the variant.) `quiet` restores
    full opacity on hover / `:active` / `[data-active]` as before.

### Patch Changes

- 50bc1b5: **Fix: `OriSlider`'s fill and readout follow the thumb again.** They were computed from `modelValue`,
  which the browser's own thumb does not wait for — so whenever the prop did not come back, the three went
  out of sync. Measured in the component: drag to 5 with `:model-value="75"` and no handler and the DOM
  value is `5`, while `--ori-slider-pct` stays `75%` and `showValue` prints `75`. An unbound
  `<OriSlider />` was worse: the thumb moved and the fill sat at `0%` forever.

    Both are realistic. Every live example on the docs site passes a one-way `:model-value`, and a bare
    `<input type="range">` works without any binding at all — which is the promise the rest of this component
    keeps, since it is native-first by design.

    The value now mirrors the element: an internal ref tracks what the input actually holds, an incoming
    `modelValue` writes into it, and the fill, the readout and the emitted value all read the mirror. A
    parent that updates late (a debounced handler) no longer fights the drag, and `v-model` is unchanged —
    a parent update still wins, which is pinned by a test alongside the other two modes.

- Updated dependencies [c769e57]
- Updated dependencies [0104b16]
- Updated dependencies [c91bdb0]
- Updated dependencies [80a7bc2]
- Updated dependencies [93eaf82]
- Updated dependencies [eea7717]
    - @oriui/css@1.0.0-rc.19
    - @oriui/headless@1.0.0-rc.19

## 1.0.0-rc.18

### Patch Changes

- 9d35ee8: **OriCard** drops the `image` prop. It was declared and typed on the component (and documented, with
  the admission "not yet rendered by the template") but read by neither the template nor
  `packages/css/src/components/card.css` — passing it did exactly nothing. A real hero image is a design
  task (an `.ori-card__image` block, aspect-ratio handling, a defined position in the `ori-card_row`
  flex mode), not a one-liner, so the prop goes rather than freezing an empty promise into the API.

    Removing a prop is breaking after 1.0 and free now: nothing in the repo or the docs passed `image`,
    and because it was never rendered no output can change. Consumers that did pass it lose only a
    silently-ignored prop — `image` now falls through to the root `<div>` as a plain attribute.

    A new card test probes **every** declared prop and fails if one changes nothing in the rendered DOM,
    so a declared-but-unrendered prop cannot be reintroduced unnoticed.

- 04c63bf: **The colour picker's two public custom properties are namespaced.** `--ori-hue` and `--ori-ink` sat in the
  library's shared `--ori-*` namespace while meaning something only inside one component — so a consumer (or a
  future token with a better claim to the name) could collide with them silently. They are now
  `--ori-color-picker-hue` and `--ori-color-picker-ink`, matching `--ori-color-picker-size` beside them.

    Breaking only for markup that wrote or read those names directly. The rename spans three packages in one
    commit, because the value is written by the headless composable (all three adapters), consumed by the
    stylesheet, and forwarded by the styled SFC — a partial rename would have left the area painting its
    fallback red.

- f82544e: Every collection-item type is now exported from the entry its component comes from, so a consumer can
  annotate the array they are about to pass instead of inlining a shape that will drift from ours:
  `AccordionItem`, `RadioOption`, `SelectOption` and `TabItem` were local interfaces inside their SFCs
  and are now public, and `MenuItem` — which `menu.md` had been naming in the props table all along — is
  re-exported from `@oriui/vue`, mirroring the `ComboboxItem` re-export the combobox barrel already had.
  Type-only additions: no runtime, no output and no shape changes.

    `TabItem` existed under one name in both packages with two different shapes — `@oriui/headless`'s
    behaviour-only `{ value; disabled? }` and the styled component's `{ value; label; disabled? }`. They
    describe the same thing (`<OriTabs>` hands its `tabs` array straight to `useTabs`), so the styled one
    now **derives** from the headless one — `interface TabItem extends HeadlessTabItem { label: string }`
    — rather than redeclaring it. The resolved shape is identical to before; what changes is that the two
    names are no longer independent, so they cannot drift apart once 1.0 freezes them. Renaming either
    side was the alternative and was rejected: `@oriui/headless` already publishes `TabItem` from its Vue,
    Svelte and React entries, and renaming the styled one would break the `ComboboxItem` / `MenuItem` /
    `ToastItem` naming symmetry consumers see on `@oriui/vue`.

- bc78e38: **Injection keys survive a duplicated package**, and the **adapter-swap contract is written down**.

    Every cross-package provide/inject seam was keyed by a module-scope `Symbol('…')`: `ORI_HEADLESS`
    (Vue and Svelte), the toolbar's root and toggle-group keys (Vue and Svelte), and `oriFieldKey` in
    `@oriui/vue`. A symbol is unique per evaluation, so two copies of a package in one install — a
    transitive duplicate, two lockfile entries in a monorepo, an exact pin that blocks hoisting — mint two
    different keys. The `provide` lands on one, the `inject` reads the other, and nothing reports it: a
    configured adapter silently reverts to the native engine, a toolbar item goes inert, a control inside
    an `OriField` quietly falls back to standalone wiring.

    All seven keys move to `Symbol.for('…@1')`, which interns them in the cross-realm registry so
    undeduped copies agree. The `@1` is the **major**, and must be bumped with it: the registry is global,
    so an unversioned key would also intern across majors, and during an incremental v1 → v2 migration a
    v2 provider would satisfy a v1 `inject` with a shape it was never typed against. Scoping to the major
    keeps duplicates of one major interoperable and lets two majors miss each other — the safe direction,
    since a miss falls back but a cross-major match hands over a foreign shape. No type-surface change.

    Separately, the swap promise now has a test that can falsify it. The existing swap tests build their
    fakes by spreading the native adapter, so every key the styled component reaches for is inherited from
    the implementation under test — a third-party adapter missing one would still have passed. New
    from-scratch fakes implement `MenuControl` / `ComboboxControl` without importing `nativeMenu` /
    `nativeCombobox`, drive `OriMenu` / `OriCombobox`, and pin each requirement twice: once passing, once
    omitting the key to show the silent breakage. What they were forced to emit is now an explicit MUST
    list in the `MenuControl` and `ComboboxControl` JSDoc — `triggerProps.id` (focus-return resolves the
    trigger by `getElementById`), `data-highlighted` plus a roving `tabindex` on the item bags (roving
    moves real DOM focus), `contentProps.tabindex`, and `inputProps.id` / `labelProps.id` (the combobox
    derives the input id, the hint/error ids and the listbox's `aria-labelledby` from them).

- 9c3cf30: Fix what the published tarballs actually contain:

    - **Ship the MIT license.** All three declared `"license": "MIT"` but no tarball carried the text — the
      LICENSE lived only at the repo root, which npm never reaches into. Each package now has its own copy
      (npm always includes a package-root `LICENSE`, so no `files` change was needed).
    - **Ship the changelog.** `CHANGELOG.md` is not part of npm's always-included set, so the changelog
      changesets generates every release never left the repo. It is now listed in `files`.
    - **`@oriui/css` ships `dist` only.** It was shipping 52 source files nothing could reach: unlike
      `@oriui/vue` / `@oriui/headless`, whose dist source maps resolve into `src`, the css package emits no
      maps and every export resolves inside `dist`. The tarball drops from 93 files / 63.4 kB to 43 / 33.2 kB.

- 793b2e1: Fix what the three manifests promise an installer:

    - **`@oriui/vue` takes its siblings as peers, not exact `dependencies`.** The exact pin looked like it
      guaranteed a matching CSS/component pair and could not: `npm i @oriui/vue@alpha.17 @oriui/css@alpha.16`
      exited 0 with alpha.16 on top and an unreachable alpha.17 nested inside `@oriui/vue` — new components
      rendering against old CSS, plus a duplicated module graph around `@oriui/headless`'s process-wide
      singletons, with no warning anywhere. As `peerDependencies` (`+ devDependencies` for the repo build)
      npm hoists one copy or refuses with `ERESOLVE` naming the conflict. npm 7+ auto-installs peers, so
      `npm i @oriui/vue` still brings all three at the right versions — only the mismatch case changes, from
      silent to loud. The ranges stay pinned to the exact lockstep version until 1.0, since `^` cannot match
      a prerelease.
    - **Node engine floors say what they mean.** `@oriui/vue` published `>=22.18.0`, copied from the tsdown
      build toolchain — a build requirement, not a runtime one. Both packages that ship executable JS now
      declare `">=22"`, the supported Node line; `@oriui/css` declares none, because a stylesheet has no
      runtime.
    - **Every package rebuilds on `prepack`.** `dist` is gitignored and untracked, and nothing but the root
      `release` script put a build inside a publish — so the manual `npm publish` path documented in
      RELEASING.md could ship an empty package from a clean checkout. `prepack` runs for both `npm pack` and
      `npm publish`, which makes the build unskippable whichever command is typed.

- 04c63bf: **The styled layer's public API, converged before the freeze.** Five shapes that a 1.0 would have
  frozen as-is — a collection item that disagrees with its four siblings, a slot namespace that can
  collide with itself, a prop bag that does not type-check where it is documented to be spread, and
  thirteen exported types nothing consumes. Each is breaking to change after 1.0 and free to change now,
  so they change now. Migration lines are inline below.

    **`AccordionItem.title` is now `AccordionItem.label`.** Four of the five collection-item shapes spelled
    the display string `label` (`TabItem`, `SelectOption`, `RadioOption`, `ComboboxItem`, and `MenuItem`'s
    optional one); `AccordionItem` alone spelled it `title` for the identical concept. One shape across the
    catalog means one source array can be mapped into whichever component renders it, instead of a rename
    per component.

    ```diff
    - const items = [{ value: 'shipping', title: 'Shipping' }]
    + const items = [{ value: 'shipping', label: 'Shipping' }]
    ```

    TypeScript rejects the old key outright. For callers it cannot reach — plain JS, JSON from an API —
    `<OriAccordion>` warns in DEV naming the offending items and the rename, because the symptom otherwise
    is an empty `<summary>` with nothing to grep for. The warning is compiled out of production builds.
    The `#title` slot keeps its name: it names a region of the markup (and the `.ori-accordion__title`
    element), not the item field.

    **`<OriTabs>` panel slots are now named `#panel-<value>`, not `#<value>`.** Panel slot names come from
    caller data — a tab's `value` — while `tab` and `default` are the component's own reserved slots, and
    Vue resolves both from one flat namespace. A tab whose value was literally `"tab"` therefore rendered
    the consumer's `#tab` template (the label renderer) inside its panel, twice over, with the panel's real
    content unreachable. Prefixing moves data-derived names into a namespace of their own, where no caller
    value can collide with a reserved one.

    ```diff
    - <template #account>…</template>
    + <template #panel-account>…</template>
    ```

    The `#tab` and `#default` slots are unchanged. A stale `#<value>` slot is a silent miss — Vue never
    warns about a slot nobody consumes — so OriTabs warns in DEV when it sees one, naming the new spelling.

    **`<OriPopover>` splits the panel's `role` from the trigger's `aria-haspopup`.** They were one value:
    `aria-haspopup` mirrored `role` unconditionally. But the two are not the same vocabulary —
    `aria-haspopup` accepts exactly `dialog | menu | listbox | tree | grid`, while a popover panel is
    legitimately a `group`, a `region` or a `tooltip`. So `<OriPopover role="group">` emitted
    `aria-haspopup="group"`, which is not a valid token, and typed the whole `#trigger` bag as carrying
    `'aria-haspopup': string` — which Vue's `ButtonHTMLAttributes` rejects, so `v-bind="props"` on a
    `<button>`, the documented usage, did not type-check. The one real consumer worked around it with
    `as Record<string, unknown>`, discarding type-checking on the entire bag.

    `role` stays `string` (narrowing it would forbid the valid panel roles above). A new optional
    `haspopup` prop carries the trigger's hint, typed as the ARIA popup union. It defaults to `role` when
    `role` happens to be one of the five popup types — so `role="menu"` still needs no second prop — and to
    `'dialog'` when it is not. Existing markup keeps its output except where the old output was invalid.

    **Thirteen unused types are removed and the rest are flattened.** `export * from './types'` made every
    name in `packages/vue/src/types.ts` public API. `Sizes`, `BlockSize`, `ScreenSize`, `ActionSpaceSize`,
    `Size`, `CenterPosition`, `InlinePosition`, `BlockPosition`, `CustomPosition`, `Position`,
    `AnchoredSide`, `SeverityColor` and `DeepPartial` were consumed by nothing — no component, no test, no
    docs page — and are gone. The seven that survive (`ActionSize`, `GapSize`, `RadiusSize`,
    `CenteredPosition`, `AnchoredPlacement`, `ThemeColor`, `Variant`) are unchanged in meaning, but are now
    written as the string-literal unions they always were, instead of an `interface` whose keys were read
    back out with `keyof` — a record whose values nothing ever used. `AnchoredSide` still exists as a
    private building block of `AnchoredPlacement`; it is simply no longer exported on its own.

    **`<OriMenu>`'s `#trigger` slot now exposes `open` alongside `props`**, matching `<OriDialog>`'s trigger
    slot, so the two overlays read alike at the call site (`#trigger="{ props, open }"` to rotate a caret or
    swap a label). Additive; the `props` bag already carried `aria-expanded` for assistive tech, and this
    exists so a caller can render with the state instead of parsing an ARIA string out of the bag.

    New tests pin all five: the reserved-slot collision (a tab valued `"tab"` and one valued `"default"`),
    both DEV migration warnings and their false-positive guards, the `aria-haspopup` fallback across every
    role in and out of the popup vocabulary, and — in `tests/types.test.ts` — the exported type surface
    itself, including an assertion that the popover trigger bag is assignable to `ButtonHTMLAttributes`,
    which fails against the previous version.

- f36d7bd: **OriInput / OriSelect / OriTextarea / OriCombobox** no longer delete a caller's `aria-describedby`.

    The four text controls run `inheritAttrs: false` and promise that arbitrary native attributes fall
    through to the underlying control. `aria-describedby` was the one exception: the template bound
    `v-bind="$attrs"` first and `:aria-describedby="describedBy"` after it, so Vue's `mergeProps`
    overwrote the caller's value with the component's own — and with `undefined` when the control
    rendered no hint and no error. `<OriInput aria-describedby="form-note" />` emitted no
    `aria-describedby` at all, silently dropping a description a screen-reader user depends on.

    The caller's id is now folded into the same id list the components already build for their hint /
    error and the `describedby` prop, so the two are **joined** instead of one clobbering the other —
    matching what a native `<input>` would do if the attribute were simply forwarded. The same applies
    inside an `OriField`: the field's `aria-describedby` and the caller's are joined rather than the
    field's winning. Nothing else changes — controls that render a hint or an error and get no
    `aria-describedby` from the caller produce exactly the value they did before.

    Each of the four components gains a test asserting a caller-supplied `aria-describedby` both
    survives on its own and is joined with the component's own hint id.

- 13e6fd2: **Toast: an alignment axis, and the queue stops overriding the component's own `closable` default.** Both
  came in from a consumer's outbound queue rather than from the library's own review, which is the first time
  that path produced fixes.

    `OriToaster` and `OriToast` gain `align` (`'start'` — today's look — or `'center'`). Centred alignment
    centres the body on the **card**: the dismiss button leaves the flex flow and the card reserves equal inline
    room on both sides. Done naively, `text-align: center` centres the text on the space the button leaves
    behind, which lands visibly off-centre — that asymmetry is the reported defect, and `e2e/toast-align.spec.ts`
    measures the rendered centres in real Chromium, in both writing directions, with a counter-example test that
    fails if the compensation is ever removed. A leading icon deliberately stays in flow.

    `closable` is no longer stamped onto every queued toast. `OriToast` declares `closable = false`, but the
    queue forced `true` onto everything it enqueued, so the component default was unreachable and a caller who
    said nothing got a dismiss button anyway. The queue now leaves the option alone — with one exception it is
    worth keeping: a toast with `duration: 0` never auto-dismisses, so it opts itself in rather than becoming
    impossible to remove.

    Migration: if you relied on every `useToast()` toast having a close button, pass `closable: true` (or set it
    once at your call sites). The behaviour change is visible, not silent.

- f36d7bd: **OriToaster** now carries the live-region semantics on its container, so polite toasts are actually
  announced. Previously the only live region in play was the toast card itself (`role="status"`, or
  `role="alert"` for `color="danger"`) — and that element is created together with its text. Assistive
  tech reports mutations _inside_ a region it was already tracking; a region that first appears already
  holding its content is not announced. `role="alert"` is the documented exception most screen readers
  honour, which is why `error()` toasts announced and `success()` / `info()` / `warn()` / plain ones
  silently did not.

    The `.ori-toaster` container was already rendered from mount and already empty until the first push —
    it was simply semantically inert. It now gets `aria-live="polite"` plus `aria-atomic="false"`, so each
    push is a mutation inside an established region, and only the new toast is read rather than the whole
    stack being re-announced. Per-toast roles are untouched: a `danger` toast still renders
    `role="alert"` and keeps its assertive urgency, and standalone `<OriToast>` is unchanged.

    No visual, DOM-structure or API change — two attributes on a container that was already there.
    `aria-relevant` stays at its default (`additions text`), so dismissing a toast announces nothing.

    The regression test mounts `<OriToaster>` with an empty queue and asserts the region exists, is empty
    and carries the live attributes _before_ any toast is pushed — the case the previous tests missed,
    because they only checked that role strings were present once a toast already existed. A second test
    pins the region's node identity across a push, so gating the container on `toasts.length` would fail.

- 793b2e1: **The toggle-button contract, and three states that only looked real.**

    **`OriButton` gains `pressed`** — the toggle STATE (`aria-pressed`), next to the existing `active`,
    which stays what it always was: a forced `:active` LOOK (`data-active`). Like `OriToolbarButton`'s
    `pressed` and `OriDialog`'s `open`, it defaults to `undefined` rather than `false`, so a plain action
    button renders no `aria-pressed` at all. Before this, a toggle built on `OriButton` announced nothing
    to assistive technology, and the toolbar's own `aria-pressed` wiring is unchanged (it passes the
    attribute through, which still wins over the new binding).

    **The pressed look is no longer gated behind `.ori-toolbar`.** It moves from `toolbar.css` into
    `button.css` and is now keyed on the button alone, so any toggle gets it. It is deliberately NOT the
    flat ungate that suggests itself: a literal `background-color` on `.ori-button[aria-pressed='true']`
    beats the variant token and repaints `fill` and `tonal` toggles with a neutral grey (measured in
    Chromium: a pressed `fill` button went from `rgb(3, 105, 161)` to an 18% near-black tint). Instead the
    universal affordance is an inset hairline in `currentcolor` — no variant touches `box-shadow`, and the
    button's own label colour is contrast-paired with whatever background sits under it — and the neutral
    tint is added only for `text` / `plain` / `outline`, the three variants whose background is
    transparent. A toolbar button (`variant="text"` by default) renders exactly the same tint it did
    before; `fill` and `tonal` toolbar toggles stop being flattened. A source-level test fails if the rule
    is re-gated behind an ancestor, or if a pressed background ever reaches a variant that owns its own.

    **`<OriCard disabled>` is now `inert`.** It used to be `aria-disabled` on a role-less `<div>` plus
    `pointer-events: none` — announced to nobody (a role-less `<div>` is `role=generic`) and no obstacle
    at all to the keyboard: buttons and links inside stayed focusable and Enter-activatable. With `inert`
    (Baseline 2024) Chromium drops the whole subtree from the accessibility tree, refuses focus and
    refuses hit-tested clicks. `aria-disabled` stays as the CSS-layer styling hook.

    **`loading` on a non-`button` `OriButton`** (`as="a"`, a router link) no longer relies on
    `pointer-events: none`, which never stopped the keyboard — Enter on a focused link still navigated.
    It now renders `aria-disabled="true"` and blocks activation with the same capture-phase guard
    `OriToolbarButton` already uses. The control stays focusable and simply refuses, and a real `<button>`
    is untouched (its `disabled` attribute stops the event at the source).

    **Checkbox / switch / radio dim from the real control state.** Their disabled look was driven only by
    a prop-driven modifier class, so a control disabled by a surrounding `<fieldset disabled>` — or by a
    hand-written `disabled` attribute in the CSS layer — was inert but rendered fully enabled. The
    stylesheets now also match `:has(<input>:disabled)`; the modifier class stays for compatibility.

- Updated dependencies [04c63bf]
- Updated dependencies [793b2e1]
- Updated dependencies [983b821]
- Updated dependencies [04c63bf]
- Updated dependencies [793b2e1]
- Updated dependencies [9d35ee8]
- Updated dependencies [f36d7bd]
- Updated dependencies [bc78e38]
- Updated dependencies [793b2e1]
- Updated dependencies [04c63bf]
- Updated dependencies [9c3cf30]
- Updated dependencies [793b2e1]
- Updated dependencies [a61c497]
- Updated dependencies [e8265d6]
- Updated dependencies [16a5a16]
- Updated dependencies [a61c497]
- Updated dependencies [13e6fd2]
- Updated dependencies [793b2e1]
    - @oriui/css@1.0.0-rc.18
    - @oriui/headless@1.0.0-rc.18

## 1.0.0-alpha.17

### Patch Changes

- Updated dependencies [f6d1016]
- Updated dependencies [d79d76d]
    - @oriui/headless@1.0.0-alpha.17
    - @oriui/css@1.0.0-alpha.17

## 1.0.0-alpha.16

### Minor Changes

- 7e4e397: **New headless `useTabs` composable (Vue + Svelte).** The WAI-ARIA tabs behaviour — automatic-activation
  roving tabindex, defensive selection resolution (recovers to the first enabled tab), and the
  tablist / tab / tabpanel ARIA prop bags — now lives in `@oriui/headless`: `useTabs` ships from both
  `@oriui/headless/vue` (returning computeds) and `@oriui/headless/svelte` (returning stores), reusing the
  shared `core/roving` index math with its skip-disabled predicate. `OriTabs` is rewritten to consume it —
  **identical DOM, classes, and keyboard** — closing the last styled component that hand-rolled its behaviour
  instead of sitting on a headless core. Additive: a new optional `label` prop on `OriTabs` (and
  `label` / `labelledby` options on `useTabs`) names the tablist via `aria-label` / `aria-labelledby`, which
  WAI-ARIA recommends.

### Patch Changes

- bbc937d: **New headless `useDismissable` (Vue + Svelte)** — the shared "close the overlay on an outside interaction"
  layer for non-platform overlays, the pattern Radix `DismissableLayer` / Floating-UI `useDismiss` standardise.
  While `enabled`, it attaches `document` listeners and calls `onDismiss()` when an interaction lands outside the
  overlay's elements; each overlay picks its strategy — `pointerDownOutside` (a menu) or `focusOutside` (a
  combobox). Built on a new pure `isTargetOutside(target, elements)` predicate exported from `@oriui/headless`.

    `OriMenu` now uses it for outside-pointerdown (replacing a hand-rolled `document` listener) and `OriCombobox`
    for outside-pointerdown + focus-out (replacing the input's `@blur`) — **behaviour-preserving**, and it moves the dismiss glue out of
    the styled SFCs into the headless layer so a Svelte consumer of `useMenu` / `useCombobox` can wire the same
    close behaviour. (Popover / Dialog dismiss via the native `[popover]` / `<dialog>` top-layer; Escape stays in
    the core connects.)

- d1163d0: **Toast behaviour moved into `@oriui/headless` (Vue + Svelte).** `useToast` — the imperative toast queue —
  now ships from `@oriui/headless/vue` and, new, `@oriui/headless/svelte`, backed by a framework-agnostic core
  queue engine (`createToastQueue`; kept out of the core barrel so it never weighs on the 1 kB core budget,
  and projected into a Vue reactive array / a Svelte readable store). **Non-breaking:** the `@oriui/vue` path is
  unchanged — `import { useToast } from '@oriui/vue'` still works and shares the one queue (it re-exports the
  Vue adapter). The change is that the behaviour is now a shared headless composable with Svelte parity,
  closing the last styled component whose composable lived in the styled package. Adds a `useToast` docs page.
- Updated dependencies [9448620]
- Updated dependencies [bbc937d]
- Updated dependencies [7e4e397]
- Updated dependencies [d1163d0]
    - @oriui/headless@1.0.0-alpha.16
    - @oriui/css@1.0.0-alpha.16

## 1.0.0-alpha.15

### Minor Changes

- 9d2cc42: **OriColorPicker now submits its color in a form.** A new `name` prop (with an optional `form`) renders
  a hidden input carrying the current color, so a color picker joins native form submission like
  `<input type="color">` — and, unlike a combobox, it always has a value (a color control has no empty
  state), so it submits its current color even before the user interacts. The submitted string uses the
  picker's emitted `format` (hex / rgb / hsl, with alpha when enabled); a disabled picker is excluded from
  submission, matching a native disabled control. `useColorPicker` gains a `value` accessor — the canonical
  current color in the emitted format — to back it. Purely additive: behavior is unchanged unless you pass `name`.
- db9ffee: **Combobox, Slider, RadioGroup, and ColorPicker now compose with `OriField`** — like Input / Select /
  Textarea already did. Nested in an `OriField`, each adopts the field's id and `aria-describedby` /
  `aria-invalid` / `disabled` (plus `required` + `size` where the control has them) and stops rendering
  its own label / hint / error, so there is one wired-once label and helper. Group and composite controls
  (RadioGroup, ColorPicker, and the Combobox listbox) name themselves via `aria-labelledby` pointing at
  the field's label — for which `OriField` now exposes a `labelId` on its context. Standalone behavior is
  unchanged (field integration is opt-in by nesting).

### Patch Changes

- df3e253: **Fix: a disabled OriColorPicker now also disables its hex field.** The hex `OriInput` bound only the
  local `disabled` prop, not the composed `isDisabled` (local **or** field-disabled) the sliders,
  eyedropper, and hidden input already use — so inside a disabled `OriField` (or any field-driven disable)
  the hex text field stayed enabled and a keyboard user could type a color, blur, and mutate the picker
  while it was meant to be disabled. It now binds `isDisabled`, matching the other controls.
- aeddf1a: **OriCombobox now submits the selected value, not the visible label.** The visible `<input>` shows the
  option label, so a native form previously submitted that label text under the field name. `name` (and
  an optional `form`) is now a real prop that renders a hidden input carrying the selected **value**; the
  visible input no longer receives `name`. A disabled combobox is excluded from submission, matching a
  native disabled control. Purely additive — behavior is unchanged unless you pass `name`.
- 377160d: **OriCombobox: keyboard users can now clear a selection.** The `clearable` clear button is a pointer
  affordance (`tabindex="-1"`), leaving keyboard-only users with no way to remove a committed selection
  (WCAG 2.1.1). Pressing **Escape** while the listbox is closed now clears the selection when `clearable`
  is set; Escape while the listbox is open still just closes it.
- 78cc170: **OriCombobox `required` now guards the selection, not the typed text.** `required` was set as the
  native attribute on the visible input, whose value is the option label/query — so typing a non-matching
  query satisfied `required` while the form submitted an empty value (and a bound value absent from
  `options` wrongly blocked submission). `required` now drives `aria-required` + custom validity keyed to
  whether a value is committed, so the field is invalid until a real option is selected. The optional
  `form` prop is also applied to the visible (validation) input, not only the hidden value input, so a
  combobox rendered outside its target form still participates in that form's validation.
- Updated dependencies [7ddfb16]
- Updated dependencies [9d2cc42]
    - @oriui/css@1.0.0-alpha.15
    - @oriui/headless@1.0.0-alpha.15

## 1.0.0-alpha.14

### Patch Changes

- 5e28b7c: Catalog consistency polish:

    - **OriSlider** and **OriCombobox** gain a `#label` slot (the `label` prop is the fallback), matching
      OriField — so a standalone control can take a rich label (an icon + text) while keeping the label
      `for`/`id` and the combobox listbox `aria-labelledby` wiring intact.
    - The combobox listbox and the toast card now read a baked `--ori-size-radius` alias (two-tier) rather
      than the raw scale token, so a consumer `.ori-size-radius_*` utility can retune their corners — matching
      menu / popover / card. Defaults are unchanged.

- 36a5dcc: **OriColorPicker** — accessibility + correctness fixes:

    - The saturation/value area's two visually-hidden range inputs each own one axis now
      (saturation = horizontal keys, brightness = vertical + `aria-orientation`), so every
      arrow keystroke changes the focused slider's own value and a screen reader announces it —
      Up/Down on the saturation slider no longer silently moves brightness. `aria-valuetext`
      now carries the resulting colour, not just the bare axis percentage.
    - The external-value echo-guard formats with the alpha flag, so with `alpha` on the working
      colour is no longer re-parsed (re-quantised through 8-bit RGB) on every tick — the visible
      ~1% grid on `rgb()`/`hsl()` output is gone.
    - A disabled picker's preset swatches are inert to the keyboard too now (a real `disabled`
      attribute plus guarded click/keydown handlers); `pointer-events: none` had only blocked
      the mouse, leaving them Tab-focusable and Enter-activatable.

- 080571c: OriColorPicker polish + SSR-safety:

    - The preset listbox seeds its roving Tab stop onto the **selected** swatch (APG) and follows external
      colour changes, instead of always starting at index 0.
    - The hue slider caps at **359** so dragging to the end no longer wraps the thumb back to 0; the hue and
      alpha sliders announce a self-describing `aria-valuetext` (`225°` / `50%`).
    - An invalid hex entry surfaces an **accessible error** (`role="alert"` + `aria-describedby`), not just a
      silent `aria-invalid` flip.
    - The eyedropper trigger is **SSR-safe** — feature-detected after mount, so it no longer causes a
      hydration mismatch — and is sized to match the 2rem preview swatch.
    - The alpha **checkerboard is theme-aware** (a mid-neutral in dark mode rather than a glaring light grid),
      the area / hue / alpha focus rings use a neutral high-contrast double ring, and the preset chips get
      more gap so the selected ring clears its neighbour.
    - Panel corners now read component-local radius aliases; dropped the inert `label` option from
      `useColorPicker`.

- bf4b762: `OriDialog` now has a robust accessible name. The title `<h2>` renders only when a `title` prop or
  `#title` slot is supplied — previously a titleless dialog was "labelled" by an empty heading, giving it
  an empty accessible name. Stray attributes (including `aria-label`) are now forwarded to the `<dialog>`
  element (`inheritAttrs: false`), so a titleless dialog can be named with `aria-label`; the adapter's own
  a11y props are still applied verbatim. A dev-only warning fires when a dialog opens with no accessible
  name (title / `#title` / `aria-label`).
- 924018a: `resolveRovingIndex` (core) gains an optional `isEnabled(index)` predicate: when supplied it **skips**
  indices it rejects, scanning on in the intent's direction — the Tabs / RadioGroup model — while the
  default (no predicate) keeps the toolbar's single-step behavior that **visits** disabled items. `OriTabs`
  now composes the shared `rovingIntent` / `resolveRovingIndex` core helpers instead of hand-rolling its
  roving math; behavior is unchanged and the flagship Toolbar is untouched.
- a661654: `@oriui/vue`'s shipped type declarations now resolve under `moduleResolution: node16` / `nodenext`, not
  just `bundler`. `vue-tsc` emits extensionless relative specifiers (`from './types'`, directory
  `from './components'`, `.vue` re-exports) that strict node16/nodenext consumers reject (TS2834); a
  post-build step (`scripts/fix-dts.mjs`) now rewrites them to explicit `.js` / `/index.js` paths. Verified
  with a nodenext consumer typecheck and `@arethetypeswrong/cli` (node16-from-ESM is green). No runtime or
  API change. (`@oriui/headless` was already node16-clean; `@oriui/css` ships no declarations.)
- c76d76b: Packaging hygiene for `@oriui/vue`:

    - `sideEffects` is now `false` (was `["**/*.css"]`, which matched nothing — the package ships no CSS, it
      comes from `@oriui/css`), giving bundlers a clean tree-shaking signal so importing one component pulls
      no others.
    - The `vue` peer range is raised to `^3.5` to match the actual API floor (the SFCs use reactive props
      destructure) and `@oriui/headless`'s peer, so a Vue 3.4 consumer gets a correct peer warning instead of
      an unsupported runtime.

- Updated dependencies [5e28b7c]
- Updated dependencies [36a5dcc]
- Updated dependencies [080571c]
- Updated dependencies [0b377dc]
- Updated dependencies [55a7579]
- Updated dependencies [924018a]
    - @oriui/css@1.0.0-alpha.14
    - @oriui/headless@1.0.0-alpha.14

## 1.0.0-alpha.13

### Minor Changes

- 8af0a98: ColorPicker — an accessible, dependency-free color picker.

    - **`@oriui/vue`**: `OriColorPicker` — an inline panel with a 2D saturation×brightness area, a hue slider (reusing OriSlider), an optional alpha slider, a hex field (reusing OriInput), optional preset swatches (a roving listbox), and an optional eyedropper. `v-model` is a lowercase color string; `format` selects `hex` / `rgb` / `hsl`; `alpha` adds a checkerboard slider + `#rrggbbaa` output; `eyedropper` shows a feature-detected pick-from-screen trigger (hidden where unsupported); `update:modelValue` streams live and `change` commits once per interaction (one undo entry), like OriSlider. Slots: `#swatch`, `#preset`. Compose it into `OriPopover` for a swatch-triggered flow.
    - **`@oriui/headless`**: `useColorPicker` (Vue) — the compositional behaviour over a new zero-dependency sRGB color engine (`hex↔rgb↔hsv↔hsl`, loose parse of hex / `rgb()` / `hsl()` incl. alpha, WCAG-luminance ink) and 2D-area math, kept out of the core `.` budget (reachable only from `./vue`). The 2D area is two visually-hidden native `<input type="range">` (one per axis) — real `role="slider"`, focus, and value announcements, with the arrow keys routed in 2D.

    Deferred to a later version (all additive): a user-facing format switcher, per-channel numeric inputs, a built-in recent-colors buffer, a color wheel, and a Svelte binding.

### Patch Changes

- Updated dependencies [8af0a98]
- Updated dependencies [f3eae54]
    - @oriui/headless@1.0.0-alpha.13
    - @oriui/css@1.0.0-alpha.13

## 1.0.0-alpha.12

### Minor Changes

- 20f7236: Content slots across the catalog — pass a rich node anywhere a string prop used to be the only option (all additive; the prop stays as the slot fallback).

    - **Toolbar icons**: `OriToolbarButton` and `OriToolbarToggleItem` now forward a default slot to the underlying `OriButton`, so you can slot any icon source (a component, a multi-path SVG) instead of only the single-path `icon` string.
    - **Rich content slots** following the `OriCard` / `OriAlert` idiom (`<slot name="x">{{ prop }}</slot>`):
        - `OriCheckbox` / `OriSwitch` — default label slot (an inline link in a consent label).
        - `OriTabs` — `#tab` scoped slot for trigger content (icon + count badge).
        - `OriCombobox` — `#option` (scoped: `{ item, index, selected }`) + `#empty`.
        - `OriRadioGroup` — `#option` (scoped: `{ option }`) for card-style radios.
        - `OriAccordion` — `#title` (scoped: `{ item }`) header content.
        - `OriField` — `#label` / `#hint` / `#error` (the error/hint slots stay wired to `aria-describedby` / `aria-invalid`).
        - `OriBadge` — `#content` (a slotted badge keeps its place in the a11y tree).
        - `OriAvatar` — `#fallback` (imageless fallback) + `#title` / `#subtitle`.
        - `OriTag` — `#prepend` / `#append` decorator slots.
        - `OriToast` — `#icon` / `#title`.
    - **Fixes**: `OriCombobox` (input) and `OriMenu` (content) now compose caller listeners with `mergeProps` instead of an object spread — a caller's `@input` / `@keydown` was previously silently dropped by the component's own handlers.

### Patch Changes

- @oriui/headless@1.0.0-alpha.12
- @oriui/css@1.0.0-alpha.12

## 1.0.0-alpha.11

### Minor Changes

- 9e7f183: OriDialog: managed open state — add `v-model:open` (a controlled `open` prop + an `update:open` emit) and a `close` emit. The dialog now drives both uncontrolled (`defaultOpen` + the `#trigger` slot — unchanged) and host-controlled, so a parent can open/close it from its own ref and react to every close (Esc, backdrop, the × button, or its own state). Backward compatible — omitting `:open` keeps the previous behaviour.
- 84b6559: OriSlider: add a `change` event — the committed value (a `number`), fired once when the user releases the thumb or commits a keyboard step, unlike `update:modelValue` which streams live on every drag tick. Bind `@change` to collapse a whole drag into a single undo step (or run a per-release side effect) while `v-model` keeps tracking the live value.

    BREAKING (pre-1.0): `@change` on `<OriSlider>` was previously an undeclared native-event `$attrs` fallthrough carrying a raw `Event`; it is now a first-class typed emit carrying the committed `number`. A consumer relying on the old raw-`Event` payload should read the committed number instead, or attach a listener to the underlying `<input>` via a template ref for the raw event.

- b1fcb38: OriSurface — a minimal elevated floating-surface primitive: surface background + optional hairline + radius + a mode-aware `--ori-shadow-*` elevation, with no padding or content semantics of its own (the caller owns the layout inside). The building block for chrome that floats over content — a toolbar island, a panel, a popout — and the elevation counterpart to OriCard (a content card). Props: `as`, `bordered`, `elevation` (`sm` / `md` / `lg`), `radius`.
- 095aef0: Toolbar — a flagship WAI-ARIA toolbar (https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/).

    - **`@oriui/headless`**: a new compositional roving-tabindex primitive — `useToolbar` / `useToolbarItem` / `useToolbarOrientation` / `useToolbarToggleGroup` / `useToolbarToggleItem` (Vue **and** Svelte adapters), plus framework-agnostic roving helpers (`rovingIntent` / `resolveRovingIndex`) in the core. Real DOM focus, one tab stop, arrow navigation by orientation with wrap, Home/End, RTL, and a composite-child guard (a slotted slider/textbox keeps its own arrows).
    - **`@oriui/vue`**: five styled components — `OriToolbar` (required accessible name, `orientation` / `loop` / `dir`), `OriToolbarButton` (`pressed`→aria-pressed toggles, focusable-disabled per the APG, and a baked `tooltip` that wires `aria-describedby` onto the real button), `OriToolbarSeparator` (perpendicular), and `OriToolbarToggleGroup` / `OriToolbarToggleItem` (single/multiple, `v-model`).

### Patch Changes

- Updated dependencies [095aef0]
    - @oriui/headless@1.0.0-alpha.11
    - @oriui/css@1.0.0-alpha.11

## 1.0.0-alpha.10

### Patch Changes

- Updated dependencies [c026ffc]
    - @oriui/headless@1.0.0-alpha.10
    - @oriui/css@1.0.0-alpha.10

## 1.0.0-alpha.9

### Patch Changes

- Updated dependencies [db83609]
    - @oriui/css@1.0.0-alpha.9
    - @oriui/headless@1.0.0-alpha.9

## 1.0.0-alpha.8

### Patch Changes

- Updated dependencies [e0444e6]
    - @oriui/css@1.0.0-alpha.8
    - @oriui/headless@1.0.0-alpha.8

## 1.0.0-alpha.7

### Patch Changes

- 94e04a5: **Neutral preset skin** — pure neutral grays with a monochrome accent (ink primary on white / near-white on near-black), for tool-like apps where colour belongs to the content, not the chrome. Applied via `data-ori-skin="neutral"`. All role pairings clear WCAG AA (min 12:1).

    **Tooltip fix.** The bubble now self-pairs its colours: a dedicated neutral chip by default (`--ori-neutral-900`/`-50`, ~17:1), or a role's own `--ori-color` / `--ori-color-on` pair when a `color` is set. Previously the bubble read `var(--ori-color, …)` where `--ori-color` is globally `currentColor`, so the neutral fallback never fired and bg + text collapsed to the same colour — invisible (dark-on-dark) on ink-heavy hosts. The bubble also now floats on the shared `.ori-anchored` primitive (`position: fixed` + collision-aware flip via `position-try`), escaping clipped/overflow-hidden containers.

    Standalone `@oriui/css` note: the per-side placement classes `ori-tooltip__bubble_{top,bottom,left,right}` are replaced by `ori-anchored ori-anchored_<placement>` (the same 12-value grid the popover/menu use). `@oriui/vue`'s `OriTooltip` emits the new classes automatically — no consumer change needed there.

    Tooling: the design-token contrast guard now computes WCAG ratios with colord's a11y plugin and parses both legacy and space-separated `hsl()` token values.

- Updated dependencies [94e04a5]
    - @oriui/css@1.0.0-alpha.7
    - @oriui/headless@1.0.0-alpha.7

## 1.0.0-alpha.6

### Patch Changes

- 37ebed5: Ship `src` alongside `dist` so the published declaration maps (`.d.ts.map`) and JS sourcemaps
  (`.js.map`) resolve to real files. Before this, `files` shipped only `dist`, so every map pointed at a
  `../src/…` source that wasn't in the package — go-to-definition (and JS debugging) dead-ended, and some
  editors (notably WebStorm) degraded a component's model while chasing the missing source. Now
  go-to-definition on an `Ori*` component or a headless composable lands on the real, commented source.
  The `exports` map still routes all imports to `dist`; the extra `src` files are inert.
- Updated dependencies [37ebed5]
    - @oriui/headless@1.0.0-alpha.6
    - @oriui/css@1.0.0-alpha.6

## 1.0.0-alpha.5

### Patch Changes

- Updated dependencies [65477b5]
- Updated dependencies [4060086]
    - @oriui/css@1.0.0-alpha.5
    - @oriui/headless@1.0.0-alpha.5

## 1.0.0-alpha.4

### Patch Changes

- Updated dependencies [59744ba]
- Updated dependencies [6481f5a]
    - @oriui/css@1.0.0-alpha.4
    - @oriui/headless@1.0.0-alpha.4

## 1.0.0-alpha.3

### Minor Changes

- dc5bb4c: Fix an implicit-mode footgun: **icon mode now requires an explicit `icon` prop**, no longer the mere
  absence of `text`. Previously `<OriButton>Label</OriButton>` (a slot-only button with no `text` prop)
  silently became a fixed-size icon square and its label overflowed. Now `ori-button_icon` is applied
  only for an icon-**only** button (`icon` set, `text` absent):

    - `<OriButton icon="…" aria-label="…" />` → icon-only square (unchanged).
    - `<OriButton icon="…" text="Save" />` → normal labelled button with a leading icon (no longer a square).
    - `<OriButton text="Save" />` and `<OriButton>Save</OriButton>` (slot) → normal buttons (no longer forced squares).

    OriCard gets the same treatment: its `ori-card_icon` modifier now needs an explicit icon
    (`prependIcon` / `appendIcon`) with no `text`, instead of triggering on any card that omits `text`.

    This changes existing behaviour for consumers who relied on the old text-absent icon square — pass the
    `icon` prop explicitly to keep an icon-only button.

### Patch Changes

- Updated dependencies [c9d1ec3]
    - @oriui/headless@1.0.0-alpha.3
    - @oriui/css@1.0.0-alpha.3

## 1.0.0-alpha.2

### Minor Changes

- 696c678: Restructure and rename the packages. The styled components move from the repo root (`@oriui/ui`) into
  `@oriui/vue`; the headless layer consolidates `@oriui/core` and the old `@oriui/vue` into a single
  `@oriui/headless` package — `@oriui/headless` is the framework-agnostic engine, `@oriui/headless/vue`
  the Vue composables (a `@oriui/headless/svelte` adapter can follow). `@oriui/css` is unchanged. The
  old `@oriui/ui`, `@oriui/core`, and the old `@oriui/vue` (headless) package names are retired.

### Patch Changes

- Updated dependencies [696c678]
    - @oriui/headless@1.0.0-alpha.2
    - @oriui/css@1.0.0-alpha.2
