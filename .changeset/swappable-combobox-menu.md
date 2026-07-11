---
'@oriui/headless': minor
---

**Combobox and Menu are now genuinely swappable** behind the `OriHeadless` contract, matching Dialog and
Disclosure. `useCombobox` / `useMenu` previously imported the core state machine directly (no swap seam),
so the "swappable adapters" promise was true only for the overlays. They now resolve through
`inject(ORI_HEADLESS)` with the in-house `core` adapter as the default — so an app can provide a custom /
Zag-backed `combobox` / `menu` engine via `provideHeadless()` / the `OriHeadless` plugin without touching
component markup.

Adds to the public contract: `ComboboxControl` / `ComboboxAdapter` / `MenuControl` / `MenuAdapter` types,
`combobox?` / `menu?` on `HeadlessAdapters`, and `nativeCombobox` / `nativeMenu` (the default adapters).
Behavior is unchanged when no adapter is registered — native is the default.
