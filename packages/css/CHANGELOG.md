# @oriui/css

## 1.0.0-rc.20

### Minor Changes

- [`83c885c`](https://github.com/markgrushevski/oriui/commit/83c885c57d7462986c57012353df648d3068f0ce): **Toasts no longer disappear while someone is reading or using them, and a toast can carry an action.**

    - **Pause.** `<OriToaster>` stops every countdown while the pointer or keyboard focus is on the toasts,
      or while the page is hidden, and then continues with the time that was left (WCAG 2.2.1). `useToast()`
      gains `pause()` and `resume()` for a renderer of your own.
    - **Action.** `toast({ text, action: { label: 'Undo', onClick } })` renders an action button. Pressing it
      runs `onClick` and dismisses the toast. `OriToast` gains an `actionLabel` prop and an `action` event,
      and `@oriui/css` an `.ori-toast__action` part.
    - **Reachable by keyboard.** The toaster is now a labelled region, "Notifications (F8)" by default, and
      `F8` moves focus to it. Both are props: `label` and `hotkey` (`''` turns the hotkey off).
    - `@oriui/css`'s `toast.css` now imports `button.css`, so the entry stays self-contained.

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

- 0104b16: **The unchecked checkbox and radio edge is heavier, because the old one failed WCAG 1.4.11.** The box
  boundary was `color-mix(in srgb, currentcolor 40%, transparent)` — measured, that fell below the 3:1
  non-text minimum in **16 of 32** readings across the eight skins and both themes, worst **2.24** on
  sumi light. A control's visual boundary is exactly what 1.4.11 binds, and an unchecked box is nothing
  but its boundary.

    It is now 60%, chosen from a sweep rather than picked: 50% still failed 2 of 32, 55% cleared
    everything at 3.19 — too close to the bar for a colour derived from the ambient ink, which a custom
    skin can move — and 60% clears at **3.69**. The edge stays out of the shared outline tokens on
    purpose; those are tuned lighter, and this is the heaviest structural weight in the library.

    New guard: `e2e/non-text-contrast.spec.ts`, a separate spec from the 4.5:1 text probe because it is a
    different criterion, a different bar and a different set of elements. It measures every unchecked
    boundary in all sixteen skin × theme combinations and prints the offending readings when it fails.

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

- 93eaf82: **Accessibility fixes before 1.0, among them the last WCAG AA failure** (`OriTooltip`, 1.4.13).

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
    measured at **1.68:1** on a solid primary. WCAG's contrast exemption covers
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

- eea7717: **`variant="plain"` is now `variant="quiet"`, and its fade is the one that measures AA.**

    The name moved because `plain` means two different things in the libraries that ship it — "unstyled"
    in Chakra v3, "tinted" in Element Plus — while Adobe Spectrum's `isQuiet` names exactly this
    treatment: the quietest step, minimal chrome. `.ori-variant_plain` → `.ori-variant_quiet`.

    The fade moved because 0.5 was a guess and it failed WCAG AA on an **enabled** control
    (worst reading 2.33:1). The exemption the code leaned on covers INACTIVE controls; a `quiet` button is
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

- c91bdb0: **Fix: `.ori-dialog__body` no longer fades everything a dialog contains below WCAG AA.** The body carried
  `opacity: 0.85` for visual hierarchy, but that element wraps the caller's whole slot — so the fade applied
  to controls, not only to explanatory text, and multiplied with any fade a child carried of its own. A field
  hint's `opacity: 0.7` compounded to 0.595.

    Measured in real Chromium across all eight skins and both themes, before the fix: a primary `solid` button's
    label at **3.35:1** (luxury, light), a `danger` fill button at **4.14:1**, a field hint at **3.95:1** — all
    against a 4.5:1 bar. Dark themes passed, which is why it survived to rc: the token pairs themselves are
    honestly AA (5.43:1 for the button), and the margin was only lost at paint time.

    The fade is gone; hierarchy in a dialog comes from the title's size and weight, as it does elsewhere in the
    library, where secondary text is always a leaf class with its own tone (`__subtitle`, `__hint`) rather than
    a group fade over someone else's content. Worst reading inside a dialog is now 4.87:1.

    Neither existing guard could see this by construction — the Node token test reads token PAIRS and never
    renders, and an axe pass reads declared colours, not composited pixels. `e2e/text-contrast.spec.ts` gains a
    third test that measures a composited dialog body (128 readings) so an ancestor fade cannot return unseen.

## 1.0.0-rc.18

### Minor Changes

- 16a5a16: **Structure has a name: `--ori-color-outline` and `--ori-color-outline-strong`.** Borders, dividers and
  control edges were invented per component — forty-odd ad-hoc `color-mix` percentages — so a consumer who
  wanted one consistent hairline had nothing to repoint and had to guess our numbers. This is the fix for the
  one gap a real consumer filed that the library had not closed.

    Two weights, because there are two structural jobs: the resting hairline that separates surfaces (panels,
    menus, dividers, list rows) and the heavier edge that marks an interactive control (text fields, key caps,
    colour swatches). Both derive from `currentcolor`, so a hairline follows the text it accompanies and a
    themed subtree needs no per-theme re-declaration.

    Visible change: the hairlines that were 14% are now 12%, and the chip edges that were 20% / 25% are now
    28% — a few percentage points of alpha on a translucent line, collapsed so one token can own the weight.
    Deliberately NOT folded in: low-percentage background tints (hover rows, zebra stripes, the progress
    track) are state tinting rather than structure, and the checkbox / radio box edge stays heavier on purpose,
    because an unfilled interactive target has to read as an affordance.

    A source guard in `tests/tokens.contrast.test.ts` now fails if a component hand-rolls a structural mix
    again, with the checkbox / radio exception named in the test rather than left silent.

### Patch Changes

- 04c63bf: **The colour picker's two public custom properties are namespaced.** `--ori-hue` and `--ori-ink` sat in the
  library's shared `--ori-*` namespace while meaning something only inside one component — so a consumer (or a
  future token with a better claim to the name) could collide with them silently. They are now
  `--ori-color-picker-hue` and `--ori-color-picker-ink`, matching `--ori-color-picker-size` beside them.

    Breaking only for markup that wrote or read those names directly. The rename spans three packages in one
    commit, because the value is written by the headless composable (all three adapters), consumed by the
    stylesheet, and forwarded by the styled SFC — a partial rename would have left the area painting its
    fallback red.

- 793b2e1: **Colour correctness sweep** — four defects where a colour could not reach the theme it was rendered
  in. Every ratio below is a computed-style measurement in real Chromium over the full cascade, eight
  skins × both themes, compositing each translucent layer onto what it actually sits on.

    **Subtree theming really works now.** `.ori-theme_dark` / `.ori-theme_light` on a non-root element was
    documented as supported and was half-wired. Custom-property substitution resolves where a property is
    _declared_, not where it is used, so the derived tones written once in the bare `:root` rule froze to
    the root theme and merely inherited into a themed region: a dark region on a light page rendered its
    body text at **1.03:1**, and a light region on a dark page rendered ink at **1.13:1**, the danger tone
    at **2.06:1** and the primary tone at **1.53:1** — while keeping the dark theme's heavy shadows over a
    white surface. The six role `-text` clamps and the neutral `--ori-color-text` default now live in one
    derived block selected by `:root, :root.light, .ori-theme_light`, `--ori-color-text` is re-declared in
    the dark block, and the elevation shadows gained the same light selector. One block per theme, not two
    copies of twenty lines — the duplication is what let the two halves drift apart in the first place.
    All eighteen readings across page / dark-subtree / light-subtree now pass at 7.61:1 or better.

    **Three blocks baked literal colours no theme could reach.** The tooltip chip was the neutral ramp, so
    it measured **1.04–1.11:1** against the dark page it floated over — a chip invisible against its own
    backdrop, contradicting the comment above it. It now reads the page inverted (`--ori-color-on-background`
    on `--ori-color-background`), which is a contrast-checked pairing by construction: **13.89:1**. The
    avatar's `#00000018` tint was a black veil that vanished on a dark page; it derives from the ambient ink
    like every other structural neutral. The switch thumb was `#ffffff`: **1.85–2.15:1** against the off
    track in light, and **1.13–2.98:1** against the on track in dark. The thumb is the state indicator and
    the track changes colour between states, so no single thumb colour can clear WCAG 1.4.11's 3:1 bar for
    both — it now pairs with its own track (the ink when off, `--ori-color-on` when on, which is the
    contrast-checked partner of the `--ori-color` the track paints). Worst reading is now 4.91:1.

    **The invalid-control border was the failing contrast one axis over.** `border-color:
var(--ori-color-danger)` on `[aria-invalid="true"]` in input / select / textarea measured **2.08–2.85:1**
    on the dark surfaces, under the 3:1 minimum for a UI-component boundary; the focus ring beside it had
    the same problem. Status roles are shared by both themes — one hue, no `-dark` source — so the raw role
    is only ever tuned as a fill on the light surface and has nothing to adapt with. Both now read
    `--ori-color-danger-text`, the same hue with its lightness clamped per theme, which is the precedent the
    outline variant already set. Worst reading is now 6.53:1.

    **One mechanism for the structural hairline.** `.ori-surface_bordered` derived its 12% hairline from
    `--ori-color-on-surface` while the menu, popover and combobox listbox derived the same hairline from
    `currentcolor`. Surface now matches them. It renders byte-identically today (verified across all
    sixteen skin/theme combinations) — the point is that one job stops having two answers, and the hairline
    follows a `color` the consumer sets. No new public token: naming a neutral/structural token is an API
    decision, and `currentcolor` already adapts to theme, skin and ambient colour without one.

    Three new guards in the unit suite keep these closed, each with a self-check so a guard that stopped
    seeing anything cannot pass silently: a theme-shared status role may not be painted as a border,
    outline or focus ring (the four per-theme roles still may, so the colour picker's primary outline stays
    legitimate); whatever the dark theme rule declares, the light rule declares too; and a token deriving
    from a theme-varying token must itself be theme-scoped. "Theme-varying" is discovered from the
    stylesheet, never hand-listed. Against the pre-fix files the guards report 3 failures and 6 offending
    declarations; after, none.

- 983b821: **The combobox "no results" message now meets AA.** `.ori-combobox__empty` faded on-surface text with
  `opacity: 0.6`, which measured **3.69:1** at worst (sumi, light) — below the WCAG 1.4.3 minimum for body
  text. Unlike a placeholder or a disabled option, an empty-state message is real informational content, so
  the exemption for disabled and decorative elements does not apply to it.

    It now carries `opacity: 0.7`, the same fade a field hint uses, measuring **4.87:1** at worst. Found by the
    extended real-Chromium contrast guard on its first run over form controls, and the cell is now asserted in
    that matrix rather than only printed.

- 04c63bf: **CSS layer: the modifier vocabulary goes flat — 106 `.ori-x.ori-x_y` compounds collapse to one class.**

    The rule is that specificity stays flat (`:where()`, no `.a.a_b` stacking), and the
    component layer broke it 106 times, across 22 files. The cause was structural rather than sloppy: each
    block declared its baked token defaults in the very same `.ori-input { … }` rule (0,1,0) that carried
    its layout, so a single-class modifier could never outrank it, and `input.css` said so out loud
    ("Compound with the block so it beats the baked `md` default by specificity").

    So the baked defaults move out into a companion `:where(.ori-input) { … }` rule at (0,0,0) — declaring
    a custom property on the element still beats inheritance at any specificity, so a nested block keeps
    reading its own value — and every modifier is now a single class: `.ori-input_lg`, `.ori-card_fluid`,
    `.ori-toaster_top-left`, `.ori-surface_elevation-md`. The vocabulary finally matches the
    `.ori-size-action_*` utilities it was written to mirror, and the modifiers still win on **specificity**
    rather than on source order.

    **This is a behavioural change for one audience, and it is deliberate.** Every modifier selector drops
    from (0,2,0) to (0,1,0), so a rule you wrote to beat one needs one less class. Nothing changes for the
    common case — an unlayered consumer stylesheet still outranks the whole library by layer order, and
    `@oriui/vue` emits exactly the same class names — but an override that lives _inside_ `@layer` and was
    sized against the old (0,2,0) now ties or wins where it used to lose. Pre-1.0 is the moment to pay for
    that; after 1.0 it is a major-version event.

    **Proof that nothing else moved:** every component in the reset-independence fixture was rendered once
    per modifier class, in four theme selectors (bare `:root`, `:root.dark`, `:root.light`,
    `.ori-theme_dark`) × LTR and RTL × page-level and subtree-themed regions, against the before and after
    builds in real Chromium — 16,016 element renders, 9,549,488 computed-property readings, **0
    differences**. A control run that seeded two regressions into the same harness reported 472.

    One selector genuinely did change a cascade outcome and was fixed rather than skipped:
    `.ori-toaster:dir(rtl)` is (0,2,0), so once the corner modifiers flattened to (0,1,0) the direction
    default started beating them and a corner-pinned toaster slid in from the wrong edge under `dir="rtl"`
    — the exact regression the control run reproduces. Both arms of that default now sit in `:where()`, so
    the corners outrank them by specificity instead of by source order, which is what the file's own
    comment had been relying on all along.

    **The variant vocabulary's interactive half is no longer button-only.** Ten rules in `ori.utilities`
    named `.ori-button` outright, so `.ori-variant_*` gave a consumer's own block the base cluster and the
    generic `[data-active]` tint but no `:hover` / `:active` — two thirds of a vocabulary. They now read
    `:where(.ori-button, [data-ori-interactive])`, so an element opts in with `data-ori-interactive` and
    gets the whole thing. `:where()` keeps the hook free, so a button computes identical values at rest,
    on hover, on `:active` and under `[data-active]` in all five variants and both themes (measured), and
    an element _without_ the attribute is still untouched. The rules stay in `ori.utilities` on purpose:
    they move `--ori-variant-bg-color`, and that layer outranks `ori.components`, so the same rules moved
    into a block file could never win.

    **Eleven more dead `var(--ori-color, …)` fallbacks are gone** — from `accordion`, `menu`, `popover` and
    `tabs`, finishing the sweep the slider and colour-picker blocks started. `--ori-color`, `--ori-color-on`
    and `--ori-color-text` are all declared unconditionally at `:root`, so the fallback arm can never fire.
    Eight of the eleven were also misleading: `accordion` and `tabs` bake the primary accent in their own
    block, so the `currentcolor` those arms advertised was never what would resolve — measured, the
    accordion chevron and the tabs indicator paint `rgb(3, 105, 161)` in light and `rgb(56, 189, 248)` in
    dark where the fallback claimed the page ink. The remaining three (`menu` ×2, `popover`) bake no accent,
    so they were merely redundant. A component that needs its own default declares a block-local token, the
    way `--ori-tooltip-bg` and `--ori-checker-*` already do.

    Net effect on the bundle: `styles.css` loses 798 bytes raw and 29 bytes gzipped.

- 793b2e1: **CSS layer: token hygiene, plus the two places the paint ignored the writing direction.**

    **`.ori-shadow` is removed.** The library's only shadow class hardcoded two literal `rgb(0 0 0 / …)`
    layers, so it was not theme-aware, carried no value suffix, and could never grow the `_sm`/`_md`/`_lg`
    siblings that `--ori-shadow-{sm,md,lg,ring}` (themes/\_themes-elevation.css) has had all along. It
    appeared in no component, no doc page and no test, so there is no compat story to preserve and
    freezing an off-axis public class into 1.0 is the worse trade. Read the elevation tokens in your own
    `box-shadow` instead. `.ori-safe-area*` is untouched.

    **The slider's painted track now follows the engine under RTL.** Chromium reverses a native
    `<input type=range>` when the direction is RTL — a click a quarter in from the physical left resolves
    to a value ≥ 50 — but every author-drawn track still painted `to right`, so the fill, the hue spectrum
    and the alpha ramp all sat on the opposite side from their own thumb. The axis is now a
    `--ori-slider-axis` knob that a `.ori-slider:dir(rtl)` rule repoints, and all three tracks read it.
    Measured in real Chromium (`e2e/rtl.spec.ts` samples the painted pixels, since Chrome does not report
    author styles for `::-webkit-slider-runnable-track`); the spec's deliberate `test.fail` is now a real
    assertion, and the hue and alpha tracks are pinned alongside it.

    **A toast now enters off the edge its toaster is pinned to.** `transform: translateX(20px)` slid every
    toast in from the right whatever the corner and whatever the direction. The offset comes from
    `--ori-toast-enter-x`, which each corner modifier sets physically — the corner names a _screen_ corner
    and deliberately does not mirror — so left corners enter from the left, right corners from the right,
    and a centred toaster does not slide sideways at all. Only a corner-less `.ori-toaster` has no edge to
    follow, so that one case reads the writing direction.

    **`--ori-card-padding`** joins the local-token idiom (`--ori-tooltip-radius`, `--ori-color-picker-radius`).
    `.ori-card` pinned its outer padding straight to the raw `--ori-size-gap_xl` scale token while reading
    the `--ori-size-gap` alias for its own rows, so the card's inset could not be retuned without moving
    the whole gap scale. Same computed default (16px), one knob.

    **`--ori-checker-1` / `--ori-checker-2` are now declared on `.ori-slider` as well**, not only inside
    `.ori-color-picker`. `.ori-slider .ori-slider_alpha` is reachable without a colour picker, and a block
    must not read a token another block owns: a standalone alpha slider fell through to the hardcoded
    `#c8c8c8`/`#fff` grid, which is glaring on a dark page. It now gets the same theme-derived mid-neutrals
    the picker does. Nested inside a picker nothing changes.

    **Dead `var(--ori-color, …)` fallbacks are gone** from the slider and colour-picker blocks.
    `--ori-color` is declared unconditionally at `:root` as `currentColor`, so the fallback arm could never
    fire — and the ones that named a colour were also misleading: an alpha track with no inline colour
    paints the **primary accent**, and an unset swatch paints **`currentcolor`** (white here, via the
    swatch's own `color`), never the `#000000` the fallback advertised. `--ori-ink` and `--ori-hue` keep
    their fallbacks: nothing declares those globally, so those arms are live.

- 9d35ee8: Drop the legacy `.ori-variant` base class. oriUI's token axes are single-class — a block class plus
  one value class (`ori-button ori-variant_tonal`) — and the `.ori-color` axis already shipped without a
  paired base. `.ori-variant` was the last survivor of the older `base + modifier` model, and it was not
  an inert opt-in: it lives in `ori.utilities`, which by layer order outranks the per-axis defaults a
  block bakes into `ori.components`, so its `--ori-variant-bg-color: transparent` **stripped the fill of
  any block it was added to**. In real Chromium, `<button class="ori-button ori-variant">` painted
  `rgba(0,0,0,0)` with a `currentColor` label instead of the filled primary — also silently bypassing
  the AA-checked `--ori-color-on` pairing, since the cluster's `--ori-variant-text-color` fell back to
  `currentColor`.

    Removing the rule is strictly a fix, not a break. Nothing in the library applied the class, and the
    legacy paired form keeps rendering exactly as before: `ori-variant ori-variant_fill` already resolved
    through `.ori-variant_fill` (same specificity, later in source order), so with the base gone the bare
    class simply matches nothing and becomes the true no-op it was assumed to be. Markup that used
    `ori-variant` alone stops losing its background and now renders like the bare block.

    A new source-level guard (`tests/css.utilities.test.ts`) walks every stylesheet under
    `packages/css/src` and fails if a bare `.ori-variant` or `.ori-color` rule reappears, so the paired
    model cannot creep back in; a companion assertion keeps the five single-class variant utilities in
    place so the guard can't be satisfied by deleting the file.

- f36d7bd: The form blocks' **error message and required marker** now paint `--ori-color-danger-text`, not the raw
  `--ori-color-danger` role. The role token is tuned as a fill BACKGROUND (saturated, paired with a
  `--ori-color-on-danger` ink); painted straight onto the surface as body text it measured ~2.4:1 on the
  dark surface (~2.9:1 on the dark page) — below the WCAG AA 4.5:1 the library advertises, and against the
  project's own rule that a role is never body text. Because the status hues are shared across themes, the
  dark theme was the failing case in every skin. Ten declarations across `field`, `input`, `select`,
  `textarea` and `combobox` (`.ori-*__error` and `.ori-*__required`) now read the AA-safe tone that the
  non-fill button variants, the selected tab, Alert, Tag and Link already used. It is the same hue and
  chroma with only lightness clamped, so the marker still reads as the same red — slightly darker in light,
  legible in dark.

    Non-text axes are unchanged: the invalid-state `border-color` and focus ring still ride the raw role
    (WCAG 1.4.11, a separate axis).

    `tests/tokens.contrast.test.ts` gains a source-derived guard so this cannot silently reopen. The existing
    pairings walk a closed role/on-role list, which structurally cannot see a role used as a foreground; the
    new check reads every stylesheet in the css package and fails on any `color` declaration — or any
    `--ori-color-text` / `--ori-variant-text-color` hand-off — fed a raw role token, naming the offending
    `file:line`.

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

- e8265d6: **RTL fixes.** Three blocks laid out with physical properties, so they broke under `dir="rtl"`. Now measured by a new real-Chromium geometry guard (`e2e/rtl.spec.ts`) that renders the same markup in both directions.

    - **Switch** — the thumb travels on the inline axis via `transform`, which has no logical form, so the checked thumb kept moving physically right in RTL and left the track entirely (measured: 13px outside a 35px track). It now mirrors its travel under `:dir(rtl)`, the same shape as the badge's existing floating-corner rule.
    - **Tabs** — the vertical tab list drew its separator with `border-right`, i.e. on its outer edge in RTL, while the selected-tab indicator already used `inset-inline-end`; the two landed on opposite edges. The rule is now `border-inline-end`, so it stays the panel-facing edge in both directions.
    - **Divider** — the vertical divider's rule is now `border-inline-start` rather than `border-left`. Intent-only: the pseudo is a zero-width box, so it occupies the identical slot either way.

    No API or class-name change; LTR rendering is byte-identical.

- 13e6fd2: **Toast: an alignment axis, and the queue stops overriding the component's own `closable` default.**

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

## 1.0.0-alpha.17

## 1.0.0-alpha.16

## 1.0.0-alpha.15

### Patch Changes

- 7ddfb16: **Fix: a pointer drag/click on the OriColorPicker saturation×brightness area now commits once.** The two
  visually-hidden `<input type="range">` channels covered the area without `pointer-events: none`, so a
  pointer press landed on the native range too — its `input` committed, and the area's own pointer-release
  committed again, so a single click/drag recorded **two** undo entries instead of one (violating the
  documented commit-on-release contract). The channels are now `pointer-events: none`: the area `<div>` is
  the sole pointer surface (2D drag), the channels stay the keyboard / assistive-tech surface. Covered by a
  new real-Chromium e2e (`e2e/colorpicker-pointer-drag.spec.ts`) that happy-dom couldn't exercise.

## 1.0.0-alpha.14

### Patch Changes

- 5e28b7c: Catalog consistency polish:

    - **OriSlider** and **OriCombobox** gain a `#label` slot (the `label` prop is the fallback), matching
      OriField — so a standalone control can take a rich label (an icon + text) while keeping the label
      `for`/`id` and the combobox listbox `aria-labelledby` wiring intact.
    - The combobox listbox and the toast card now read a baked `--ori-size-radius` alias (two-tier) rather
      than the raw scale token, so a consumer `.ori-size-radius_*` utility can retune their corners — matching
      menu / popover / card. Defaults are unchanged.

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

## 1.0.0-alpha.13

### Patch Changes

- f3eae54: Fix two CSS-layer bugs surfaced by a toolbar migration.

    - **Toolbar pressed fill** now actually paints. The `[aria-pressed="true"]` tint was routed through `--ori-variant-bg-color`, but `.ori-variant_text` / `_plain` / `_outline` re-set that token to `transparent` in the later `ori.utilities` layer (which beats `ori.components` regardless of specificity), so only the inset ring showed. The tint is now a literal `background-color`, which wins on specificity (the variants set only the token, never `background-color` directly).
    - **Button `color` no longer sticks on a runtime recolor.** `.ori-button` transitioned `color`, whose value resolves to a relative-color token (`oklch(from <role> …)`) that browsers don't interpolate — swapping `--ori-color` at runtime (e.g. to tint an icon) left the color stuck until a repaint. `color` is dropped from the transition (no built-in state animates text color), so dynamic recoloring is instant.

## 1.0.0-alpha.12

## 1.0.0-alpha.11

## 1.0.0-alpha.10

## 1.0.0-alpha.9

### Minor Changes

- db83609: **Role-as-text is now the same hue as the fill — a darker/lighter shade, not a muddy off-hue.** The
  `--ori-color-<role>-text` tone (used by the non-fill button variants, the selected tab, alert, tag, link and the
  selected combobox option) is now derived by **relative colour that keeps the role's hue + saturation and clamps
  only lightness** — `oklch(from var(--ori-color-<role>) min(l, 0.42) c h)` in light, `max(l, 0.86)` in dark —
  instead of the previous `color-mix` toward the neutral ink, which desaturated it into a muddy, off-hue colour that
  no longer matched the role's fill and border. Text / outline / tonal now read as the same colour as the fill, only
  darker (light theme) or lighter (dark theme): one hue, only lightness varies.

    The **outline** variant's border now uses that same text tone (was the raw role), so an outline button is one
    colour (border = label) and the border clears the 3:1 non-text bar for pale roles too.

    Still WCAG AA (>= 4.5:1) for every role across all skins, both themes, and every text kind including the tonal
    hover/active tint (min ~4.55:1), and still fully overridable via `--ori-color-<role>-text`. The tone tokens are
    now declared per theme block, so they also track a subtree `.ori-theme_dark` / `.ori-theme_light` and a consumer's
    unlayered `--ori-color` theme override.

## 1.0.0-alpha.8

### Minor Changes

- e0444e6: **Role colours are now AA-safe as text.** The non-fill button variants (`text` / `outline` / `tonal`), the selected tab, alert, tag, link, and the selected combobox option previously painted the raw role colour as their label — where a saturated or light role (amber `warn` ≈ 2.14:1, the pale `secondary`) failed WCAG AA 4.5:1 on the surface. They now read a new derived on-surface tone, `--ori-color-<role>-text` (exposed to components as `--ori-color-text`), guaranteed ≥ 4.5:1 for every role across all skins and both themes — verified in real Chromium (`e2e/text-contrast.spec.ts`).

    The tone derives from the role via `color-mix(in oklch, var(--ori-color-<role>), var(--ori-color-on-surface) 65%)`, so a custom skin or brand override gets an AA text tone automatically, and it stays fully overridable (at `:root`, per skin, or per instance) — the sanctioned replacement for the `.ori-button { --ori-color: … }` workaround. Fills are unchanged (dark on-colour ink on the solid fill). The tonal hover/active tint was softened (35% → 30%) so its text stays AA.

## 1.0.0-alpha.7

### Minor Changes

- 94e04a5: **Neutral preset skin** — pure neutral grays with a monochrome accent (ink primary on white / near-white on near-black), for tool-like apps where colour belongs to the content, not the chrome. Applied via `data-ori-skin="neutral"`. All role pairings clear WCAG AA (min 12:1).

    **Tooltip fix.** The bubble now self-pairs its colours: a dedicated neutral chip by default (`--ori-neutral-900`/`-50`, ~17:1), or a role's own `--ori-color` / `--ori-color-on` pair when a `color` is set. Previously the bubble read `var(--ori-color, …)` where `--ori-color` is globally `currentColor`, so the neutral fallback never fired and bg + text collapsed to the same colour — invisible (dark-on-dark) on ink-heavy hosts. The bubble also now floats on the shared `.ori-anchored` primitive (`position: fixed` + collision-aware flip via `position-try`), escaping clipped/overflow-hidden containers.

    Standalone `@oriui/css` note: the per-side placement classes `ori-tooltip__bubble_{top,bottom,left,right}` are replaced by `ori-anchored ori-anchored_<placement>` (the same 12-value grid the popover/menu use). `@oriui/vue`'s `OriTooltip` emits the new classes automatically — no consumer change needed there.

    Tooling: the design-token contrast guard now computes WCAG ratios with colord's a11y plugin and parses both legacy and space-separated `hsl()` token values.

## 1.0.0-alpha.6

### Patch Changes

- 37ebed5: Ship `src` alongside `dist` so the published declaration maps (`.d.ts.map`) and JS sourcemaps
  (`.js.map`) resolve to real files. Before this, `files` shipped only `dist`, so every map pointed at a
  `../src/…` source that wasn't in the package — go-to-definition (and JS debugging) dead-ended, and some
  editors (notably WebStorm) degraded a component's model while chasing the missing source. Now
  go-to-definition on an `Ori*` component or a headless composable lands on the real, commented source.
  The `exports` map still routes all imports to `dist`; the extra `src` files are inert.

## 1.0.0-alpha.5

### Minor Changes

- 65477b5: The size/font token scales are now **rem** instead of px — visually identical at default browser
  settings (exact 16px-baseline equivalents: `--ori-size-action_md` 44px → `2.75rem`, gap/radius md
  8px → `0.5rem`, `--ori-font-size_md` 16px → `1rem`, ±2px steps → `0.125rem`), and components now
  scale with the user's browser font-size preference, not only with zoom. Text-relative `em` values
  are untouched, and hairline borders, shadows, the `9999px` pill cap, and the screen breakpoints
  deliberately stay px.

    Note for consumers using the `html { font-size: 62.5% }` trick: oriUI components now follow that
    root — as rem is designed to — so at 62.5% they render at 0.625× until you account for it.

- 4060086: Components no longer rely on the global reset: every component block declares its own box-sizing
  (a zero-specificity border-box subtree rule) and UA neutralization (button/input `padding-block`,
  button `font-family: inherit`, dialog-close `padding`, anchored-panel `margin` — the UA gives
  `[popover]` `margin: auto`), so `tokens.css` + components renders identically to `base.css` with no
  reset at all — guarded by an e2e computed-style diff over all 32 components in real Chromium
  (`e2e/reset-independence.spec.ts`).

    `reset.css` no longer pins `html { font-size: 16px }` — that wasn't a reset: it overrode the user's
    browser font-size preference. The rem base now follows the user's browser setting; the reset is
    border-box + Meyer-style margin/padding/border zeroing, nothing more.

## 1.0.0-alpha.4

### Minor Changes

- 59744ba: À-la-carte entry points: `@oriui/css/base.css` (the batteries-included foundation — cascade-layer
  order + tokens + skins + utilities + the global reset), `@oriui/css/tokens.css` (the same foundation
  without the reset, for apps that bring their own preflight), `@oriui/css/reset.css` (the global
  reset alone), and `@oriui/css/components/<name>.css` (one file per component block) — so a consumer
  can ship only the components they use. Import a foundation first, then components. The default `.`
  export (the full `styles.css` bundle, now also addressable as `@oriui/css/styles.css`) is unchanged.

    Per-component files are self-contained: the blocks a component renders are inlined (button → icon +
    spinner, combobox → input + the `anchored` placement primitive, alert/card/tag/toast → their icons,
    menu/popover → `anchored`), deduped out of the full bundle by postcss-import. Every dist file also
    opens with a one-line `/*!` banner that survives minification and names the base-or-tokens-first rule.

## 1.0.0-alpha.3

## 1.0.0-alpha.2

### Minor Changes

- 696c678: Restructure and rename the packages. The styled components move from the repo root (`@oriui/ui`) into
  `@oriui/vue`; the headless layer consolidates `@oriui/core` and the old `@oriui/vue` into a single
  `@oriui/headless` package — `@oriui/headless` is the framework-agnostic engine, `@oriui/headless/vue`
  the Vue composables (a `@oriui/headless/svelte` adapter can follow). `@oriui/css` is unchanged. The
  old `@oriui/ui`, `@oriui/core`, and the old `@oriui/vue` (headless) package names are retired.
