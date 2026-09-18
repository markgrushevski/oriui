---
'@oriui/headless': patch
'@oriui/vue': patch
---

**Injection keys survive a duplicated package**, and the **adapter-swap contract is written down**.

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
