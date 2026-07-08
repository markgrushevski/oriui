---
'@oriui/css': minor
'@oriui/vue': patch
---

**Neutral preset skin** — pure neutral grays with a monochrome accent (ink primary on white / near-white on near-black), for tool-like apps where colour belongs to the content, not the chrome. Applied via `data-ori-skin="neutral"`. All role pairings clear WCAG AA (min 12:1).

**Tooltip fix.** The bubble now self-pairs its colours: a dedicated neutral chip by default (`--ori-neutral-900`/`-50`, ~17:1), or a role's own `--ori-color` / `--ori-color-on` pair when a `color` is set. Previously the bubble read `var(--ori-color, …)` where `--ori-color` is globally `currentColor`, so the neutral fallback never fired and bg + text collapsed to the same colour — invisible (dark-on-dark) on ink-heavy hosts. The bubble also now floats on the shared `.ori-anchored` primitive (`position: fixed` + collision-aware flip via `position-try`), escaping clipped/overflow-hidden containers.

Standalone `@oriui/css` note: the per-side placement classes `ori-tooltip__bubble_{top,bottom,left,right}` are replaced by `ori-anchored ori-anchored_<placement>` (the same 12-value grid the popover/menu use). `@oriui/vue`'s `OriTooltip` emits the new classes automatically — no consumer change needed there.

Tooling: the design-token contrast guard now computes WCAG ratios with colord's a11y plugin and parses both legacy and space-separated `hsl()` token values.
