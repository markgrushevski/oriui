---
'@oriui/headless': minor
---

**React adapter — full hook parity (`@oriui/headless/react`).** Completes the React adapter begun by the
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
