---
'@oriui/css': patch
---

**Colour correctness sweep** — four defects where a colour could not reach the theme it was rendered
in. Every ratio below is a computed-style measurement in real Chromium over the full cascade, eight
skins × both themes, compositing each translucent layer onto what it actually sits on.

**Subtree theming really works now.** `.ori-theme_dark` / `.ori-theme_light` on a non-root element was
documented as supported and was half-wired. Custom-property substitution resolves where a property is
_declared_, not where it is used, so the derived tones written once in the bare `:root` rule froze to
the root theme and merely inherited into a themed region: a dark region on a light page rendered its
body text at **1.03:1**, and a light region on a dark page rendered ink at **1.13:1**, the danger tone
at **2.06:1** and the primary tone at **1.53:1** — while keeping the dark theme's heavy shadows over a
white surface. The six role `-text` clamps and the neutral `--ori-color-text` default now live in one
derived block selected by `:root, :root.light, .ori-theme_light`, `--ori-color-text` is re-declared in
the dark block, and the elevation shadows gained the same light selector. One block per theme, not two
copies of twenty lines — the duplication is what let the two halves drift apart in the first place.
All eighteen readings across page / dark-subtree / light-subtree now pass at 7.61:1 or better.

**Three blocks baked literal colours no theme could reach.** The tooltip chip was the neutral ramp, so
it measured **1.04–1.11:1** against the dark page it floated over — a chip invisible against its own
backdrop, contradicting the comment above it. It now reads the page inverted (`--ori-color-on-background`
on `--ori-color-background`), which is a contrast-checked pairing by construction: **13.89:1**. The
avatar's `#00000018` tint was a black veil that vanished on a dark page; it derives from the ambient ink
like every other structural neutral. The switch thumb was `#ffffff`: **1.85–2.15:1** against the off
track in light, and **1.13–2.98:1** against the on track in dark. The thumb is the state indicator and
the track changes colour between states, so no single thumb colour can clear WCAG 1.4.11's 3:1 bar for
both — it now pairs with its own track (the ink when off, `--ori-color-on` when on, which is the
contrast-checked partner of the `--ori-color` the track paints). Worst reading is now 4.91:1.

**The invalid-control border was the failing contrast one axis over.** `border-color:
var(--ori-color-danger)` on `[aria-invalid="true"]` in input / select / textarea measured **2.08–2.85:1**
on the dark surfaces, under the 3:1 minimum for a UI-component boundary; the focus ring beside it had
the same problem. Status roles are shared by both themes — one hue, no `-dark` source — so the raw role
is only ever tuned as a fill on the light surface and has nothing to adapt with. Both now read
`--ori-color-danger-text`, the same hue with its lightness clamped per theme, which is the precedent the
outline variant already set. Worst reading is now 6.53:1.

**One mechanism for the structural hairline.** `.ori-surface_bordered` derived its 12% hairline from
`--ori-color-on-surface` while the menu, popover and combobox listbox derived the same hairline from
`currentcolor`. Surface now matches them. It renders byte-identically today (verified across all
sixteen skin/theme combinations) — the point is that one job stops having two answers, and the hairline
follows a `color` the consumer sets. No new public token: naming a neutral/structural token is an API
decision, and `currentcolor` already adapts to theme, skin and ambient colour without one.

Three new guards in the unit suite keep these closed, each with a self-check so a guard that stopped
seeing anything cannot pass silently: a theme-shared status role may not be painted as a border,
outline or focus ring (the four per-theme roles still may, so the colour picker's primary outline stays
legitimate); whatever the dark theme rule declares, the light rule declares too; and a token deriving
from a theme-varying token must itself be theme-scoped. "Theme-varying" is discovered from the
stylesheet, never hand-listed. Against the pre-fix files the guards report 3 failures and 6 offending
declarations; after, none.
