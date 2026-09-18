---
'@oriui/headless': patch
---

Headless adapter polish — the reactive options a composable advertises are now actually re-read, and
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
