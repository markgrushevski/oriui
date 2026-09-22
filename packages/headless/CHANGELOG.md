# @oriui/headless

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

### Patch Changes

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

## 1.0.0-rc.18

### Patch Changes

- 04c63bf: **The colour picker's two public custom properties are namespaced.** `--ori-hue` and `--ori-ink` sat in the
  library's shared `--ori-*` namespace while meaning something only inside one component — so a consumer (or a
  future token with a better claim to the name) could collide with them silently. They are now
  `--ori-color-picker-hue` and `--ori-color-picker-ink`, matching `--ori-color-picker-size` beside them.

    Breaking only for markup that wrote or read those names directly. The rename spans three packages in one
    commit, because the value is written by the headless composable (all three adapters), consumed by the
    stylesheet, and forwarded by the styled SFC — a partial rename would have left the area painting its
    fallback red.

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

- 793b2e1: Headless adapter polish — the reactive options a composable advertises are now actually re-read, and
  the three adapters agree with each other.

    - **`disabled` is live on Disclosure, in all three adapters.** The composables accept a reactive
      options form (Vue `MaybeRefOrGetter`, a Svelte store, a fresh object per React render), but the
      disclosure adapters read `disabled` once at creation and the machine had no event that could change
      it — so a consumer binding `disabled` to state (a form disabling its sections while saving) was stuck
      at the first value forever. The core machine gains `SET_DISABLED`, and the Vue / Svelte / React native
      adapters re-sync it exactly the way `nativeCombobox` / `nativeMenu` already did. Unlike menu and
      combobox, disabling does **not** collapse an open disclosure: an expanded panel with a disabled
      trigger is the accordion idiom for "this section stays open". Svelte's `nativeDisclosure` now also
      accepts a store of options (`MaybeReactive`), like its combobox / menu siblings.
    - **Vue `useTheme` returns `destroy()`.** `onScopeDispose` no-ops outside an effect scope, so a
      `useTheme()` called at module scope leaked its MutationObserver and matchMedia listener with no way to
      stop it. It now mirrors the Svelte twin: automatic teardown when there is a scope, an explicit
      `destroy()` for when there is not (idempotent, and no more dev warning about the missing scope).
    - **Vue `useTabs` accepts `MaybeRefOrGetter<UseTabsOptions>`**, not a getter only — the one composable
      in the adapter that rejected a plain object or a ref. Widening, so no call site changes.
    - **Svelte `nativeDialog` re-projects `dialogProps`** instead of publishing a `readable({…})` frozen at
      creation, matching the Vue `computed` and React's per-render projection — so an option read through a
      getter property reaches the bag instead of being snapshotted once.
    - **`TabItem` is declared once in core** and re-exported by each adapter (as the combobox / menu item
      types already were), instead of three copies that could drift apart silently.
    - **`core/mergeProps` is documented and tested.** The JSDoc now says Vue users should use Vue's own
      (the names collide) and that `class` values must be strings. The new tests found a real hole while
      pinning the rules: a later blank `class` — a consumer's `class: props.class ?? ''` — used to **wipe**
      the bag's own classes. A blank or absent side now contributes nothing, the rule clsx and Zag's
      `mergeProps` use.

- 04c63bf: Headless API consistency — one declaration per option shape, one rule for how options are passed, and
  the toggle group's missing `deselectable`. Closes ISSUES-INNER ORI-I-04, ORI-I-07, ORI-I-09 and ORI-I-48.

    **`useToolbarToggleGroup` gains `deselectable` (ORI-I-48).** `type: 'single'` was unconditionally
    deselectable — pressing the active item always cleared it — so a tool picker that must always have a
    tool was impossible, and its only consumer guarded it by hand. `deselectable` defaults to `true`, which
    is exactly today's behaviour and the Radix default the JSDoc always claimed; `false` guarantees a
    non-empty selection and means the same thing under `type: 'multiple'` (the last remaining value cannot
    be removed), so it is never a silently-ignored prop. A refused press now fires no `onChange` at all,
    rather than re-committing the value the group already holds. Available in all three adapters; the
    styled `OriToolbarToggleGroup` does not surface it yet.

    **One rule for reactive options (ORI-I-04).** The rule, now written into the option interfaces
    themselves: an option that SEEDS a primitive (`defaultOpen`, an initial `value`) is read once and
    accepts a value, a ref or a store; an option that is LIVE is re-read on every use and must be passed in
    the adapter's reactive form. Two signatures disagreed with their own adapter and are aligned:

    - Vue's `UseToolbarToggleGroupOptions.value` was a bare getter while `type` beside it was a
      `MaybeRefOrGetter`. It is widened to `MaybeRefOrGetter`, so a ref or a plain value works and every
      getter that compiles today still compiles.
    - **Breaking (Svelte):** `useToolbarToggleGroup` took a plain object of per-member stores — the only
      Svelte composable that did. It now takes `MaybeReactive<UseToolbarToggleGroupOptions>` with plain
      members, like `useToolbar`, `useCombobox`, `useMenu`, `useTabs`, `useColorPicker` and
      `useDismissable`. Migration: move the store out one level —
      `useToolbarToggleGroup({ type: 'single', value: $tool, onChange })` becomes
      `useToolbarToggleGroup(derived(tool, (t) => ({ type: 'single', value: t, onChange })))`. Per-member
      stores stop type-checking, so this fails loudly at build time; taken now because pre-1.0 is the last
      moment it is free.

    **Option shapes are declared once (ORI-I-07).** `UseTabsOptions` moves into `core` beside `TabItem` and
    each adapter re-exports it, and `UseDisclosureOptions` / `UseDialogOptions` / `UseComboboxOptions` /
    `UseMenuOptions` are now declared in `core` too and exported from `@oriui/headless` for anyone writing
    their own adapter. The toggle group's selection rules likewise move into `core/toolbar` (`resolveToolbarToggle`
    / `isToolbarTogglePressed`), shared verbatim by the three adapters instead of hand-written three times —
    which is why the adapter bundles each got ~30 B smaller while core grew 28 B. `tests/adapter-parity.test.ts`
    now pins every adapter's option interface to the core declaration in BOTH directions, so a member added on
    one side, or re-typed on one side, is a `test:types` failure naming the adapter — key parity alone missed
    the second case.

    **React's compound-event map is held to the core (ORI-I-09).** The `onKeydown` → `onKeyDown` allowlist
    failed silently: an event the core emits that the map does not know reaches React mis-cased and is
    dropped with no error. A new test derives the event list from the core's own `connect()` bags (open and
    closed, item getters included), pushes each through the real normalizer onto a real React element and
    dispatches the matching native event — so it asserts React actually calls the handler, not merely that
    a key is in a table. No behaviour change; the map was complete.

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

- a61c497: **React `useToast`** now returns stable action identities. `toast` / `success` / `error` / `warn` /
  `info` / `dismiss` / `clear` were rebuilt by a `createToastActions(queue)` call inside the hook body, so
  every render handed consumers brand-new function references — even though the queue they close over is a
  module-level singleton that never changes. Anything that listed one in a dependency array
  (`useEffect`, `useCallback`, `useMemo`, a memoised child's props) re-ran on every single render.

    The actions are now built once at module scope, beside the queue: the identities are stable for the
    process, so they are safe to depend on and need no memoisation on the consumer's side. The values are
    unchanged — same functions, same behaviour, same shared queue — so this only removes spurious work.
    Worth fixing before 1.0, since identity stability is part of a hook's frozen public contract.

    A test pins it: after a bare re-render, after a real queue change, and across two separate `useToast()`
    callers, every action passes `Object.is`. The `useSyncExternalStore` snapshot cache (which keeps
    `toasts` referentially stable between queue changes) is untouched.

    The Vue and Svelte twins share the same core actions but have no equivalent bug: their `useToast()`
    runs once per component instance, not once per render, and neither framework re-runs work off a
    dependency array of identities.

- a61c497: **Svelte `useTheme` no longer dies when the last store subscriber leaves.** The controller's lifetime was
  tied to the store's subscriber count, so an ordinary `{#if}` around markup that reads `$theme` took the
  count to 0 and back to 1 — destroying the controller and then re-subscribing to a dead one, after which
  `auto` silently stopped following `prefers-color-scheme` for the rest of the component's life.

    The controller now lives as long as the component that created it (`safeOnDestroy`, the same lifecycle hook
    the other Svelte composables use), and the store's start/stop only subscribes and unsubscribes. Because that
    hook is a no-op when `useTheme` is called outside component init (module scope, a plain `.ts` module, a
    test), the returned store gained an idempotent **`destroy()`** — the explicit handle such a caller disposes
    the OS-scheme listener with. A new subscriber is also re-seeded with the controller's current state, so a
    theme change that happened while the store was dormant is no longer delivered stale.

    Additive: existing `$theme` / `setTheme` / `toggleTheme` / `cycleTheme` usage is unchanged.

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

## 1.0.0-alpha.17

### Minor Changes

- f6d1016: **React adapter — full hook parity (`@oriui/headless/react`).** Completes the React adapter begun by the
  first slice: the remaining behaviour hooks now ship for React, so `@oriui/headless/react` reaches parity
  with `./vue` and `./svelte`. Added:

    - **Machine-adapter hooks** (bridged to React via `useSyncExternalStore`, resolved through
      `OriHeadlessProvider` / `useHeadless` with a native fallback): **`useDialog`**, **`useCombobox`**,
      **`useMenu`** — plus `nativeDialog` / `nativeCombobox` / `nativeMenu` and the Dialog/Combobox/Menu
      contract types.
    - **Compositional / data-driven hooks**: **`useToolbar`** (+ `useToolbarItem` / `useToolbarOrientation` /
      `useToolbarToggleGroup` / `useToolbarToggleItem`) over a React context, **`useColorPicker`** (sRGB +
      2D-area), **`useToast`** (the shared singleton queue, projected with a cached `useSyncExternalStore`
      snapshot), **`useDismissable`**, **`useTheme`**, and **`useToken`** / **`useThemeColor`**.

    Prop bags carry React-native casing (`onClick` / `onKeyDown` / `onPointerDown` / `tabIndex`); client-only
    concerns (EyeDropper, theme/token resolution, dismiss listeners) are gated behind effects so SSR renders a
    neutral default. One React-idiomatic deviation: `useToolbar` / `useToolbarToggleGroup` return a
    `ToolbarProvider` / `ToggleGroupProvider` component to wrap the items (React context needs a rendered
    provider, unlike Vue `provide` / Svelte `setContext`). Vue and Svelte are unchanged.

- d79d76d: **New React adapter (`@oriui/headless/react`) — first slice.** The framework-agnostic core now drives a
  third framework: React joins Vue and Svelte behind the same behaviour engine. This slice ships two
  representative hooks proving both contract shapes — **`useDisclosure`** (machine-driven, bridged to React
  via `useSyncExternalStore`, SSR-safe) and **`useTabs`** (data-driven WAI-ARIA tabs with automatic
  activation) — plus the adapter toolchain: the `./react` export, an optional `react` peer (`^18 || ^19`),
  `OriHeadlessProvider` / `useHeadless` for adapter selection, a React `normalizeProps`, and the `useService`
  machine bridge. Prop bags carry React-native casing (`onClick` / `onKeyDown` / `tabIndex`). The remaining
  hooks land in a follow-up. Note: `@oriui/css` already works in React / Next today — it is framework-free
  `.ori-*` classes plus tokens, no adapter required.

## 1.0.0-alpha.16

### Minor Changes

- 9448620: **`useColorPicker` now ships a Svelte twin** (`@oriui/headless/svelte`) — the last behaviour composable
  without one. It mirrors the Vue contract 1:1 over the same zero-dependency `core/color-picker` engine
  (sRGB + 2D-area math), returning Svelte stores: `Readable` prop-bags, stores-of-functions for
  `getChannelInputProps` / `getPresetProps`, lowercased event handlers, the internal HSVA in a `writable`
  with the same echo-guard, and `eyedropperSupported` as an SSR-safe `readable`. Every headless behaviour is
  now available for **both Vue and Svelte**.
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

- 7e4e397: **New headless `useTabs` composable (Vue + Svelte).** The WAI-ARIA tabs behaviour — automatic-activation
  roving tabindex, defensive selection resolution (recovers to the first enabled tab), and the
  tablist / tab / tabpanel ARIA prop bags — now lives in `@oriui/headless`: `useTabs` ships from both
  `@oriui/headless/vue` (returning computeds) and `@oriui/headless/svelte` (returning stores), reusing the
  shared `core/roving` index math with its skip-disabled predicate. `OriTabs` is rewritten to consume it —
  **identical DOM, classes, and keyboard** — closing the last styled component that hand-rolled its behaviour
  instead of sitting on a headless core. Additive: a new optional `label` prop on `OriTabs` (and
  `label` / `labelledby` options on `useTabs`) names the tablist via `aria-label` / `aria-labelledby`, which
  WAI-ARIA recommends.
- d1163d0: **Toast behaviour moved into `@oriui/headless` (Vue + Svelte).** `useToast` — the imperative toast queue —
  now ships from `@oriui/headless/vue` and, new, `@oriui/headless/svelte`, backed by a framework-agnostic core
  queue engine (`createToastQueue`; kept out of the core barrel so it never weighs on the 1 kB core budget,
  and projected into a Vue reactive array / a Svelte readable store). **Non-breaking:** the `@oriui/vue` path is
  unchanged — `import { useToast } from '@oriui/vue'` still works and shares the one queue (it re-exports the
  Vue adapter). The change is that the behaviour is now a shared headless composable with Svelte parity,
  closing the last styled component whose composable lived in the styled package. Adds a `useToast` docs page.

## 1.0.0-alpha.15

### Minor Changes

- 9d2cc42: **OriColorPicker now submits its color in a form.** A new `name` prop (with an optional `form`) renders
  a hidden input carrying the current color, so a color picker joins native form submission like
  `<input type="color">` — and, unlike a combobox, it always has a value (a color control has no empty
  state), so it submits its current color even before the user interacts. The submitted string uses the
  picker's emitted `format` (hex / rgb / hsl, with alpha when enabled); a disabled picker is excluded from
  submission, matching a native disabled control. `useColorPicker` gains a `value` accessor — the canonical
  current color in the emitted format — to back it. Purely additive: behavior is unchanged unless you pass `name`.

## 1.0.0-alpha.14

### Minor Changes

- 0b377dc: The **Svelte adapter** (`@oriui/headless/svelte`) now mirrors the Vue seam: `useCombobox` / `useMenu`
  resolve through the OriHeadless context (`getHeadless()?.combobox ?? nativeCombobox`) with the native
  `core` adapter as the default — so a Svelte app can swap a custom / Zag-backed combobox / menu engine via
  `provideHeadless()`, at parity with the Vue side. Adds `ComboboxControl` / `ComboboxAdapter` /
  `MenuControl` / `MenuAdapter` (Svelte `Readable` shapes), `combobox?` / `menu?` on the Svelte
  `HeadlessAdapters`, and `nativeCombobox` / `nativeMenu` exports. Behavior is unchanged when no adapter is
  registered.
- 55a7579: **Combobox and Menu are now genuinely swappable** behind the `OriHeadless` contract, matching Dialog and
  Disclosure. `useCombobox` / `useMenu` previously imported the core state machine directly (no swap seam),
  so the "swappable adapters" promise was true only for the overlays. They now resolve through
  `inject(ORI_HEADLESS)` with the in-house `core` adapter as the default — so an app can provide a custom /
  Zag-backed `combobox` / `menu` engine via `provideHeadless()` / the `OriHeadless` plugin without touching
  component markup.

    Adds to the public contract: `ComboboxControl` / `ComboboxAdapter` / `MenuControl` / `MenuAdapter` types,
    `combobox?` / `menu?` on `HeadlessAdapters`, and `nativeCombobox` / `nativeMenu` (the default adapters).
    Behavior is unchanged when no adapter is registered — native is the default.

- 924018a: `resolveRovingIndex` (core) gains an optional `isEnabled(index)` predicate: when supplied it **skips**
  indices it rejects, scanning on in the intent's direction — the Tabs / RadioGroup model — while the
  default (no predicate) keeps the toolbar's single-step behavior that **visits** disabled items. `OriTabs`
  now composes the shared `rovingIntent` / `resolveRovingIndex` core helpers instead of hand-rolling its
  roving math; behavior is unchanged and the flagship Toolbar is untouched.

### Patch Changes

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

## 1.0.0-alpha.13

### Minor Changes

- 8af0a98: ColorPicker — an accessible, dependency-free color picker.

    - **`@oriui/vue`**: `OriColorPicker` — an inline panel with a 2D saturation×brightness area, a hue slider (reusing OriSlider), an optional alpha slider, a hex field (reusing OriInput), optional preset swatches (a roving listbox), and an optional eyedropper. `v-model` is a lowercase color string; `format` selects `hex` / `rgb` / `hsl`; `alpha` adds a checkerboard slider + `#rrggbbaa` output; `eyedropper` shows a feature-detected pick-from-screen trigger (hidden where unsupported); `update:modelValue` streams live and `change` commits once per interaction (one undo entry), like OriSlider. Slots: `#swatch`, `#preset`. Compose it into `OriPopover` for a swatch-triggered flow.
    - **`@oriui/headless`**: `useColorPicker` (Vue) — the compositional behaviour over a new zero-dependency sRGB color engine (`hex↔rgb↔hsv↔hsl`, loose parse of hex / `rgb()` / `hsl()` incl. alpha, WCAG-luminance ink) and 2D-area math, kept out of the core `.` budget (reachable only from `./vue`). The 2D area is two visually-hidden native `<input type="range">` (one per axis) — real `role="slider"`, focus, and value announcements, with the arrow keys routed in 2D.

    Deferred to a later version (all additive): a user-facing format switcher, per-channel numeric inputs, a built-in recent-colors buffer, a color wheel, and a Svelte binding.

## 1.0.0-alpha.12

## 1.0.0-alpha.11

### Minor Changes

- 095aef0: Toolbar — a flagship WAI-ARIA toolbar (https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/).

    - **`@oriui/headless`**: a new compositional roving-tabindex primitive — `useToolbar` / `useToolbarItem` / `useToolbarOrientation` / `useToolbarToggleGroup` / `useToolbarToggleItem` (Vue **and** Svelte adapters), plus framework-agnostic roving helpers (`rovingIntent` / `resolveRovingIndex`) in the core. Real DOM focus, one tab stop, arrow navigation by orientation with wrap, Home/End, RTL, and a composite-child guard (a slotted slider/textbox keeps its own arrows).
    - **`@oriui/vue`**: five styled components — `OriToolbar` (required accessible name, `orientation` / `loop` / `dir`), `OriToolbarButton` (`pressed`→aria-pressed toggles, focusable-disabled per the APG, and a baked `tooltip` that wires `aria-describedby` onto the real button), `OriToolbarSeparator` (perpendicular), and `OriToolbarToggleGroup` / `OriToolbarToggleItem` (single/multiple, `v-model`).

## 1.0.0-alpha.10

### Minor Changes

- c026ffc: **New: a theme controller that fixes runtime light/dark switching.** `@oriui/headless` now ships `applyTheme`,
  `createThemeController` (core), and `useTheme` (Vue + Svelte) for setting the active theme, with `auto` (live OS
  scheme) and persistence built in.

    They exist because toggling the `ori-theme_dark` class at runtime hits a Chromium style-invalidation bug: every
    styled component bakes a resolved role alias into an element-scoped custom property and reads it through a `var()`
    chain, and Chromium can fail to re-resolve that chain when the inherited token changes via an ancestor class
    toggle — so components keep the PREVIOUS theme's colours (fill/tonal backgrounds and role text) until they
    re-render. It is not fixable in CSS (`@property`, literal tones, and reflows were all ineffective). `applyTheme`
    flips the `ori-theme_{light,dark}` class and force-restyles the subtree in the same task (a `display:none`
    round-trip on `document.body`, exposed as `flushThemeInvalidation`), which reliably re-resolves the colours.

    ```ts
    // Vue
    const { resolvedTheme, cycleTheme } = useTheme({ storageKey: 'app-theme', default: 'auto' })

    // or low-level, in your own store / vanilla:
    import { applyTheme } from '@oriui/headless'
    applyTheme(isDark ? 'dark' : 'light') // instead of a bare classList.toggle
    ```

    Consumers that switch themes at runtime should apply the theme through these (or add the flush wherever they flip
    the class). No breaking changes — purely additive.

## 1.0.0-alpha.9

## 1.0.0-alpha.8

## 1.0.0-alpha.7

## 1.0.0-alpha.6

### Patch Changes

- 37ebed5: Ship `src` alongside `dist` so the published declaration maps (`.d.ts.map`) and JS sourcemaps
  (`.js.map`) resolve to real files. Before this, `files` shipped only `dist`, so every map pointed at a
  `../src/…` source that wasn't in the package — go-to-definition (and JS debugging) dead-ended, and some
  editors (notably WebStorm) degraded a component's model while chasing the missing source. Now
  go-to-definition on an `Ori*` component or a headless composable lands on the real, commented source.
  The `exports` map still routes all imports to `dist`; the extra `src` files are inert.

## 1.0.0-alpha.5

## 1.0.0-alpha.4

### Minor Changes

- 6481f5a: Token bridge: read RESOLVED `--ori-*` design tokens from JS — for consumers that paint outside the
  CSS cascade (Konva/canvas/WebGL, charts) but must follow the active skin. The core gains
  `resolveToken` (a hidden color-probe that forces `var()` substitution — `getComputedStyle().getPropertyValue('--x')`
  only returns the unresolved chain) and `observeTheme` (skin class/style mutations + OS scheme flips);
  the Vue and Svelte adapters gain the theme-reactive `useToken` / `useThemeColor` composables on top.
  Colors-only MVP: the probe reads through the `color` property, so tokens must resolve to a `<color>`.

    In dev builds, a token that fails to resolve against a real `document` warns once per token (naming
    the colors-only probe as the likely cause for non-color tokens), so the silent `''` no longer
    conflates SSR/pre-mount with a genuinely unresolvable token; the branch is `NODE_ENV`-guarded and
    stripped from production bundles.

## 1.0.0-alpha.3

### Minor Changes

- c9d1ec3: Add `@oriui/headless/svelte` — a Svelte 5 adapter at full parity with `./vue`
  (`useDisclosure` / `useDialog` / `useCombobox` / `useMenu` + `provideHeadless`), built on the shared
  framework-agnostic core. Returns Svelte stores (`readable` / `derived`) with lowercased event handlers;
  `svelte ^5` is an optional peer. Same behavior, per-framework reactive wrapper. `useCombobox` / `useMenu`
  accept `MaybeReactive` options (a plain object or a store) so a changing option list / `disabled` reacts.

## 1.0.0-alpha.2

### Minor Changes

- 696c678: Restructure and rename the packages. The styled components move from the repo root (`@oriui/ui`) into
  `@oriui/vue`; the headless layer consolidates `@oriui/core` and the old `@oriui/vue` into a single
  `@oriui/headless` package — `@oriui/headless` is the framework-agnostic engine, `@oriui/headless/vue`
  the Vue composables (a `@oriui/headless/svelte` adapter can follow). `@oriui/css` is unchanged. The
  old `@oriui/ui`, `@oriui/core`, and the old `@oriui/vue` (headless) package names are retired.
