---
'@oriui/headless': minor
---

**`useColorPicker` now ships a Svelte twin** (`@oriui/headless/svelte`) — the last behaviour composable
without one. It mirrors the Vue contract 1:1 over the same zero-dependency `core/color-picker` engine
(sRGB + 2D-area math), returning Svelte stores: `Readable` prop-bags, stores-of-functions for
`getChannelInputProps` / `getPresetProps`, lowercased event handlers, the internal HSVA in a `writable`
with the same echo-guard, and `eyedropperSupported` as an SSR-safe `readable`. Every headless behaviour is
now available for **both Vue and Svelte**.
