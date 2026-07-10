---
'@oriui/css': patch
---

Fix two CSS-layer bugs surfaced by a toolbar migration.

- **Toolbar pressed fill** now actually paints. The `[aria-pressed="true"]` tint was routed through `--ori-variant-bg-color`, but `.ori-variant_text` / `_plain` / `_outline` re-set that token to `transparent` in the later `ori.utilities` layer (which beats `ori.components` regardless of specificity), so only the inset ring showed. The tint is now a literal `background-color`, which wins on specificity (the variants set only the token, never `background-color` directly).
- **Button `color` no longer sticks on a runtime recolor.** `.ori-button` transitioned `color`, whose value resolves to a relative-color token (`oklch(from <role> …)`) that browsers don't interpolate — swapping `--ori-color` at runtime (e.g. to tint an icon) left the color stuck until a repaint. `color` is dropped from the transition (no built-in state animates text color), so dynamic recoloring is instant.
