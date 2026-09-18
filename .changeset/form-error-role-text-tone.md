---
'@oriui/css': patch
---

The form blocks' **error message and required marker** now paint `--ori-color-danger-text`, not the raw
`--ori-color-danger` role. The role token is tuned as a fill BACKGROUND (saturated, paired with a
`--ori-color-on-danger` ink); painted straight onto the surface as body text it measured ~2.4:1 on the
dark surface (~2.9:1 on the dark page) — below the WCAG AA 4.5:1 the library advertises, and against the
project's own rule that a role is never body text. Because the status hues are shared across themes, the
dark theme was the failing case in every skin. Ten declarations across `field`, `input`, `select`,
`textarea` and `combobox` (`.ori-*__error` and `.ori-*__required`) now read the AA-safe tone that the
non-fill button variants, the selected tab, Alert, Tag and Link already used. It is the same hue and
chroma with only lightness clamped, so the marker still reads as the same red — slightly darker in light,
legible in dark.

Non-text axes are unchanged: the invalid-state `border-color` and focus ring still ride the raw role
(WCAG 1.4.11, a separate axis).

`tests/tokens.contrast.test.ts` gains a source-derived guard so this cannot silently reopen. The existing
pairings walk a closed role/on-role list, which structurally cannot see a role used as a foreground; the
new check reads every stylesheet in the css package and fails on any `color` declaration — or any
`--ori-color-text` / `--ori-variant-text-color` hand-off — fed a raw role token, naming the offending
`file:line`.
