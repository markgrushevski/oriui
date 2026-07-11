---
'@oriui/headless': minor
---

The **Svelte adapter** (`@oriui/headless/svelte`) now mirrors the Vue seam: `useCombobox` / `useMenu`
resolve through the OriHeadless context (`getHeadless()?.combobox ?? nativeCombobox`) with the native
`core` adapter as the default — so a Svelte app can swap a custom / Zag-backed combobox / menu engine via
`provideHeadless()`, at parity with the Vue side. Adds `ComboboxControl` / `ComboboxAdapter` /
`MenuControl` / `MenuAdapter` (Svelte `Readable` shapes), `combobox?` / `menu?` on the Svelte
`HeadlessAdapters`, and `nativeCombobox` / `nativeMenu` exports. Behavior is unchanged when no adapter is
registered.
