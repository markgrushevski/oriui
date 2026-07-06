---
'@oriui/css': minor
---

The size/font token scales are now **rem** instead of px — visually identical at default browser
settings (exact 16px-baseline equivalents: `--ori-size-action_md` 44px → `2.75rem`, gap/radius md
8px → `0.5rem`, `--ori-font-size_md` 16px → `1rem`, ±2px steps → `0.125rem`), and components now
scale with the user's browser font-size preference, not only with zoom. Text-relative `em` values
are untouched, and hairline borders, shadows, the `9999px` pill cap, and the screen breakpoints
deliberately stay px.

Note for consumers using the `html { font-size: 62.5% }` trick: oriUI components now follow that
root — as rem is designed to — so at 62.5% they render at 0.625× until you account for it.
