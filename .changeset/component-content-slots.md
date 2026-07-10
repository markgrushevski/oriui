---
'@oriui/vue': minor
---

Content slots across the catalog — pass a rich node anywhere a string prop used to be the only option (all additive; the prop stays as the slot fallback).

- **Toolbar icons**: `OriToolbarButton` and `OriToolbarToggleItem` now forward a default slot to the underlying `OriButton`, so you can slot any icon source (a component, a multi-path SVG) instead of only the single-path `icon` string.
- **Rich content slots** following the `OriCard` / `OriAlert` idiom (`<slot name="x">{{ prop }}</slot>`):
    - `OriCheckbox` / `OriSwitch` — default label slot (an inline link in a consent label).
    - `OriTabs` — `#tab` scoped slot for trigger content (icon + count badge).
    - `OriCombobox` — `#option` (scoped: `{ item, index, selected }`) + `#empty`.
    - `OriRadioGroup` — `#option` (scoped: `{ option }`) for card-style radios.
    - `OriAccordion` — `#title` (scoped: `{ item }`) header content.
    - `OriField` — `#label` / `#hint` / `#error` (the error/hint slots stay wired to `aria-describedby` / `aria-invalid`).
    - `OriBadge` — `#content` (a slotted badge keeps its place in the a11y tree).
    - `OriAvatar` — `#fallback` (imageless fallback) + `#title` / `#subtitle`.
    - `OriTag` — `#prepend` / `#append` decorator slots.
    - `OriToast` — `#icon` / `#title`.
- **Fixes**: `OriCombobox` (input) and `OriMenu` (content) now compose caller listeners with `mergeProps` instead of an object spread — a caller's `@input` / `@keydown` was previously silently dropped by the component's own handlers.
