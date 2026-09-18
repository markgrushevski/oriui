---
'@oriui/css': patch
---

**RTL fixes.** Three blocks laid out with physical properties, so they broke under `dir="rtl"`. Now measured by a new real-Chromium geometry guard (`e2e/rtl.spec.ts`) that renders the same markup in both directions.

- **Switch** — the thumb travels on the inline axis via `transform`, which has no logical form, so the checked thumb kept moving physically right in RTL and left the track entirely (measured: 13px outside a 35px track). It now mirrors its travel under `:dir(rtl)`, the same shape as the badge's existing floating-corner rule.
- **Tabs** — the vertical tab list drew its separator with `border-right`, i.e. on its outer edge in RTL, while the selected-tab indicator already used `inset-inline-end`; the two landed on opposite edges. The rule is now `border-inline-end`, so it stays the panel-facing edge in both directions.
- **Divider** — the vertical divider's rule is now `border-inline-start` rather than `border-left`. Intent-only: the pseudo is a zero-width box, so it occupies the identical slot either way.

No API or class-name change; LTR rendering is byte-identical.
