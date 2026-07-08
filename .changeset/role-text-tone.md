---
'@oriui/css': minor
---

**Role colours are now AA-safe as text.** The non-fill button variants (`text` / `outline` / `tonal`), the selected tab, alert, tag, link, and the selected combobox option previously painted the raw role colour as their label — where a saturated or light role (amber `warn` ≈ 2.14:1, the pale `secondary`) failed WCAG AA 4.5:1 on the surface. They now read a new derived on-surface tone, `--ori-color-<role>-text` (exposed to components as `--ori-color-text`), guaranteed ≥ 4.5:1 for every role across all skins and both themes — verified in real Chromium (`e2e/text-contrast.spec.ts`).

The tone derives from the role via `color-mix(in oklch, var(--ori-color-<role>), var(--ori-color-on-surface) 65%)`, so a custom skin or brand override gets an AA text tone automatically, and it stays fully overridable (at `:root`, per skin, or per instance) — the sanctioned replacement for the `.ori-button { --ori-color: … }` workaround. Fills are unchanged (dark on-colour ink on the solid fill). The tonal hover/active tint was softened (35% → 30%) so its text stays AA.
