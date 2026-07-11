---
'@oriui/headless': minor
'@oriui/vue': patch
---

`resolveRovingIndex` (core) gains an optional `isEnabled(index)` predicate: when supplied it **skips**
indices it rejects, scanning on in the intent's direction — the Tabs / RadioGroup model — while the
default (no predicate) keeps the toolbar's single-step behavior that **visits** disabled items. `OriTabs`
now composes the shared `rovingIntent` / `resolveRovingIndex` core helpers instead of hand-rolling its
roving math; behavior is unchanged and the flagship Toolbar is untouched.
