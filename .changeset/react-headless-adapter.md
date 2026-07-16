---
'@oriui/headless': minor
---

**New React adapter (`@oriui/headless/react`) — first slice.** The framework-agnostic core now drives a
third framework: React joins Vue and Svelte behind the same behaviour engine. This slice ships two
representative hooks proving both contract shapes — **`useDisclosure`** (machine-driven, bridged to React
via `useSyncExternalStore`, SSR-safe) and **`useTabs`** (data-driven WAI-ARIA tabs with automatic
activation) — plus the adapter toolchain: the `./react` export, an optional `react` peer (`^18 || ^19`),
`OriHeadlessProvider` / `useHeadless` for adapter selection, a React `normalizeProps`, and the `useService`
machine bridge. Prop bags carry React-native casing (`onClick` / `onKeyDown` / `tabIndex`). The remaining
hooks land in a follow-up. Note: `@oriui/css` already works in React / Next today — it is framework-free
`.ori-*` classes plus tokens, no adapter required.
