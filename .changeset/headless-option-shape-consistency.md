---
'@oriui/headless': patch
---

Headless API consistency — one declaration per option shape, one rule for how options are passed, and
the toggle group's missing `deselectable`.

**`useToolbarToggleGroup` gains `deselectable`.** `type: 'single'` was unconditionally
deselectable — pressing the active item always cleared it — so a tool picker that must always have a
tool was impossible, and its only consumer guarded it by hand. `deselectable` defaults to `true`, which
is exactly today's behaviour and the Radix default the JSDoc always claimed; `false` guarantees a
non-empty selection and means the same thing under `type: 'multiple'` (the last remaining value cannot
be removed), so it is never a silently-ignored prop. A refused press now fires no `onChange` at all,
rather than re-committing the value the group already holds. Available in all three adapters; the
styled `OriToolbarToggleGroup` does not surface it yet.

**One rule for reactive options.** The rule, now written into the option interfaces
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

**Option shapes are declared once.** `UseTabsOptions` moves into `core` beside `TabItem` and
each adapter re-exports it, and `UseDisclosureOptions` / `UseDialogOptions` / `UseComboboxOptions` /
`UseMenuOptions` are now declared in `core` too and exported from `@oriui/headless` for anyone writing
their own adapter. The toggle group's selection rules likewise move into `core/toolbar` (`resolveToolbarToggle`
/ `isToolbarTogglePressed`), shared verbatim by the three adapters instead of hand-written three times —
which is why the adapter bundles each got ~30 B smaller while core grew 28 B. `tests/adapter-parity.test.ts`
now pins every adapter's option interface to the core declaration in BOTH directions, so a member added on
one side, or re-typed on one side, is a `test:types` failure naming the adapter — key parity alone missed
the second case.

**React's compound-event map is held to the core.** The `onKeydown` → `onKeyDown` allowlist
failed silently: an event the core emits that the map does not know reaches React mis-cased and is
dropped with no error. A new test derives the event list from the core's own `connect()` bags (open and
closed, item getters included), pushes each through the real normalizer onto a real React element and
dispatches the matching native event — so it asserts React actually calls the handler, not merely that
a key is in a table. No behaviour change; the map was complete.
