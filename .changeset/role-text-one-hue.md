---
'@oriui/css': minor
---

**Role-as-text is now the same hue as the fill — a darker/lighter shade, not a muddy off-hue.** The
`--ori-color-<role>-text` tone (used by the non-fill button variants, the selected tab, alert, tag, link and the
selected combobox option) is now derived by **relative colour that keeps the role's hue + saturation and clamps
only lightness** — `oklch(from var(--ori-color-<role>) min(l, 0.42) c h)` in light, `max(l, 0.86)` in dark —
instead of the previous `color-mix` toward the neutral ink, which desaturated it into a muddy, off-hue colour that
no longer matched the role's fill and border. Text / outline / tonal now read as the same colour as the fill, only
darker (light theme) or lighter (dark theme): one hue, only lightness varies.

The **outline** variant's border now uses that same text tone (was the raw role), so an outline button is one
colour (border = label) and the border clears the 3:1 non-text bar for pale roles too.

Still WCAG AA (>= 4.5:1) for every role across all skins, both themes, and every text kind including the tonal
hover/active tint (min ~4.55:1), and still fully overridable via `--ori-color-<role>-text`. The tone tokens are
now declared per theme block, so they also track a subtree `.ori-theme_dark` / `.ori-theme_light` and a consumer's
unlayered `--ori-color` theme override.
