---
'@oriui/css': patch
---

**CSS layer: token hygiene, plus the two places the paint ignored the writing direction.**

**`.ori-shadow` is removed.** The library's only shadow class hardcoded two literal `rgb(0 0 0 / …)`
layers, so it was not theme-aware, carried no value suffix, and could never grow the `_sm`/`_md`/`_lg`
siblings that `--ori-shadow-{sm,md,lg,ring}` (themes/\_themes-elevation.css) has had all along. It
appeared in no component, no doc page and no test, so there is no compat story to preserve and
freezing an off-axis public class into 1.0 is the worse trade. Read the elevation tokens in your own
`box-shadow` instead. `.ori-safe-area*` is untouched.

**The slider's painted track now follows the engine under RTL.** Chromium reverses a native
`<input type=range>` when the direction is RTL — a click a quarter in from the physical left resolves
to a value ≥ 50 — but every author-drawn track still painted `to right`, so the fill, the hue spectrum
and the alpha ramp all sat on the opposite side from their own thumb. The axis is now a
`--ori-slider-axis` knob that a `.ori-slider:dir(rtl)` rule repoints, and all three tracks read it.
Measured in real Chromium (`e2e/rtl.spec.ts` samples the painted pixels, since Chrome does not report
author styles for `::-webkit-slider-runnable-track`); the spec's deliberate `test.fail` is now a real
assertion, and the hue and alpha tracks are pinned alongside it.

**A toast now enters off the edge its toaster is pinned to.** `transform: translateX(20px)` slid every
toast in from the right whatever the corner and whatever the direction. The offset comes from
`--ori-toast-enter-x`, which each corner modifier sets physically — the corner names a _screen_ corner
and deliberately does not mirror — so left corners enter from the left, right corners from the right,
and a centred toaster does not slide sideways at all. Only a corner-less `.ori-toaster` has no edge to
follow, so that one case reads the writing direction.

**`--ori-card-padding`** joins the local-token idiom (`--ori-tooltip-radius`, `--ori-color-picker-radius`).
`.ori-card` pinned its outer padding straight to the raw `--ori-size-gap_xl` scale token while reading
the `--ori-size-gap` alias for its own rows, so the card's inset could not be retuned without moving
the whole gap scale. Same computed default (16px), one knob.

**`--ori-checker-1` / `--ori-checker-2` are now declared on `.ori-slider` as well**, not only inside
`.ori-color-picker`. `.ori-slider .ori-slider_alpha` is reachable without a colour picker, and a block
must not read a token another block owns: a standalone alpha slider fell through to the hardcoded
`#c8c8c8`/`#fff` grid, which is glaring on a dark page. It now gets the same theme-derived mid-neutrals
the picker does. Nested inside a picker nothing changes.

**Dead `var(--ori-color, …)` fallbacks are gone** from the slider and colour-picker blocks.
`--ori-color` is declared unconditionally at `:root` as `currentColor`, so the fallback arm could never
fire — and the ones that named a colour were also misleading: an alpha track with no inline colour
paints the **primary accent**, and an unset swatch paints **`currentcolor`** (white here, via the
swatch's own `color`), never the `#000000` the fallback advertised. `--ori-ink` and `--ori-hue` keep
their fallbacks: nothing declares those globally, so those arms are live.
