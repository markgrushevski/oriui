---
'@oriui/headless': minor
'@oriui/vue': minor
---

**New headless `useTabs` composable (Vue + Svelte).** The WAI-ARIA tabs behaviour — automatic-activation
roving tabindex, defensive selection resolution (recovers to the first enabled tab), and the
tablist / tab / tabpanel ARIA prop bags — now lives in `@oriui/headless`: `useTabs` ships from both
`@oriui/headless/vue` (returning computeds) and `@oriui/headless/svelte` (returning stores), reusing the
shared `core/roving` index math with its skip-disabled predicate. `OriTabs` is rewritten to consume it —
**identical DOM, classes, and keyboard** — closing the last styled component that hand-rolled its behaviour
instead of sitting on a headless core. Additive: a new optional `label` prop on `OriTabs` (and
`label` / `labelledby` options on `useTabs`) names the tablist via `aria-label` / `aria-labelledby`, which
WAI-ARIA recommends.
